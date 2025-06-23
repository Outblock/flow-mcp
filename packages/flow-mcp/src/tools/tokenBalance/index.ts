import type { ToolRegistration } from "@/types/tools";
import { type TokenBalanceSchema, tokenBalanceSchema } from "./schema";
import { buildBlockchainContext } from "@/utils/context";

import cdcGetFtBalancesScript from "@/cadence/scripts/standard/get-ft-balances.cdc?raw";

/**
 * Get the balance of a specific token for a Flow address
 * @param args - The arguments for the function
 * @returns The token balance
 */
export const getTokenBalances = async (args: TokenBalanceSchema) => {
  const { address, network = "mainnet" } = args;

  // Build the blockchain context
  const ctx = await buildBlockchainContext(network);

  const result = await ctx.connector.executeScript<Record<string, string> | undefined>(
    cdcGetFtBalancesScript,
    (arg, t) => [arg(address, t.Address)],
    undefined,
  );

  if (!result) {
    throw new Error("Failed to get token balances");
  }

  return {
    balances: result,
    address,
  };
};

export const tokenBalanceTool: ToolRegistration<TokenBalanceSchema> = {
  name: "get_token_balances",
  description: `
  Get the balances of all fungible tokens for a Flow address,
  The flow address is 16 characters long or 18 characters long with 0x prefix
  NOTE: This is a flow blockchin tool, not for flow EVM chain.
  `,
  inputSchema: tokenBalanceSchema,
  handler: async (args: TokenBalanceSchema) => {
    try {
      const parsedArgs = tokenBalanceSchema.parse(args);
      const result = await getTokenBalances(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error in tokenBalanceTool handler:", error);
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
