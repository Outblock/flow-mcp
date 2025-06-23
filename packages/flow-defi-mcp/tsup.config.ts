import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/bin/flow-mcp.ts"],
  outDir: "dist",
  sourcemap: true,
  clean: true,
  format: ["esm"], // Ensure you're targeting CommonJS
  platform: "node",
  target: "node14",
  bundle: true,
  splitting: true, // Add this for better code splitting
  dts: true, // Generate declaration files
  loader: {
    ".cdc": "text",
  },
  external: [
    "dotenv", // Externalize dotenv to prevent bundling
    "fs", // Externalize fs to use Node.js built-in module
    "path", // Externalize other built-ins if necessary
    "url", // Externalize url to use Node.js built-in module
    "https", // Externalize https to use Node.js built-in module
    "http", // Externalize http to use Node.js built-in module
    // Add other modules you want to externalize
    "@onflow/fcl",
    "@onflow/types",
    "sha3",
    "elliptic",
    "fastmcp",
    "yargs",
    "zod",
    "zod-to-json-schema",
  ],
});
