import { type Address, isAddress, encodeFunctionData, erc20Abi, parseUnits } from "viem";
import type { ToolRegistration } from "@/types/tools.js";
import { bigint, z } from "zod";
import { createTextResponse } from "@/types/tools.js";
import { getPublicClient } from "../../utils/evm/viem";
import { ERC20_TOKENS } from "../../utils/evm/supportedErc20Tokens";
import { getErc20TokenSchema, type GetErc20TokenSchema } from "./schema";
// import { flowEVMAccountABI } from '../abis/flowEVMAccount';

/**
 * Formats a token balance according to its decimals
 * @param balance The raw balance as a bigint
 * @param decimals The number of decimals for the token
 * @returns A formatted string representation of the balance
 */
function formatTokenBalance(balance: bigint, decimals: number): string {
  if (balance === 0n) return "0";

  const balanceStr = balance.toString();

  // If the balance is less than 10^decimals, we need to pad with leading zeros
  if (balanceStr.length <= decimals) {
    const paddedBalance = balanceStr.padStart(decimals + 1, "0");
    const integerPart = paddedBalance.slice(0, -decimals) || "0";
    const fractionalPart = paddedBalance.slice(-decimals).replace(/0+$/, "");

    return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
  } else {
    const integerPart = balanceStr.slice(0, balanceStr.length - decimals);
    const fractionalPart = balanceStr.slice(balanceStr.length - decimals).replace(/0+$/, "");

    return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
  }
}

/**
 * Tool for creating a serialized transaction to send FLOW tokens
 */
export const getErc20TokensTool = {
  name: "get_erc20_tokens",
  description: `
  Get all erc20 tokens for an EVM address, the information includes the token name, symbol, contract address, decimals and balance.
  Only Wrapped Flow(WFLOW), Trump(TRUMP), HotCocoa, Gwendolion, Pawderick, Catseye are supported.
  Note: FLOW is not ERC20 token, you should use evm_tool to get the balance of FLOW`,
  inputSchema: getErc20TokenSchema,

  handler: async (params: GetErc20TokenSchema) => {
    try {
      const { address } = params;

      // Validate address format
      if (!isAddress(address)) {
        return createTextResponse(`Invalid address format: ${address}. Must be a valid 0x format address.`);
      }

      const publicClient = getPublicClient();

      // Fetch balances for all tokens
      const tokenResults = await Promise.all(
        Object.entries(ERC20_TOKENS).map(async ([name, tokenInfo]) => {
          try {
            const balance = (await publicClient.readContract({
              address: tokenInfo.contractAddress,
              abi: [
                {
                  name: "balanceOf",
                  type: "function",
                  inputs: [{ name: "owner", type: "address" }],
                  outputs: [{ name: "balance", type: "uint256" }],
                  stateMutability: "view",
                },
              ],
              functionName: "balanceOf",
              args: [address as Address],
            })) as bigint;

            // Format balance according to decimals
            const formattedBalance = formatTokenBalance(balance, tokenInfo.decimals);

            return {
              ...tokenInfo,
              name,
              rawBalance: balance.toString(),
              balance: formattedBalance,
            };
          } catch (error) {
            console.error(`Error fetching balance for ${name}:`, error);
            return {
              ...tokenInfo,
              name,
              rawBalance: "0",
              balance: "0",
              error: error instanceof Error ? error.message : String(error),
            };
          }
        }),
      );

      return createTextResponse(JSON.stringify(tokenResults, null, 2));
    } catch (error) {
      return createTextResponse(
        `Error fetching ERC20 tokens: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

export const transferErc20TokenTool = {
  name: "transfer_erc20_token",
  description: "Transfer an erc20 token to an address. You can query the address book to get the recipient address.",
  inputSchema: z.object({
    token: z
      .string()
      .refine(
        (input) => {
          // Check if the input matches any token's name, symbol, or contract address
          return Object.entries(ERC20_TOKENS).some(
            ([key, token]) =>
              key === input || token.symbol === input || token.name === input || token.contractAddress === input,
          );
        },
        {
          message: "Invalid token. Please provide a valid token name, symbol, or contract address",
          path: ["token"],
        },
      )
      .describe("The token to send (name, symbol, or contract address)"),
    to: z
      .string()
      .refine((addr) => isAddress(addr), {
        message: "Invalid address format",
        path: ["to"],
      })
      .describe("The address to send the token to"),
    amount: z.string().describe("The amount of tokens to send"),
  }),

  handler: async (params: { token: string; to: string; amount: string }) => {
    try {
      const { token, to, amount } = params;

      // Validate address format
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(to)) {
        return createTextResponse(`Invalid recipient address format: ${to}. Must be a valid 0x format address.`);
      }

      // Find token info by checking name, symbol, or contract address
      let tokenInfo;
      for (const [key, info] of Object.entries(ERC20_TOKENS)) {
        if (key === token || info.symbol === token || info.name === token || info.contractAddress === token) {
          tokenInfo = info;
          break;
        }
      }

      if (!tokenInfo) {
        return createTextResponse(
          `Invalid token: ${token}. Supported tokens: WFLOW, TRUMP, HotCocoa, Gwendolion, Pawderick, Catseye, USDF`,
        );
      }

      const transactionRequest = {
        to: tokenInfo.contractAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [to as `0x${string}`, parseUnits(amount, tokenInfo.decimals)],
        }),
      };

      const response = {
        tokenInfo,
        transactionRequest,
        type: "transfer_erc20_token",
      };
      return createTextResponse(JSON.stringify(response));
    } catch (error) {
      return createTextResponse(`Error sending erc20 token: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};
