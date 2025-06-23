import { z } from "zod";
import { networks } from "@/utils/config";

export const flowBalanceSchema = z.object({
  address: z
    .string()
    .refine((val) => /^(0x)?[0-9a-fA-F]{16}$/.test(val), {
      message: "Invalid Flow address format. Must be 16 hexadecimal characters, optionally prefixed with '0x'",
    })
    .describe("Flow address to check balance for"),
  network: z.enum(networks).default("mainnet").describe("Flow network to use"),
});

export type FlowBalanceSchema = z.infer<typeof flowBalanceSchema>;
