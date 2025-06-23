import type { ToolRegistration } from "@/types/tools";
import { type GetChannelsSellSchema, getChannelsSellSchema } from "./schema";

/**
 * Supported Channels
 */
export const getChannelsSell = async (args: GetChannelsSellSchema): Promise<string> => {
  // TODO: Implement Noah Business API call
  // Method: GET
  // Path: /channels/sell
  
  console.log('Noah API call:', { method: 'GET', path: '/channels/sell', args });
  
  // This is a placeholder implementation
  return JSON.stringify({
    message: "Noah Business API tool not yet implemented",
    endpoint: "GET /channels/sell",
    args
  });
};

export const getChannelsSellTool: ToolRegistration<GetChannelsSellSchema> = {
  name: "get_channels_sell",
  description: "List of supported channels for selling crypto into fiat.",
  inputSchema: getChannelsSellSchema,
  handler: async (args: GetChannelsSellSchema) => {
    try {
      const parsedArgs = getChannelsSellSchema.parse(args);
      const result = await getChannelsSell(parsedArgs);
      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      console.error("Error in getChannelsSellTool handler:", error);
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
