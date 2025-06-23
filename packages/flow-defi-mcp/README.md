# Flow DeFi MCP Tools

This package provides a suite of tools focused on DeFi (Decentralized Finance) and EVM-compatible interactions on the Flow network. It is designed to be used with the Model Context Protocol (MCP).

## Features

- Get prices for various tokens on the Flow EVM chain.
- Fetch information about trending and specific liquidity pools from Kittypunch DEX.
- Get historical price data for tokens.
- Get price quotes and execute swaps on Punchswap V2.
- Manage and transfer ERC20 tokens.
- Look up EVM transaction details.

## Available Tools

- `get_token_price`: Get token prices on Flow EVM.
- `get_trending_pools`: Get trending pools on Kittypunch DEX.
- `get_pools_by_token`: Get pools by token address.
- `get_token_info`: Get token information.
- `get_flow_token_price_history`: Get token price history.
- `punchswap_quote`: Get swap quotes from Punchswap V2.
- `punchswap_swap`: Execute swaps on Punchswap V2.
- `get_erc20_tokens`: Get ERC20 token balances.
- `transfer_erc20_token`: Transfer ERC20 tokens.
- `get_evm_transaction`: Get EVM transaction information.
- `get_flow_history_price`: Get FLOW token historical prices from Binance.

## Getting Started

From the root of the monorepo, you can run this package's scripts. Ensure dependencies are installed from the root directory first.

```bash
# From the monorepo root
pnpm --filter flow-defi-mcp <script-name>
```

## License

MIT License - see LICENSE for details.
