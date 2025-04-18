import { z } from 'zod';
import type { FlowPrompt } from '../types/flow';

export const findCoaAccountsPrompt: FlowPrompt = {
  name: 'flow.findCoaAccounts',
  description: 'Find COA accounts associated with an address',
  schema: z.object({
    address: z.string().describe('The Flow account address'),
    network: z.string().optional().default('mainnet').describe('The Flow network to use')
  }),
  handler: ({ address, network = 'mainnet' }) => ({
    messages: [{
      role: 'user',
      content: {
        type: 'text',
        text: `Please find COA accounts associated with Flow account ${address} on the ${network} network.`
      }
    }]
  })
}; 