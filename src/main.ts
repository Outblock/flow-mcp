#!/usr/bin/env node

// Version is automatically updated during release process
import { FastMCP } from "fastmcp";
import { createTools } from "./tools";
import { createPrompts } from "./prompts";
export const VERSION = "0.1.0";

// Initialize server
const server = new FastMCP({
	name: "Flow MCP",
	version: VERSION,
});

const tools = createTools();

tools.forEach((tool) => {
	server.addTool({
		name: tool.name,
		description: tool.description,
		parameters: tool.inputSchema,
		execute: async (params) => {
			const result = await tool.handler(params);
			if (typeof result.content[0].text === "string") {
				return result.content[0].text;
			  }
			return JSON.stringify(result.content[0].text);
		}
	});
});


const prompts = createPrompts();

prompts.forEach((prompt) => {
	server.addPrompt({
		name: prompt.name,
		description: prompt.description,
		arguments: prompt.arguments,
		load: async (args) => {
			return prompt.handler(args);
		}
	});
});


// Start server
async function runServer() {
	server.start({
		transportType: "stdio",
	  });
	console.error("Flow MCP Server running on stdio");
}

runServer().catch((error) => {
	console.error("Fatal error running server:", error);
	process.exit(1);
});
