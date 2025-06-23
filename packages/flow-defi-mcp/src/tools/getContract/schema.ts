import { z } from 'zod';
import { networks } from "@/utils/config";

export const getContractSchema = z.object({
  address: z.string().min(1, "Address is required").describe("Flow address where the contract is deployed"),
  contractName: z.string().min(1, "Contract name is required").describe("Name of the contract to fetch"),
  network: z.enum(networks).default("mainnet").describe("Flow network to use"),
});

export type GetContractSchema = z.infer<typeof getContractSchema>; 