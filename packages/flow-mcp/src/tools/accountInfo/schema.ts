import { z } from "zod";
import { networks } from "@/utils/config";

export const accountInfoSchema = z.object({
  address: z
    .string()
    .refine((val) => /^(0x)?[0-9a-fA-F]{16}$/.test(val), {
      message:
        "Invalid Flow address format. Must be 16 hexadecimal characters, optionally prefixed with '0x'",
    })
    .describe(
      "Flow address to check account information for, the flow address is 16 characters long or 18 characters long with 0x prefix"
    ),
  network: z.enum(networks).default("mainnet").describe("Flow network to use"),
});

// Output schema matching the Cadence Result struct
export const accountInfoResultSchema = z.object({
  address: z.string().describe("Account address"),
  balance: z.string().describe("Total account balance in FLOW"),
  availableBalance: z.string().describe("Available balance in FLOW"),
  storageUsed: z.string().describe("Storage used in bytes"),
  storageCapacity: z.string().describe("Storage capacity in bytes"),
  storageFlow: z.string().describe("FLOW tokens used for storage"),
});

export type AccountInfoSchema = z.infer<typeof accountInfoSchema>;
export type AccountInfoResult = z.infer<typeof accountInfoResultSchema>;
