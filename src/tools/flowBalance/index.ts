import type { ToolRegistration } from "@/types/types";
import { type FlowBalanceSchema, flowBalanceSchema } from "./schema";
import * as fcl from '@onflow/fcl';
import { configureFCL } from '@/utils/fclConfig';

/**
 * Get the FLOW balance for a Flow address
 * @param args - The arguments for the function
 * @returns The FLOW balance
 */
export const getFlowBalance = async (args: FlowBalanceSchema): Promise<any> => {
  const { address, network = 'mainnet' } = args;
  
  // Configure network
  configureFCL(network);
  
  const script = `
    import FungibleToken from 0xFungibleToken
    import FlowToken from 0xFlowToken

    access(all) fun checkFlowTokenBalance(address: Address) : UFix64 {
        let account = getAccount(address)
        let vaultRef = account.capabilities.borrow<&{FungibleToken.Balance}>(/public/flowTokenBalance)
            ?? nil
    
        if vaultRef != nil {
            return vaultRef!.balance
        }
    
        return 0.0
    }

    access(all) fun main(address: Address): UFix64 {
        return checkFlowTokenBalance(address: address)
    }
  `;

  const result = await fcl.query({
    cadence: script,
    args: (arg: any, t: any) => [
      arg(address, t.Address)
    ]
  });

  return result;
};

export const flowBalanceTool: ToolRegistration<FlowBalanceSchema> = {
  name: "get_flow_balance",
  description: "Get the FLOW balance for a Flow address",
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