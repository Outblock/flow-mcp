import { z } from 'zod';
import type { FlowPrompt } from '@/types/flow';
import type { Server } from '@/types/prompts';
import { getBalancePrompt } from './getBalance';
import { getAccountInfoPrompt } from './getAccountInfo';
import { findCoaAccountsPrompt } from './findCoaAccounts';

export const registerFlowPrompts = (server: Server): Server => {
  const prompts: FlowPrompt[] = [
    getBalancePrompt,
    getAccountInfoPrompt,
    findCoaAccountsPrompt
  ];

  prompts.forEach(({ name, description, schema, handler }) => {
    server.prompt(name, description, schema, handler);
  });

  return server;
};

export {
  getBalancePrompt,
  getAccountInfoPrompt,
  findCoaAccountsPrompt
}; 