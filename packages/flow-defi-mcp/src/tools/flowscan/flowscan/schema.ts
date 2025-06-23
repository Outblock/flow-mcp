import { z } from "zod";

export const getTransactionInfoSchema = z.object({
  txid: z.string().min(1, "Transaction hash is required").describe("Transaction hash"),
});
export const getTrendingPoolsSchema = z.object({});

export type GetTransactionSchema = z.infer<typeof getTransactionInfoSchema>;
