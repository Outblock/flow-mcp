import { z } from 'zod';

export interface BasePrompt {
  name: string;
  description: string;
  schema: z.ZodType<any>;
  handler: (params: any) => {
    messages: Array<{
      role: string;
      content: {
        type: string;
        text: string;
      };
    }>;
  };
}

export interface Server {
  prompt: (
    name: string,
    description: string,
    schema: z.ZodType<any>,
    handler: (params: any) => { messages: Array<{ role: string; content: { type: string; text: string } }> }
  ) => Server;
}

// Define the schema for prompts
export const promptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  arguments: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    required: z.boolean().optional()
  })).optional()
});

export type PromptSchema = z.infer<typeof promptSchema>; 