import type { ToolRegistration } from "@/types/tools";
import { type FlowBalanceSchema, flowBalanceSchema } from "./schema";
import { buildBlockchainContext } from "@/utils/context";

import cdcGetBalanceScript from "@/cadence/scripts/standard/get-balance.cdc?raw";

/**
 * Get the FLOW balance for a Flow address
 * @param args - The arguments for the function
 * @returns The FLOW balance
 */
export const getFlowBalance = async (args: FlowBalanceSchema): Promise<string> => {
  const { address, network = "mainnet" } = args;

  // Build the blockchain context
  const ctx = await buildBlockchainContext(network);

  const result = await ctx.connector.executeScript<string | undefined>(
    cdcGetBalanceScript,
    (arg, t) => [arg(address, t.Address)],
    undefined,
  );

  if (!result) {
    throw new Error("Failed to get FLOW balance");
  }

  return result;
};

export const flowBalanceTool: ToolRegistration<FlowBalanceSchema> = {
  name: "get_flow_balance",
  description: `
  Get the FLOW balance for a Flow address on flow blockchain, 
  the flow address is 16 characters long or 18 characters long with 0x prefix
  NOTE: This is a flow blockchin tool, not for flow EVM chain.
  `,
  inputSchema: flowBalanceSchema,
  handler: async (args: FlowBalanceSchema) => {
    try {
      const parsedArgs = flowBalanceSchema.parse(args);
      const result = await getFlowBalance(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      console.error("Error in flowBalanceTool handler:", error);
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
