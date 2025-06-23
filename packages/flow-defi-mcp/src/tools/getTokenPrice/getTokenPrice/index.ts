import type { ToolRegistration } from "@/types/tools.js";
import { type GetTokenPriceSchema, getTokenPriceSchema } from "./schema.js";

export const getTokenPrice = async (args: GetTokenPriceSchema): Promise<any> => {
  const { addresses } = args;
  try {
    const url = `https://api.geckoterminal.com/api/v2/simple/networks/flow-evm/token_price/${addresses}`;

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
    const { attributes = {} } = data;
    const { token_prices = {} } = attributes;

    return token_prices;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Network error: Unable to connect to GeckoTerminal API. Please check your internet connection.`);
    }
    throw new Error(`Error fetching token price: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getTokenPriceTool: ToolRegistration<GetTokenPriceSchema> = {
  name: "get_token_price",
  description: `
  Get token price on Flow EVM chain with token contract addresses,
  The flow EVM address is 20 bytes long, which is 40 characters long or 42 characters long with 0x prefix.
  NOTE: This is tool for flow EVM chain not flow blockchain.
  `,
  inputSchema: getTokenPriceSchema,
  handler: async (args: GetTokenPriceSchema) => {
    try {
      const parsedArgs = getTokenPriceSchema.parse(args);
      const result = await getTokenPrice(parsedArgs);
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
