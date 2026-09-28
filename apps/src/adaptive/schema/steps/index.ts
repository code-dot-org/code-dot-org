import {z} from 'zod';

import {questionsStepSchema} from '../question';

import {labStepSchema} from './labs';
import {panelsStepSchema} from './panels';

/** A single step in a checkpoint. One of the following types. */
export const stepSchema = z.discriminatedUnion('kind', [
  panelsStepSchema,
  questionsStepSchema,
  labStepSchema,
]);

export * from './labs';
export * from './panels';
