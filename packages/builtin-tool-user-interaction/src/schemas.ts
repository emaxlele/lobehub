import { z } from 'zod';

import { UserInteractionApiName } from './types';

const interactionFieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const interactionFieldSchema = z.object({
  key: z.string(),
  kind: z.enum(['multiselect', 'select', 'text', 'textarea']),
  label: z.string(),
  options: z.array(interactionFieldOptionSchema).optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  value: z.union([z.string(), z.array(z.string())]).optional(),
});

export const questionSchema = z
  .object({
    description: z.string().optional(),
    fields: z.array(interactionFieldSchema).optional(),
    id: z.string(),
    metadata: z.record(z.unknown()).optional(),
    mode: z.enum(['form', 'freeform']),
    prompt: z.string(),
  })
  .strict()
  .refine((q) => q.mode !== 'form' || (q.fields && q.fields.length > 0), {
    message:
      'Mode "form" requires a non-empty "fields" array. Use "freeform" mode for open-ended input, or provide "fields" for structured form input.',
  });

export const askUserQuestionArgsSchema = z.object({
  question: questionSchema,
});

export const userInteractionArgsSchemas = {
  [UserInteractionApiName.askUserQuestion]: askUserQuestionArgsSchema,
} as const;
