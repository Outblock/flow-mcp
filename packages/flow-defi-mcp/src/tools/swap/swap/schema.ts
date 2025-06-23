import { z } from "zod";

export const quoteSchema = z.object({
  tokenIn: z
    .string()
    .describe(
      "The input token. Supported tokens: FLOW, WFLOW, TRUMP, HotCocoa, Gwendolion, Pawderick, Catseye, USDF. You can also use contract addresses.",
    ),
  tokenOut: z
    .string()
    .describe(
      "The output token. Supported tokens: FLOW, WFLOW, TRUMP, HotCocoa, Gwendolion, Pawderick, Catseye, USDF. You can also use contract addresses.",
    ),
  amountIn: z.string().describe("The amount of input tokens to swap"),
});

export type QuoteSchema = z.infer<typeof quoteSchema>;

export const swapSchema = z.object({
  tokenIn: z
    .string()
    .describe(
      "The input token. Supported tokens: FLOW, WFLOW, TRUMP, HotCocoa, Gwendolion, Pawderick, Catseye, USDF. You can also use contract addresses.",
    ),
  tokenOut: z
    .string()
    .describe(
      "The output token. Supported tokens: FLOW, WFLOW, TRUMP, HotCocoa, Gwendolion, Pawderick, Catseye, USDF. You can also use contract addresses.",
    ),
  amountIn: z.string().describe("The amount of input tokens to swap"),
  slippageTolerance: z
    .number()
    .optional()
    .describe("Slippage tolerance in percentage. Defaults to 10% if not provided. Must be between 0.1% and 50%."),
  flowEVMAccount: z.string().describe("The Flow EVM account address that will execute the swap (0x format)"),
  deadline: z
    .number()
    .optional()
    .describe("Transaction deadline in seconds. Defaults to 20 minutes from now if not provided."),
});

export type SwapSchema = z.infer<typeof swapSchema>;
