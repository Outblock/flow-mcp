import type { ToolRegistration } from "@/types/tools.js";
import { type GetTokenInfoSchema, getTokenInfoSchema } from "./schema.js";

export const getTokenInfo = async (args: GetTokenInfoSchema): Promise<any> => {
  const { address } = args;
  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/flow-evm/tokens/${address}/info`;

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
    throw new Error(`Error fetching token info: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getTokenInfoTool: ToolRegistration<GetTokenInfoSchema> = {
  name: "get_token_info",
  description: "Get token info on Flow EVM chain with token contract address",
  inputSchema: getTokenInfoSchema,
  handler: async (args: GetTokenInfoSchema) => {
    try {
      const parsedArgs = getTokenInfoSchema.parse(args);
      const result = await getTokenInfo(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      console.error("Error in getTokenInfoTool handler:", error);
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
