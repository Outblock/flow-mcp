import { z } from "zod";
import { networks } from "@/utils/config";

export const coaAccountSchema = z.object({
  address: z.string().describe("Flow address to check COA account for"),
  network: z.enum(networks).default("mainnet").describe("Flow network to use"),
});

export type CoaAccountSchema = z.infer<typeof coaAccountSchema>; 