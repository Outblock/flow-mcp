import type { ToolRegistration } from "@/types/tools.js";
import { type AccountInfoResult, type AccountInfoSchema, accountInfoSchema } from "./schema.js";
import { buildBlockchainContext } from "@/utils/context";

import cdcAccountInfoScript from "@/cadence/scripts/standard/get-account-info.cdc?raw";

/**
 * Get detailed account information including balance and storage stats
 * @param args - The arguments for the function
 * @returns Account information including balances and storage stats
 */
export const getAccountInfo = async (args: AccountInfoSchema): Promise<AccountInfoResult> => {
  const { address, network = "mainnet" } = args;

  // Build the blockchain context
  const ctx = await buildBlockchainContext(network);

  try {
    // Execute the Cadence script
    const response = await ctx.connector.executeScript<AccountInfoResult | undefined>(
      cdcAccountInfoScript,
      (arg, t) => [arg(address, t.Address)],
      undefined,
    );

    if (!response) {
      throw new Error("Not found");
    }

    return {
      address: response.address,
      balance: response.balance,
      availableBalance: response.availableBalance,
      storageUsed: response.storageUsed,
      storageCapacity: response.storageCapacity,
      storageFlow: response.storageFlow,
    };
  } catch (error) {
    throw new Error(`Error fetching account info: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const accountInfoTool: ToolRegistration<AccountInfoSchema> = {
  name: "get_account_info",
  description:
    "Get detailed account information including balance and storage stats for a Flow address on flow blockchain, the flow address is 16 characters long or 18 characters long with 0x prefix",
  inputSchema: accountInfoSchema,
  handler: async (args: AccountInfoSchema) => {
    try {
      const parsedArgs = accountInfoSchema.parse(args);
      const result = await getAccountInfo(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error in accountInfoTool handler:", error);
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
