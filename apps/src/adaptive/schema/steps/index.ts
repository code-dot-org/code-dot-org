import {z} from 'zod';

import {questionsStepSchema} from '../question';

import {levelStepSchema, levelStepSourceSchema} from './level';
import {markdownStepSchema} from './markdown';
import {panelsStepSchema} from './panels';
import {reviewStepSchema} from './review';
import {statsStepSchema} from './stats';
import {videoStepSchema, videoStepSourceSchema} from './video';

/** A single step in a checkpoint, as authored. One of the following types. */
export const stepSourceSchema = z.discriminatedUnion('kind', [
  panelsStepSchema,
  questionsStepSchema,
  levelStepSourceSchema,
  markdownStepSchema,
  reviewStepSchema,
  statsStepSchema,
  videoStepSourceSchema,
]);

/** A single step as served, with referenced levels and videos resolved. */
export const stepSchema = z.discriminatedUnion('kind', [
  panelsStepSchema,
  questionsStepSchema,
  levelStepSchema,
  markdownStepSchema,
  reviewStepSchema,
  statsStepSchema,
  videoStepSchema,
]);

export * from './level';
export * from './markdown';
export * from './stats';
export * from './panels';
export * from './review';
export * from './video';
