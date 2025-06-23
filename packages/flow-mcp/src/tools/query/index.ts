import type { ToolRegistration } from "@/types/tools";
import { buildBlockchainContext } from "@/utils/context";
import { type QuerySchema, querySchema } from "./schema";

/**
 * Execute a custom Cadence script on the Flow blockchain
 * @param args - The arguments for the function
 * @returns The result of the script execution
 */
export const executeQuery = async (args: QuerySchema) => {
  const { script, args: scriptArgs = [], network = "mainnet" } = args;

  // Build the blockchain context
  const ctx = await buildBlockchainContext(network);

  // Execute the Cadence script
  const result = await ctx.connector.executeScript<any>(
    script,
    (arg, t) =>
      scriptArgs.map((value, index) => {
        // Handle different argument types
        if (typeof value === "string" && value.startsWith("0x")) {
          return arg(value, t.Address);
        }
        if (typeof value === "number") {
          return arg(value.toString(), t.UFix64);
        }
        return arg(value, t.String);
      }),
    undefined,
  );

  if (result === undefined) {
    throw new Error("Script execution failed");
  }

  return result;
};

export const queryTool: ToolRegistration<QuerySchema> = {
  name: "execute_query",
  description: "Execute a custom Cadence script on the Flow blockchain",
  inputSchema: querySchema,
  handler: async (args: QuerySchema) => {
    try {
      const parsedArgs = querySchema.parse(args);
      const result = await executeQuery(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      console.error("Error in queryTool handler:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  },
};
