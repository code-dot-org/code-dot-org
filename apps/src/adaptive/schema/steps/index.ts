import {z} from 'zod';

import {questionsStepSchema} from '../question';

import {congratsStepSchema} from './congrats';
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
  congratsStepSchema,
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
  congratsStepSchema,
  reviewStepSchema,
  statsStepSchema,
  videoStepSchema,
]);

export * from './congrats';
export * from './level';
export * from './markdown';
export * from './stats';
export * from './panels';
export * from './review';
export * from './video';
