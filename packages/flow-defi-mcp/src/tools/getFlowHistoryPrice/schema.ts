import { z } from "zod";

export const getTrendingPoolsSchema = z.object({});

export type GetTrendingPoolsSchema = z.infer<typeof getTrendingPoolsSchema>;
