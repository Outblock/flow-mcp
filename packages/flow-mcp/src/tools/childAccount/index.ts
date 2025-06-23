import type { ToolRegistration } from "@/types/tools.js";
import { type ChildAccountSchema, type ChildAccountResult, childAccountSchema } from "./schema.js";
import { buildBlockchainContext } from "@/utils/context";

import cdcChildAccountScript from "@/cadence/scripts/standard/get-child-account.cdc?raw";

/**
 * Get child accounts for a Flow address
 * @param args - The arguments for the function
 * @returns Object mapping child addresses to their account information
 */
export const getChildAccount = async (args: ChildAccountSchema): Promise<ChildAccountResult> => {
  const { address, network = "mainnet" } = args;

  // Build the blockchain context
  const ctx = await buildBlockchainContext(network);

  try {
    // Execute the Cadence script
    const response = await ctx.connector.executeScript<ChildAccountResult>(
      cdcChildAccountScript,
      (arg, t) => [arg(address, t.Address)],
      {},
    );

    return response;
  } catch (error) {
    throw new Error(`Error fetching child accounts: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const childAccountTool: ToolRegistration<ChildAccountSchema> = {
  name: "get_child_account",
  description:
    "Get child accounts for a Flow address on flow blockchain, the flow address is 16 characters long or 18 characters long with 0x prefix",
  inputSchema: childAccountSchema,
  handler: async (args: ChildAccountSchema) => {
    try {
      const parsedArgs = childAccountSchema.parse(args);
      const result = await getChildAccount(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error in childAccountTool handler:", error);
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
