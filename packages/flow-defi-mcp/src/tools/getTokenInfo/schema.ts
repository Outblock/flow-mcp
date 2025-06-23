import { z } from "zod";

export const getTokenInfoSchema = z.object({
  address: z.string().min(1, "Addresses is required").describe("Token addresses where the contract is deployed"),
});
export const getTrendingPoolsSchema = z.object({});

export type GetTokenInfoSchema = z.infer<typeof getTokenInfoSchema>;
