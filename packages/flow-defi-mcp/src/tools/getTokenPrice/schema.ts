import { z } from "zod";

export const getTokenPriceSchema = z.object({
  addresses: z.string().min(1, "Addresses is required").describe("Token addresses where the contract is deployed"),
});
export const getTrendingPoolsSchema = z.object({});

export type GetTokenPriceSchema = z.infer<typeof getTokenPriceSchema>;
