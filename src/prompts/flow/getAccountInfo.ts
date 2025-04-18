import { z } from 'zod';
import type { FlowPrompt } from '@/types/flow';

export const getAccountInfoPrompt: FlowPrompt = {
  name: 'flow.getAccountInfo',
  description: 'Get information about a Flow account',
  schema: z.object({
    address: z.string().describe('The Flow account address'),
    network: z.string().optional().default('mainnet').describe('The Flow network to use')
  }),
  handler: ({ address, network = 'mainnet' }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Please get account information for Flow account ${address} on the ${network} network.`
      }
    }]
  })
}; 