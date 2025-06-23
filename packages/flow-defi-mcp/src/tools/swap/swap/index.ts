import { type Address, encodeFunctionData, isAddress, parseUnits } from "viem";
import type { ToolRegistration } from "@/types/tools.js";
import { createTextResponse } from "@/types/tools.js";
import { getPublicClient } from "../../utils/evm/viem";
import { ERC20_TOKENS } from "../../utils/evm/supportedErc20Tokens";
import { quoteSchema, type QuoteSchema, swapSchema, type SwapSchema } from "./schema";

function isValidToken(token: string): boolean {
  // Check if it's FLOW (native token)
  if (token === "FLOW") return true;

  // Check if it matches any token's name, symbol, or contract address
  return Object.entries(ERC20_TOKENS).some(
    ([key, tokenInfo]) =>
      key === token || tokenInfo.symbol === token || tokenInfo.name === token || tokenInfo.contractAddress === token,
  );
}

function getTokenInfo(token: string) {
  // Special case for FLOW (native token)
  if (token === "FLOW") {
    return {
      symbol: "FLOW",
      name: "Flow",
      decimals: 18,
    };
  }

  // Regular ERC20 token lookup
  for (const [key, info] of Object.entries(ERC20_TOKENS)) {
    if (key === token || info.symbol === token || info.name === token || info.contractAddress === token) {
      return info;
    }
  }

  return null;
}

