import { z } from "zod";
import { networks } from "@/utils/config";

export const querySchema = z.object({
  script: z.string().describe("Cadence script to execute"),
  args: z.array(z.any()).optional().describe("Arguments to pass to the script"),
  network: z.enum(networks).default("mainnet").describe("Flow network to use"),
});

export type QuerySchema = z.infer<typeof querySchema>;
