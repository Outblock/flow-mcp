import { z } from "zod";

export const getPoolsByTokenSchema = z.object({
  address: z.string().min(1, "Token Address is required").describe("Token address where the contract is deployed"),
});

export type GetPoolsByTokenSchema = z.infer<typeof getPoolsByTokenSchema>;
