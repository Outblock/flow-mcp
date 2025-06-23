import { z } from "zod";
import { networks } from "@/utils/config";

export const getContractSchema = z.object({
  address: z
    .string()
    .refine((val) => /^(0x)?[0-9a-fA-F]{16}$/.test(val), {
      message: "Invalid Flow address format. Must be 16 hexadecimal characters, optionally prefixed with '0x'",
    })
    .describe("Flow address where the contract is deployed"),
  contractName: z.string().min(1, "Contract name is required").describe("Name of the contract to fetch"),
  network: z.enum(networks).default("mainnet").describe("Flow network to use"),
});

export type GetContractSchema = z.infer<typeof getContractSchema>;
