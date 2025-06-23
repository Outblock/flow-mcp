# Flow MCP Monorepo

This monorepo contains a collection of Modular Command-line Processors (MCPs) for interacting with the Flow blockchain and its EVM environment.

## Packages

This monorepo is split into two main packages:

- **`packages/flow-mcp`**: Core tools for interacting with the native Flow blockchain. This includes functionalities for managing accounts, checking balances, and interacting with native contracts.
- **`packages/flow-defi-mcp`**: A suite of tools focused on DeFi (Decentralized Finance) and EVM-compatible interactions on the Flow network. This includes tools for checking token prices, swapping tokens on decentralized exchanges, and interacting with ERC20 tokens.

Please refer to the `README.md` file within each package for more detailed information, including setup instructions and a list of available tools.

## Getting Started

To get started with this monorepo, you will need to have a monorepo manager like `pnpm`, `lerna`, or `turborepo` installed.

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the root directory and install the dependencies for all packages:
    ```bash
    pnpm install
    # or yarn install, or npm install
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your changes.
