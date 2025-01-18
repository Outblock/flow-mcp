# MCP Server Starter

A production-ready starter template for building Model Context Protocol (MCP) servers with TypeScript.

## 🚀 Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start development:
   ```bash
   bun run dev
   ```

## ✨ Key Features

- Bun for fast testing and development
- Biome for linting and formatting
- Automated version management with standard-version
- Clean, maintainable project structure

## 📂 Project Structure

```
mcp-starter/
├── src/
│   ├── tools/          # MCP tools implementation
│   ├── utils/          # Shared utilities
│   ├── main.ts         # Server entry point
│   └── types.ts        # Shared type definitions
├── tests/              # Test files
├── biome.json          # Linting configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```

## ⚙️ Configuration
Coming soon...

## 🛠️ Development

- **Run tests**: `bun test`
- **Format code**: `bun run format`
- **Lint code**: `bun run lint`
- **Build project**: `bun run build`

To add your development MCP server to Claude Desktop:

1. Build the project:
   ```bash
   bun run build
   ```
2. Add to your Claude Desktop config:
   ```json
   // You only need the argument if you need to pass arguments to your server
   {
     "mcpServers": {
       "your-server-name": {
         "command": "node",
         "args": ["/path/to/your/project/dist/main.js", "some_argument"]
       }
     }
   }
   ```

## 📜 Version Management

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) for automated version management. Run `bun run release` to create a new version.

### Commit Message Format
- `feat`: New feature (bumps minor version)
- `fix`: Bug fix (bumps patch version)
- `BREAKING CHANGE`: Breaking change (bumps major version)

## 📦 Publishing to npm

1. Ensure you're logged in to npm:
   ```bash
   npm login
   ```
2. Build the project:
   ```bash
   bun run build
   ```
3. Publish the package:
   ```bash
   npm publish
   ```
Remember to update the version number using `bun run release` before publishing new versions.

## Installing from npm

Add to your Claude Desktop config:
```json
// You only need the argument if you need to pass arguments to your server
{
  "mcpServers": {
    "your-server-name": {
      "command": "npx",
      "args": ["-y", "your-package-name", "some_argument"]
    }
  }
}
