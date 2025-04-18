import type { ToolRegistration } from "@/types/types.js";
import { type AccountInfoSchema, type AccountInfoResult, accountInfoSchema } from "./schema.js";
import * as fcl from '@onflow/fcl';
import { configureFCL } from '@/utils/fclConfig';
import { z } from 'zod';
const accountInfoScript = `
access(all) struct Result {
  access(all) let address: Address
  access(all) let balance: UFix64
  access(all) let availableBalance: UFix64
  access(all) let storageUsed: UInt64
  access(all) let storageCapacity: UInt64
  access(all) let storageFlow: UFix64

  init(
    address: Address,
    balance: UFix64,
    availableBalance: UFix64,
    storageUsed: UInt64,
    storageCapacity: UInt64,
    storageFlow: UFix64,
  ) {
    self.address = address
    self.balance = balance
    self.availableBalance = availableBalance
    self.storageUsed = storageUsed
    self.storageCapacity = storageCapacity
    self.storageFlow = storageFlow
  }
}

access(all) fun main(address: Address): Result {
  let account = getAccount(address)
  return Result(
    address: account.address,
    balance: account.balance,
    availableBalance: account.availableBalance,
    storageUsed: account.storage.used,
    storageCapacity: account.storage.capacity,
    storageFlow: account.balance - account.availableBalance
  )
}`;

/**
 * Get detailed account information including balance and storage stats
 * @param args - The arguments for the function
 * @returns Account information including balances and storage stats
 */
export const getAccountInfo = async (args: AccountInfoSchema): Promise<AccountInfoResult> => {
  const { address, network = 'mainnet' } = args;

  // Configure FCL for the specified network
  configureFCL(network);

  try {
    // Execute the Cadence script
    const response = await fcl.query({
      cadence: accountInfoScript,
      args: (arg, t) => [arg(address, t.Address)],
    });

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
  description: "Get detailed account information including balance and storage stats for a Flow address",
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