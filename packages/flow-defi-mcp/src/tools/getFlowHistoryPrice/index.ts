import type { ToolRegistration } from "@/types/tools.js";
import { type GetTrendingPoolsSchema, getTrendingPoolsSchema } from "./schema.js";

export const getFlowHistoryPrice = async (): Promise<any> => {
  try {
    const baseUrl = "https://data-api.coindesk.com/spot/v1/historical/days";
    const params = {
      market: "binance",
      limit: 180,
      aggregate: 1,
      fill: "true",
      apply_mapping: "true",
      response_format: "JSON",
      instrument: "FLOW-USDT",
    };
    const url = new URL(baseUrl);
    url.search = new URLSearchParams({
      market: params.market,
      limit: params.limit.toString(),
      aggregate: params.aggregate.toString(),
      fill: params.fill,
      apply_mapping: params.apply_mapping,
      response_format: params.response_format,
      instrument: params.instrument,
    }).toString();

    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json;version=20230302",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
    }

    const { Data = [] } = await res.json();
    const prices = Data.map((item: any) => {
      return {
        timestamp: item.TIMESTAMP,
        price: item.CLOSE,
      };
    });
    return prices;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Network error: Unable to connect to CoinDesk API. Please check your internet connection.`);
    }
    throw new Error(`Error fetching flow history price: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const getFlowHistoryPriceTool: ToolRegistration<GetTrendingPoolsSchema> = {
  name: "get_flow_history_price",
  description: "Get flow token history price from binance",
  inputSchema: getTrendingPoolsSchema,
  handler: async () => {
    try {
      const result = await getFlowHistoryPrice();
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      console.error("Error in getFlowHistoryPriceTool handler:", error);
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
