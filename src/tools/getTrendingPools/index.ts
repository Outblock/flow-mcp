import type { ToolRegistration } from "@/types/tools.js";
import { type GetTrendingPoolsSchema, getTrendingPoolsSchema } from "./schema.js";

export const getTrendingPools = async (): Promise<any> => {
  try {

    const url = "https://api.geckoterminal.com/api/v2/networks/flow-evm/trending_pools";

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json;version=20230302",
      },
    });
    const { data = {} } = res.ok ? await res.json() : {};

    return data;

  } catch (error) {
    throw new Error(`Error fetching contract: ${error instanceof Error ? error.message : String(error)}`);
  }
};


export const getTrendingPoolsTool: ToolRegistration<GetTrendingPoolsSchema> = {
  name: "get_trending_pools",
  description: `
  Get trenidng pools info on kittypunch dex in flow EVM mainnet,
  NOTE: This is tool for flow EVM chain not flow blockchain.
  `,
  inputSchema: getTrendingPoolsSchema,
  handler: async () => {
    try {
      const result = await getTrendingPools();
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      console.error("Error in getTokenPriceTool handler:", error);
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


