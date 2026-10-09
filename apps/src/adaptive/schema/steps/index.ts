import {z} from 'zod';

import {questionsStepSchema} from '../question';

import {freeResponseStepSchema} from './freeResponse';
import {levelStepSchema, levelStepSourceSchema} from './level';
import {panelsStepSchema} from './panels';

/** A single step in a checkpoint, as authored. One of the following types. */
export const stepSourceSchema = z.discriminatedUnion('kind', [
  panelsStepSchema,
  questionsStepSchema,
  freeResponseStepSchema,
  levelStepSourceSchema,
]);

/** A single step as served, with referenced levels resolved. */
export const stepSchema = z.discriminatedUnion('kind', [
  panelsStepSchema,
  questionsStepSchema,
  freeResponseStepSchema,
  levelStepSchema,
]);

export * from './freeResponse';
export * from './level';
export * from './panels';
