import type { ToolRegistration } from "@/types/tools.js";
import { type GetContractSchema, getContractSchema } from "./schema.js";
import { buildBlockchainContext } from "@/utils/context.js";

/**
 * Get the source code of a contract deployed at a specific address
 * @param args - The arguments for the function
 * @returns The contract source code
 */
export const getContract = async (args: GetContractSchema): Promise<string> => {
  const { address, contractName, network = "mainnet" } = args;

  const ctx = await buildBlockchainContext(network);
  await ctx.connector.onModuleInit();
  const fcl = ctx.connector.fcl;

  try {
    // Format address to remove 0x prefix if present
    const formattedAddress = address.replace("0x", "");

    // Get account information which includes contracts
    const account = await fcl.send([fcl.getAccount(formattedAddress)]).then(fcl.decode);

    // Find the specified contract
    const contract = account.contracts[contractName];

    if (!contract) {
      throw new Error(`Contract '${contractName}' not found at address ${address}`);
    }

    return contract;
  } catch (error) {
    throw new Error(`Error fetching contract: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getContractTool: ToolRegistration<GetContractSchema> = {
  name: "get_contract",
  description: "Get the source code of a contract deployed at a specific address on flow blockchain",
  inputSchema: getContractSchema,
  handler: async (args: GetContractSchema) => {
    try {
      const parsedArgs = getContractSchema.parse(args);
      const result = await getContract(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      console.error("Error in getContractTool handler:", error);
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
