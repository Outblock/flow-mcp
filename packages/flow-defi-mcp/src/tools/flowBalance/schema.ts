import { z } from "zod";
import { networks } from "@/utils/config";

export const flowBalanceSchema = z.object({
  address: z.string().describe("Flow address to check balance for"),
  network: z.enum(networks).default("mainnet").describe("Flow network to use"),
});

export type FlowBalanceSchema = z.infer<typeof flowBalanceSchema>; 