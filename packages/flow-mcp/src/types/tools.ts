import { type CallToolResult, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";

const ToolInputSchema = ToolSchema.shape.inputSchema;
export type ToolInput = z.infer<typeof ToolInputSchema>;

export type ToolRegistration<T> = {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  handler: (args: T) => CallToolResult | Promise<CallToolResult>;
};

export function createTextResponse(text: string): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}
