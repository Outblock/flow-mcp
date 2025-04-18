import type { ToolRegistration } from "@/types/types";
import { type CoaAccountSchema, coaAccountSchema } from "./schema";
import * as fcl from '@onflow/fcl';
import * as t from '@onflow/types';
import { configureFCL } from '@/utils/fclConfig';

/**
 * Get the COA account information for a Flow address
 * @param args - The arguments for the function
 * @returns The COA account information
 */
export const getCoaAccount = async (args: CoaAccountSchema): Promise<any> => {
  const { address, network = 'mainnet' } = args;
  
  // Configure network
  configureFCL(network);
  
  const script = `
      import EVM from 0xEVM

      access(all) fun main(address: Address): String {
        let account = getAuthAccount<auth(Storage) &Account>(address)

        let coa = account.storage.borrow<&EVM.CadenceOwnedAccount>(
          from: /storage/evm
        )

        if coa == nil { 
          return ""
        } else {
          let coaAddr = coa?.address() 

          let addrByte: [UInt8] = []

          for byte in coaAddr?.bytes! {
            addrByte.append(byte)
          }

          return String.encodeHex(addrByte)
        }
      }
  `;

  const result = await fcl.query({
    cadence: script,
    args: (arg: any, t: any) => [arg(address, t.Address)]
  });

  return result;
};

export const coaAccountTool: ToolRegistration<CoaAccountSchema> = {
  name: "get_coa_account",
  description: "Get the COA account information for a Flow address",
  inputSchema: coaAccountSchema,
  handler: async (args: CoaAccountSchema) => {
    try {
      const parsedArgs = coaAccountSchema.parse(args);
      const result = await getCoaAccount(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: result,
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