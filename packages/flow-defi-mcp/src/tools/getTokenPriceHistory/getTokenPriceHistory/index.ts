import type { ToolRegistration } from "@/types/tools.js";
import { type GetTokenPriceHistorySchema, getTokenPriceHistorySchema } from "./schema.js";

export const getTokenPriceHistory = async (args: GetTokenPriceHistorySchema): Promise<any> => {
  const { poolAddress, timeFrame } = args;
  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/flow-evm/pools/${poolAddress}/priceHistory/${timeFrame}`;

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
    throw new Error(`Error fetching token price history: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getTokenPriceHistoryTool: ToolRegistration<GetTokenPriceHistorySchema> = {
  name: "get_flow_token_price_history",
  description: `
  Get token price history on Flow EVM chain with pool address and time frame
  The flow EVM address is 20 bytes long, which is 40 characters long or 42 characters long with 0x prefix.
  NOTE: This is tool for flow EVM chain not flow blockchain.
  `,
  inputSchema: getTokenPriceHistorySchema,
  handler: async (args: GetTokenPriceHistorySchema) => {
    try {
      const parsedArgs = getTokenPriceHistorySchema.parse(args);
      const result = await getTokenPriceHistory(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      console.error("Error in getTokenPriceHistoryTool handler:", error);
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
