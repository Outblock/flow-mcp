import { z } from "zod";

export const getTokenPriceHistorySchema = z.object({
  poolAddress: z.string().min(1, "address is required").describe("Pool address where the contract is deployed"),
  timeFrame: z.string().min(1, "timeFrame is required").describe("timeFrame is one of day, hour, minute"),
});

export type GetTokenPriceHistorySchema = z.infer<typeof getTokenPriceHistorySchema>;
