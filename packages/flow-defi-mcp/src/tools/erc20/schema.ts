import { z } from "zod";

export const getErc20TokenSchema = z.object({
  address: z.string().describe("The Flow EVM address to get the ERC20 tokens for (0x format)"),
});

export type GetErc20TokenSchema = z.infer<typeof getErc20TokenSchema>;
