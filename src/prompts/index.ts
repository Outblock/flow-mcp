import { z } from 'zod';
import { getBalancePrompt, getAccountInfoPrompt, findCoaAccountsPrompt } from './flow';
import type { FlowPrompt } from '@/types/flow';

// Create and export prompts
export const createPrompts = (): FlowPrompt[] => {
  return [
    getBalancePrompt,
    getAccountInfoPrompt,
    findCoaAccountsPrompt,
  ];
};

export default createPrompts; 