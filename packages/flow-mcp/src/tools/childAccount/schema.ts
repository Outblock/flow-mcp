import { z } from "zod";
import { networks } from "@/utils/config";

export const childAccountSchema = z.object({
  address: z
    .string()
    .refine((val) => /^(0x)?[0-9a-fA-F]{16}$/.test(val), {
      message: "Invalid Flow address format. Must be 16 hexadecimal characters, optionally prefixed with '0x'",
    })
    .describe(
      "Flow address to check child accounts for, Flow Address Must be 16 hexadecimal characters, optionally prefixed with '0x'",
    ),
  network: z.enum(networks).default("mainnet").describe("Flow network to use"),
});

// Output schema matching the Cadence Result struct
export const childAccountResultSchema = z.record(
  z.string(), // address as key
  z.object({
    name: z.string(),
    description: z.string(),
    thumbnail: z.object({
      url: z.string(),
    }),
  }),
);

export type ChildAccountSchema = z.infer<typeof childAccountSchema>;
export type ChildAccountResult = z.infer<typeof childAccountResultSchema>;
