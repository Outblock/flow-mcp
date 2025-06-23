import { FastMCP } from "fastmcp";
import { createTools } from "./tools";
import { createPrompts } from "./prompts";

export function createServer() {
  // Initialize server
  const server = new FastMCP({
    name: "flow-mcp",
    version: "0.1.12",
  });

  // Register all tools
  const tools = createTools();
  for (const tool of tools) {
    server.addTool({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
      execute: async (args, context) => {
        try {
          const result = await tool.handler(args);
          if (typeof result.content[0].text === "string") {
            return result.content[0].text;
          }
          return JSON.stringify(result.content[0].text);
        } catch (err) {
          console.error("Error in tool execution:", err);
          return "Internal server error in tool execution.";
        }
      },
    });
  }

  // Register all prompts
  const prompts = createPrompts();
  for (const prompt of prompts) {
    server.addPrompt({
      name: prompt.name,
      description: prompt.description,
      arguments: prompt.arguments,
      load: async (args) => {
        const result = await prompt.handler(args);
        return result.messages[0].content.text;
      },
    });
  }

  return server;
}

export function startServer(server: FastMCP, useSSE: boolean) {
  if (useSSE) {
    server.start({
      transportType: "sse",
      sse: {
        endpoint: "/sse",
        port: 8080,
      },
    });
  } else {
    server.start({
      transportType: "stdio",
    });
  }
}
