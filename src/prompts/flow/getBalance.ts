import { z } from 'zod';
import type { FlowPrompt } from '@/types/flow';

export const getBalancePrompt: FlowPrompt = {
  name: 'flow.getBalance',
  description: 'Get the balance of a Flow account',
  schema: z.object({
    address: z.string().describe('The Flow account address'),
    network: z.string().optional().default('mainnet').describe('The Flow network to use')
  }),
  handler: ({ address, network = 'mainnet' }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Please get the balance for Flow account ${address} on the ${network} network.`
      }
    }]
  })
}; 