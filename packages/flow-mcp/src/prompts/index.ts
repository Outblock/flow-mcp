import { z } from "zod";
import {
  getFlowBalancePrompt,
  getAccountInfoPrompt,
  getCoaAccountPrompt,
  getChildAccountPrompt,
  getContractPrompt,
  getTokenBalancePrompt,
} from "./prompts";
import type { ToolRegistration } from "../types/tools.js";

// Define the schema for prompts
export const promptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  arguments: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        required: z.boolean().optional(),
      }),
    )
    .optional(),
  handler: z.function().args(z.any()).returns(z.any()),
});

export type PromptSchema = z.infer<typeof promptSchema>;

// Create and export prompts
export const createPrompts = (): PromptSchema[] => {
  return [
    getFlowBalancePrompt,
    getAccountInfoPrompt,
    getCoaAccountPrompt,
    getChildAccountPrompt,
    getContractPrompt,
    getTokenBalancePrompt,
  ];
};

export default createPrompts;
