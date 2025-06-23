import { z } from "zod";
import { networks } from "@/utils/config";

export const accountInfoSchema = z.object({
  address: z.string().min(1, "Address is required").describe("Flow address to check account information for"),
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
