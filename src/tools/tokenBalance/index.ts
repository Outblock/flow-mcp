import type { ToolRegistration } from "@/types/types";
import { type TokenBalanceSchema, tokenBalanceSchema } from "./schema";
import * as fcl from '@onflow/fcl';
import { configureFCL } from '@/utils/fclConfig';

/**
 * Get the balance of a specific token for a Flow address
 * @param args - The arguments for the function
 * @returns The token balance
 */
export const getTokenBalance = async (args: TokenBalanceSchema): Promise<any> => {
  const { address, network = 'mainnet' } = args;
  
  // Configure network
  configureFCL(network);
  
  const script = `
    import FungibleToken from 0xFungibleToken

    /// Queries for FT.Vault balance of all FT.Vaults in the specified account.
    ///
    access(all) fun main(address: Address): {String: UFix64} {
        // Get the account
        let account = getAuthAccount<auth(BorrowValue) &Account>(address)
        // Init for return value
        let balances: {String: UFix64} = {}
        // Track seen Types in array
        let seen: [String] = []
        // Assign the type we'll need
        let vaultType: Type = Type<@{FungibleToken.Vault}>()
        // Iterate over all stored items & get the path if the type is what we're looking for
        account.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
            if !type.isRecovered && (type.isInstance(vaultType) || type.isSubtype(of: vaultType)) {
                // Get a reference to the resource & its balance
                let vaultRef = account.storage.borrow<&{FungibleToken.Balance}>(from: path)!
                // Insert a new values if it's the first time we've seen the type
                if !seen.contains(type.identifier) {
                    balances.insert(key: type.identifier, vaultRef.balance)
                } else {
                    // Otherwise just update the balance of the vault (unlikely we'll see the same type twice in
                    // the same account, but we want to cover the case)
                    balances[type.identifier] = balances[type.identifier]! + vaultRef.balance
                }
            }
            return true
        })

        // Add available Flow Token Balance
        balances.insert(key: "availableFlowToken", account.availableBalance)

        return balances
    }
  `;

  const result = await fcl.query({
    cadence: script,
    args: (arg: any, t: any) => [
      arg(address, t.Address)
    ]
  });

  return {
    balance: result,
    address
  };
};

export const tokenBalanceTool: ToolRegistration<TokenBalanceSchema> = {
  name: "get_token_balance",
  description: "Get the balance of a specific token for a Flow address",  
  inputSchema: tokenBalanceSchema,
  handler: async (args: TokenBalanceSchema) => {
    try {
      const parsedArgs = tokenBalanceSchema.parse(args);
      const result = await getTokenBalance(parsedArgs);
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