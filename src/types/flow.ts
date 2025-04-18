import { z } from 'zod';
import type { Network } from '@/utils/fclConfig';
import type { BasePrompt } from './prompts';

// Base schema for Flow tools that require address and network
export const baseFlowSchema = z.object({
  address: z.string().describe('Flow address'),
  network: z.enum(['mainnet', 'testnet'] as const).default('mainnet').describe('Flow network to use')
});

export type BaseFlowSchema = z.infer<typeof baseFlowSchema>;

export interface FlowPrompt extends BasePrompt {} 