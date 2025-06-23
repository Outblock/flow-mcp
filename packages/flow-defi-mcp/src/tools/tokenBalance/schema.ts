import { z } from 'zod';
import { networks } from "@/utils/config";

export const tokenBalanceSchema = z.object({
  address: z.string().describe("Flow address to check balance for"),
  network: z.enum(networks).default("mainnet").describe("Flow network to use"),
});

export type TokenBalanceSchema = z.infer<typeof tokenBalanceSchema>; 