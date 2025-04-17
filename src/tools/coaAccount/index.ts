import type { ToolRegistration } from "@/types";
import { makeJsonSchema } from "@/utils/makeJsonSchema";
import { buildBlockchainContext } from "@/utils/context";
import { type CoaAccountSchema, coaAccountSchema } from "./schema";

import cdcCoaAccountScript from "@cadence/scripts/standard/get-coa-account.cdc?raw";

/**
 * Get the COA account information for a Flow address
 * @param args - The arguments for the function
 * @returns The COA account information
 */
export const getCoaAccount = async (args: CoaAccountSchema): Promise<string> => {
  const { address, network = "mainnet" } = args;

  // Build the blockchain context
  const ctx = await buildBlockchainContext(network);

  // Execute the Cadence script
  const result = await ctx.connector.executeScript<string | undefined>(
    cdcCoaAccountScript,
    (arg, t) => [arg(address, t.Address)],
    undefined,
  );

  if (!result) {
    throw new Error("COA account not found");
  }

  return result;
};

export const coaAccountTool: ToolRegistration<CoaAccountSchema> = {
  name: "get_coa_account",
  description: "Get the COA account information for a Flow address",
  inputSchema: makeJsonSchema(coaAccountSchema),
  zodSchema: coaAccountSchema,
  handler: async (args: CoaAccountSchema) => {
    try {
      const parsedArgs = coaAccountSchema.parse(args);
      const result = await getCoaAccount(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error in coaAccountTool handler:", error);
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