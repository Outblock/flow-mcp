import {
	type CallToolResult,
	type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod";

export type ToolRegistration<T> = {
	name: string;
	description: string;
	inputSchema: z.ZodSchema;
	handler: (args: T) => CallToolResult | Promise<CallToolResult>;
};
