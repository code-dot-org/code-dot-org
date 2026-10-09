import {z} from 'zod';

import {stepBaseSchema} from './base';

export const freeResponseStepSchema = stepBaseSchema.extend({
  kind: z.literal('freeResponse'),
  prompt: z.string().min(1),
  placeholder: z.string().optional(),
});
