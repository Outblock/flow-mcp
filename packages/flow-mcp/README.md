# Flow MCP Core Tools

This package provides a set of core tools for interacting with the native Flow blockchain through the Model Context Protocol (MCP).

## Features

- Get native FLOW balance for any address
- Get fungible token balances for any Flow address
- Get Cadence Owned Account (COA) information
- Get contract source code
- Get detailed account information, including storage stats
- List child accounts for a parent address

## Available Tools

- `flow_balance`: Get the native FLOW token balance.
- `token_balance`: Get fungible token balances.
- `coa_account`: Get COA account information.
- `get_contract`: Get contract source code.
- `account_info`: Get detailed account information.
- `child_account`: List child accounts.

## Getting Started

From the root of the monorepo, you can run this package's scripts. Ensure dependencies are installed from the root directory first.

```bash
# From the monorepo root
pnpm --filter flow-mcp <script-name>
```

## License

MIT License - see LICENSE for details.