// Punchswap V2 Factory ABI (minimal for getPair)
const UniswapV2FactoryABI = [
  {
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
    ],
    name: "getPair",
    outputs: [{ name: "pair", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Punchswap V2 Pair ABI (minimal for getReserves)
const UniswapV2PairABI = [
  {
    inputs: [],
    name: "getReserves",
    outputs: [
      { name: "reserve0", type: "uint112" },
      { name: "reserve1", type: "uint112" },
      { name: "blockTimestampLast", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token0",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token1",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Punchswap V2 Factory address
const PUNCHSWAP_V2_FACTORY_ADDRESS = "0x29372c22459a4e373851798bFd6808e71EA34A71" as Address;

// ExecuteCall ABI for using flowEVMAccount to execute transactions
const ExecuteCallABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "executeCall",
    outputs: [
      {
        internalType: "bytes",
        name: "result",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

// Add a helper function to ensure the value is properly formatted as a hex string
function toHexString(value: bigint | number): `0x${string}` {
  return `0x${value.toString(16)}` as `0x${string}`;
}

/**
 * Formats a token amount according to its decimals
 * @param amount The raw amount as a bigint
 * @param decimals The number of decimals for the token
 * @returns A formatted string representation of the amount
 */
function formatTokenAmount(amount: bigint, decimals: number): string {
  if (amount === 0n) return "0";

  const amountStr = amount.toString();

  // If the amount is less than 10^decimals, we need to pad with leading zeros
  if (amountStr.length <= decimals) {
    const paddedAmount = amountStr.padStart(decimals + 1, "0");
    const integerPart = paddedAmount.slice(0, -decimals) || "0";
    const fractionalPart = paddedAmount.slice(-decimals).replace(/0+$/, "");

    return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
  } else {
    const integerPart = amountStr.slice(0, amountStr.length - decimals);
    const fractionalPart = amountStr.slice(amountStr.length - decimals).replace(/0+$/, "");

    return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
  }
}

/**
 * Calculate the amount out based on Punchswap V2 formula
 * @param amountIn The input amount
 * @param reserveIn The reserve of the input token
 * @param reserveOut The reserve of the output token
 * @returns The output amount
 */
function getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  if (amountIn === 0n) return 0n;
  if (reserveIn === 0n || reserveOut === 0n) return 0n;

  // Punchswap V2 formula: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
  const amountInWithFee = amountIn * 997n;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;

  return numerator / denominator;
}

/**
 * Tool for getting price quotes from Punchswap V2
 */
export const punchswapQuoteTool = {
  name: "punchswap_quote",
  description: `
  Get a price quote from Punchswap V2 for swapping between two tokens.
  Supported tokens: Wrapped Flow(WFLOW), Trump(TRUMP), HotCocoa, Gwendolion, Pawderick, Catseye.
  You can specify tokens by name, symbol, or contract address.
  The tool will check if a liquidity pair exists and return the current exchange rate.
  NOTE: This is tool for flow EVM chain not flow blockchain.
  `,
  inputSchema: quoteSchema,

  handler: async (params: QuoteSchema) => {
    try {
      const { tokenIn, tokenOut, amountIn } = params;
      const publicClient = getPublicClient();

      // Validate tokens using the new validation functions
      if (!isValidToken(tokenIn)) {
        return createTextResponse(
          `Invalid input token: ${tokenIn}. Supported tokens: FLOW, WFLOW, TRUMP, HotCocoa, Gwendolion, Pawderick, Catseye, USDF`,
        );
      }

      if (!isValidToken(tokenOut)) {
        return createTextResponse(
          `Invalid output token: ${tokenOut}. Supported tokens: FLOW, WFLOW, TRUMP, HotCocoa, Gwendolion, Pawderick, Catseye, USDF`,
        );
      }

      // Get token info using the new function
      const tokenInInfo = getTokenInfo(tokenIn);
      const tokenOutInfo = getTokenInfo(tokenOut);

      if (!tokenInInfo) {
        return createTextResponse(`Invalid input token: ${tokenIn}`);
      }

      if (!tokenOutInfo) {
        return createTextResponse(`Invalid output token: ${tokenOut}`);
      }

      // Convert amount to proper decimal representation using viem's parseUnits
      let amountInWei;
      try {
        amountInWei = parseUnits(amountIn, tokenInInfo.decimals);
      } catch (error) {
        return createTextResponse("Invalid amount");
      }

      // Check if we're dealing with ETH (FLOW in this case)
      const isETHIn = tokenIn === "FLOW";
      const isETHOut = tokenOut === "FLOW";

      // For FLOW (native token), we need to use WFLOW for the pair lookup
      const WFLOW_ADDRESS = ERC20_TOKENS["Wrapped Flow"].contractAddress;

      // For pair lookup and path creation, we need to use the actual token addresses
      // For FLOW, we use WFLOW address
      const tokenInAddressForPair = isETHIn ? WFLOW_ADDRESS : ((tokenInInfo as any).contractAddress as Address);
      const tokenOutAddressForPair = isETHOut ? WFLOW_ADDRESS : ((tokenOutInfo as any).contractAddress as Address);

      // Get the pair address from the factory
      const pairAddress = (await publicClient.readContract({
        address: PUNCHSWAP_V2_FACTORY_ADDRESS,
        abi: UniswapV2FactoryABI,
        functionName: "getPair",
        args: [tokenInAddressForPair, tokenOutAddressForPair],
      })) as Address;

      if (pairAddress === "0x0000000000000000000000000000000000000000") {
        return createTextResponse(`No liquidity pair found for ${tokenInInfo.symbol} and ${tokenOutInfo.symbol}`);
      }

      // Get token0 and token1 from the pair to determine the order
      const token0 = (await publicClient.readContract({
        address: pairAddress,
        abi: UniswapV2PairABI,
        functionName: "token0",
      })) as Address;

      // Get reserves from the pair
      const [reserve0, reserve1] = (await publicClient.readContract({
        address: pairAddress,
        abi: UniswapV2PairABI,
        functionName: "getReserves",
      })) as [bigint, bigint, number];

      // Determine which reserve corresponds to which token
      const isToken0 = tokenInAddressForPair.toLowerCase() === token0.toLowerCase();
      const reserveIn = isToken0 ? reserve0 : reserve1;
      const reserveOut = isToken0 ? reserve1 : reserve0;

      // Calculate the amount out using the Punchswap V2 formula
      const amountOut = getAmountOut(amountInWei, reserveIn, reserveOut);

      // Format the output amount according to decimals
      const formattedAmountOut = formatTokenAmount(amountOut, tokenOutInfo.decimals);

      // Calculate the exchange rate
      const exchangeRate =
        (Number(amountOut) / Number(amountInWei)) * 10 ** (tokenInInfo.decimals - tokenOutInfo.decimals);

      // Calculate price impact (simplified)
      const priceImpact = calculatePriceImpact(amountInWei, reserveIn);

      const result = {
        tokenIn: {
          symbol: tokenInInfo.symbol,
          name: tokenInInfo.name,
          address: (tokenInInfo as any).contractAddress || null,
          amount: amountIn,
        },
        tokenOut: {
          symbol: tokenOutInfo.symbol,
          name: tokenOutInfo.name,
          address: (tokenOutInfo as any).contractAddress || null,
          amount: formattedAmountOut,
        },
        exchangeRate: `1 ${tokenInInfo.symbol} = ${exchangeRate.toFixed(6)} ${tokenOutInfo.symbol}`,
        swapDetails: {
          pairAddress,
          reserveIn: reserveIn.toString(),
          reserveOut: reserveOut.toString(),
          priceImpact,
        },
      };

      return createTextResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      return createTextResponse(
        `Error getting Punchswap quote: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};

/**
 * Helper function to estimate price impact based on input amount and reserve
 * This is a simplified estimation for Punchswap V2
 */
function calculatePriceImpact(amountIn: bigint, reserveIn: bigint): string {
  if (reserveIn === 0n) return "Unknown";

  // Calculate price impact as a percentage of the reserve
  const impact = Number((amountIn * 10000n) / reserveIn) / 100;

  if (impact < 0.1) return "Very Low (<0.1%)";
  if (impact < 0.5) return "Low (0.1-0.5%)";
  if (impact < 1.0) return "Medium (0.5-1.0%)";
  if (impact < 3.0) return "High (1.0-3.0%)";
  return `Very High (${impact.toFixed(2)}%)`;
}

// Punchswap V2 Router ABI (minimal for swapExactTokensForTokens)
const UniswapV2RouterABI = [
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForETH",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactETHForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// ERC20 Approve ABI
const ERC20ApproveABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Punchswap V2 Router address
const UNISWAP_V2_ROUTER_ADDRESS = "0xf45AFe28fd5519d5f8C1d4787a4D5f724C0eFa4d" as Address;

// ERC20 Allowance ABI
const ERC20AllowanceABI = [
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const MAX_ALLOWANCE = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

/**
 * Tool for creating a transaction to swap tokens on Punchswap V2
 */
export const punchswapSwapTool: ToolRegistration<SwapSchema> = {
  name: "punchswap_swap",
  description: `
  Create a transaction to swap tokens on Punchswap V2.
  Supported tokens: Wrapped Flow(WFLOW), Trump(TRUMP), HotCocoa, Gwendolion, Pawderick, Catseye.
  You can specify tokens by name, symbol, or contract address.
  The tool will check if a liquidity pair exists and create the appropriate transaction.
  If approval is needed, it will return the approval transaction first.
  NOTE: This is tool for flow EVM chain not flow blockchain.
  `,
  inputSchema: swapSchema,
  handler: async (params: SwapSchema) => {
    try {
      const { flowEVMAccount, tokenIn, tokenOut, amountIn } = params;
      const deadline = params.deadline || Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
      const slippageTolerance = params.slippageTolerance || 10; // Default to 10%

      // Validate slippage tolerance
      if (slippageTolerance < 0.1 || slippageTolerance > 50) {
        return createTextResponse(`Invalid slippage tolerance: ${slippageTolerance}. Must be between 0.1% and 50%.`);
      }

      const publicClient = getPublicClient();

      // Validate address
      if (!isAddress(flowEVMAccount)) {
        return createTextResponse(
          `Invalid Flow EVM account address: ${flowEVMAccount}. Must be a valid 0x format address.`,
        );
      }

      // Validate tokens using the new validation functions
      if (!isValidToken(tokenIn)) {
        return createTextResponse(
          `Invalid input token: ${tokenIn}. Supported tokens: FLOW, WFLOW, TRUMP, HotCocoa, Gwendolion, Pawderick, Catseye, USDF`,
        );
      }

      if (!isValidToken(tokenOut)) {
        return createTextResponse(
          `Invalid output token: ${tokenOut}. Supported tokens: FLOW, WFLOW, TRUMP, HotCocoa, Gwendolion, Pawderick, Catseye, USDF`,
        );
      }

      // Get token info using the new function
      const tokenInInfo = getTokenInfo(tokenIn);
      const tokenOutInfo = getTokenInfo(tokenOut);

      if (!tokenInInfo) {
        return createTextResponse(`Invalid input token: ${tokenIn}`);
      }

      if (!tokenOutInfo) {
        return createTextResponse(`Invalid output token: ${tokenOut}`);
      }

      // Convert amountIn to wei using viem's parseUnits
      let amountInWei;
      try {
        amountInWei = parseUnits(amountIn, tokenInInfo.decimals);
      } catch (error) {
        return createTextResponse("Invalid amount");
      }

      // Check if we're dealing with ETH (FLOW in this case)
      const isETHIn = tokenIn === "FLOW";
      const isETHOut = tokenOut === "FLOW";

      // For FLOW (native token), we need to use WFLOW for the pair lookup
      const WFLOW_ADDRESS = ERC20_TOKENS["Wrapped Flow"].contractAddress;

      // For pair lookup and path creation, we need to use the actual token addresses
      // For FLOW, we use WFLOW address
      const tokenInAddressForPair = isETHIn ? WFLOW_ADDRESS : ((tokenInInfo as any).contractAddress as Address);
      const tokenOutAddressForPair = isETHOut ? WFLOW_ADDRESS : ((tokenOutInfo as any).contractAddress as Address);

      // Get the pair address from the factory
      const pairAddress = (await publicClient.readContract({
        address: PUNCHSWAP_V2_FACTORY_ADDRESS,
        abi: UniswapV2FactoryABI,
        functionName: "getPair",
        args: [tokenInAddressForPair, tokenOutAddressForPair],
      })) as Address;

      if (pairAddress === "0x0000000000000000000000000000000000000000") {
        return createTextResponse(`No liquidity pair found for ${tokenInInfo.symbol} and ${tokenOutInfo.symbol}`);
      }

      // Get token0 and token1 from the pair to determine the order
      const token0 = (await publicClient.readContract({
        address: pairAddress,
        abi: UniswapV2PairABI,
        functionName: "token0",
      })) as Address;

      // Get reserves from the pair
      const [reserve0, reserve1] = (await publicClient.readContract({
        address: pairAddress,
        abi: UniswapV2PairABI,
        functionName: "getReserves",
      })) as [bigint, bigint, number];

      // Determine which reserve corresponds to which token
      const isToken0 = tokenInAddressForPair.toLowerCase() === token0.toLowerCase();
      const reserveIn = isToken0 ? reserve0 : reserve1;
      const reserveOut = isToken0 ? reserve1 : reserve0;

      // Calculate the amount out using the Punchswap V2 formula
      const amountOut = getAmountOut(amountInWei, reserveIn, reserveOut);

      const formattedAmountOut = formatTokenAmount(amountOut, tokenOutInfo.decimals);

      // Apply slippage tolerance to get minimum amount out
      const slippageFactor = 1000n - BigInt(Math.floor(slippageTolerance * 10));
      const amountOutMin = (amountOut * slippageFactor) / 1000n;

      // Create the path array for the swap
      // For FLOW, we use WFLOW in the path
      const path = [tokenInAddressForPair, tokenOutAddressForPair];

      // If we're swapping ETH for tokens, we only need one transaction
      if (isETHIn) {
        // Swap ETH for Tokens
        const swapData = encodeFunctionData({
          abi: UniswapV2RouterABI,
          functionName: "swapExactETHForTokens",
          args: [amountOutMin, path, flowEVMAccount as `0x${string}`, BigInt(deadline)],
        });

        // Create executeCall data to execute the swap through flowEVMAccount
        // const executeCallData = encodeFunctionData({
        //   abi: ExecuteCallABI,
        //   functionName: 'executeCall',
        //   args: [UNISWAP_V2_ROUTER_ADDRESS, amountInWei.toString(), swapData]
        // });

        // const transactionRequest = {
        //   to: flowEVMAccount as Address,
        //   data: executeCallData,
        //   value: '0'
        // };
        const transactionRequest = {
          to: UNISWAP_V2_ROUTER_ADDRESS,
          data: swapData,
          value: "0",
        };

        const response = {
          transactionRequest: transactionRequest,
          tokenInInfos: {
            functionName: "swapExactETHForTokens",
            in: tokenInInfo,
            out: tokenOutInfo,
            amountIn: amountIn,
            amountOut: formattedAmountOut,
            amountInWei: amountInWei.toString(),
            amountOutMin: amountOutMin.toString(),
            path: path,
            deadline: deadline,
            isETHIn: isETHIn,
            isETHOut: isETHOut,
          },
          type: "punchswap_swap",
        };

        return createTextResponse(JSON.stringify(response));
      }

      // For token to token or token to ETH swaps, we need to check allowance first
      try {
        const currentAllowance = (await publicClient.readContract({
          address: tokenInAddressForPair,
          abi: ERC20AllowanceABI,
          functionName: "allowance",
          args: [flowEVMAccount as `0x${string}`, UNISWAP_V2_ROUTER_ADDRESS],
        })) as bigint;

        // If allowance is insufficient, return an approval transaction
        if (currentAllowance < amountInWei) {
          const approveData = encodeFunctionData({
            abi: ERC20ApproveABI,
            functionName: "approve",
            args: [UNISWAP_V2_ROUTER_ADDRESS, MAX_ALLOWANCE],
          });

          const approveTransaction = {
            to: tokenInAddressForPair as Address,
            data: approveData,
            value: "0",
          };

          const response = {
            transactionRequest: approveTransaction,
            tokenInInfos: {
              functionName: "approve",
              in: tokenInInfo,
              out: tokenOutInfo,
              amountIn: amountIn,
              amountOut: formattedAmountOut,
              amountInWei: amountInWei.toString(),
              amountOutMin: amountOutMin.toString(),
              path: path,
              deadline: deadline,
              isETHIn: isETHIn,
              isETHOut: isETHOut,
            },
            type: "punchswap_swap",
          };

          return createTextResponse(JSON.stringify(response));
        }
      } catch (error) {
        return createTextResponse(
          `Error checking token allowance: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      // If we reach here, it means we have sufficient allowance
      // Create the swap transaction based on whether we're swapping to ETH or tokens
      if (isETHOut) {
        // Swap Tokens for ETH
        const swapData = encodeFunctionData({
          abi: UniswapV2RouterABI,
          functionName: "swapExactTokensForETH",
          args: [amountInWei, amountOutMin, path, flowEVMAccount as `0x${string}`, BigInt(deadline)],
        });

        const swapTransaction = {
          to: UNISWAP_V2_ROUTER_ADDRESS,
          data: swapData,
          value: "0",
        };

        const response = {
          transactionRequest: swapTransaction,
          tokenInInfos: {
            functionName: "swapExactTokensForETH",
            in: tokenInInfo,
            out: tokenOutInfo,
            amountIn: amountIn,
            amountOut: formattedAmountOut,
            amountInWei: amountInWei.toString(),
            amountOutMin: amountOutMin.toString(),
            path: path,
            deadline: deadline,
            isETHIn: isETHIn,
            isETHOut: isETHOut,
          },
          type: "punchswap_swap",
        };

        return createTextResponse(JSON.stringify(response));
      } else {
        // Swap Tokens for Tokens
        const swapData = encodeFunctionData({
          abi: UniswapV2RouterABI,
          functionName: "swapExactTokensForTokens",
          args: [amountInWei, amountOutMin, path, flowEVMAccount as `0x${string}`, BigInt(deadline)],
        });

        const swapTransaction = {
          to: UNISWAP_V2_ROUTER_ADDRESS as Address,
          data: swapData,
          value: "0",
        };

        const response = {
          transactionRequest: swapTransaction,
          tokenInInfos: {
            functionName: "swapExactTokensForTokens",
            in: tokenInInfo,
            out: tokenOutInfo,
            amountIn: amountIn,
            amountOut: formattedAmountOut,
            amountInWei: amountInWei.toString(),
            amountOutMin: amountOutMin.toString(),
            path: path,
            deadline: deadline,
            isETHIn: isETHIn,
            isETHOut: isETHOut,
          },
          type: "punchswap_swap",
        };

        return createTextResponse(JSON.stringify(response));
      }
    } catch (error) {
      return createTextResponse(
        `Error creating swap transaction: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};
