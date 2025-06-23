import type { ToolRegistration } from "@/types/tools.js";
import { type GetPoolsByTokenSchema, getPoolsByTokenSchema } from "./schema.js";

export const getPoolsByToken = async (args: GetPoolsByTokenSchema): Promise<any> => {
  try {
    const { address } = args;
    const url = `https://api.geckoterminal.com/api/v2/networks/flow-evm/tokens/${address}/pools?`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json;version=20230302",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
    }

    const { data = {} } = await res.json();

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Network error: Unable to connect to GeckoTerminal API. Please check your internet connection.`);
    }
    throw new Error(`Error fetching pools by token: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getPoolsByTokenTool: ToolRegistration<GetPoolsByTokenSchema> = {
  name: "get_pools_by_token",
  description: `Get pools list info by evm token contract address on kittypunch dex,
  flow EVM address is 20 bytes long, which is 40 characters long or 42 characters long with 0x prefix.
  NOTE: This is tool for flow EVM chain not flow blockchain.
  `,
  inputSchema: getPoolsByTokenSchema,
  handler: async (args: GetPoolsByTokenSchema) => {
    try {
      const parsedArgs = getPoolsByTokenSchema.parse(args);
      const result = await getPoolsByToken(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      console.error("Error in getPoolsByTokenTool handler:", error);
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
