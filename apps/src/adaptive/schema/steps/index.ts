import {z} from 'zod';

import {questionsStepSchema} from '../question';

import {levelStepSchema, levelStepSourceSchema} from './level';
import {panelsStepSchema} from './panels';

/** A single step in a checkpoint, as authored. One of the following types. */
export const stepSourceSchema = z.discriminatedUnion('kind', [
  panelsStepSchema,
  questionsStepSchema,
  levelStepSourceSchema,
]);

/** A single step as served, with referenced levels resolved. */
export const stepSchema = z.discriminatedUnion('kind', [
  panelsStepSchema,
  questionsStepSchema,
  levelStepSchema,
]);

export * from './level';
export * from './panels';
