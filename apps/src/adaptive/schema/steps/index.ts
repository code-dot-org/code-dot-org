import {z} from 'zod';

import {questionsStepSchema} from '../question';

import {levelStepSchema, levelStepSourceSchema} from './level';
import {panelsStepSchema} from './panels';
import {videoStepSchema, videoStepSourceSchema} from './video';

/** A single step in a checkpoint, as authored. One of the following types. */
export const stepSourceSchema = z.discriminatedUnion('kind', [
  panelsStepSchema,
  questionsStepSchema,
  levelStepSourceSchema,
  videoStepSourceSchema,
]);

/** A single step as served, with referenced levels and videos resolved. */
export const stepSchema = z.discriminatedUnion('kind', [
  panelsStepSchema,
  questionsStepSchema,
  levelStepSchema,
  videoStepSchema,
]);

export * from './level';
export * from './panels';
export * from './video';
