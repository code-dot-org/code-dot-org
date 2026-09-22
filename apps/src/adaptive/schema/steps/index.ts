import {z} from 'zod';

import {questionSchema} from '../question';

import {stepBaseSchema} from './base';
import {labStepSchema} from './labs';
import {panelsStepSchema} from './panels';

export const questionsStepSchema = stepBaseSchema.extend({
  kind: z.literal('questions'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1),
});

/** A single step in a checkpoint. One of the following types. */
export const stepSchema = z.discriminatedUnion('kind', [
  panelsStepSchema,
  questionsStepSchema,
  labStepSchema,
]);

export * from './labs';
export * from './panels';
