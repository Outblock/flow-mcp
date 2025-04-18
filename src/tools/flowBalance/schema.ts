import { network } from '@/utils/fclConfig';
import { z } from 'zod';

export const flowBalanceSchema = z.object({
  address: z.string().describe('Flow address to check balance for'),
  network: network
});

export type FlowBalanceSchema = z.infer<typeof flowBalanceSchema>; 