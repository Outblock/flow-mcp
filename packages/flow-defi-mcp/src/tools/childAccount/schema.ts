import { z } from "zod";
import { networks } from "@/utils/config";

export const childAccountSchema = z.object({
  address: z.string().min(1, "Address is required").describe("Flow address to check child accounts for"),
  network: z.enum(networks).default("mainnet").describe("Flow network to use"),
});

// Output schema matching the Cadence Result struct
export const childAccountResultSchema = z.record(
  z.string(), // address as key
  z.object({
    name: z.string(),
    description: z.string(),
    thumbnail: z.object({
      url: z.string()
    })
  })
);

export type ChildAccountSchema = z.infer<typeof childAccountSchema>;
export type ChildAccountResult = z.infer<typeof childAccountResultSchema>;