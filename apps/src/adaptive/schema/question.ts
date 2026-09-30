import {z} from 'zod';

import {stepBaseSchema} from './steps/base';

export const questionOptionSchema = z.strictObject({
  id: z.string().min(1),
  label: z.string().min(1),
  correct: z.boolean().optional(),
});

/** Represents a single question in a Question step. */
export const questionSchema = z.discriminatedUnion('type', [
  z.strictObject({
    id: z.string().min(1),
    type: z.literal('multipleChoice'),
    text: z.string().min(1),
    options: z.array(questionOptionSchema).min(2),
    multiSelect: z.boolean().optional(),
  }),
  z.strictObject({
    id: z.string().min(1),
    type: z.literal('freeResponse'),
    text: z.string().min(1),
    placeholder: z.string().optional(),
  }),
  z.strictObject({
    id: z.string().min(1),
    type: z.literal('scale'),
    text: z.string().min(1),
    scale: z.strictObject({
      min: z.number().int(),
      max: z.number().int(),
      minLabel: z.string().optional(),
      maxLabel: z.string().optional(),
    }),
  }),
]);

/** A questions step. */
export const questionsStepSchema = stepBaseSchema.extend({
  kind: z.literal('questions'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1),
});
