import {z} from 'zod';

import {LevelProperties} from '@cdo/apps/lab2/types';

import {stepBaseSchema} from './base';

/**
 * Lab2 level properties as the server serializes them. Only the keys every
 * lab needs are checked; the rest of the shape is the lab's business.
 */
export const levelPropertiesSchema = z.custom<LevelProperties>(
  value =>
    typeof value === 'object' &&
    value !== null &&
    typeof (value as LevelProperties).id === 'number' &&
    typeof (value as LevelProperties).appName === 'string',
  {message: 'expected Lab2 level properties with a numeric id and appName'}
);

/**
 * A step that plays an existing level. A level whose project template is the
 * pathway's template edits the student's project; any other level is a
 * sandbox with code of its own.
 */
export const levelStepSourceSchema = stepBaseSchema.extend({
  kind: z.literal('level'),
  /** Name of the level to play. */
  level: z.string().min(1),
  /** Replaces the level's own instructions when set. */
  instructions: z.string().min(1).optional(),
  /**
   * Marks a step that edits the student's project. Its level must name the
   * pathway's template level as its project template; a step without this
   * flag must not. Absent for sandboxes.
   */
  project: z.literal(true).optional(),
});

/** A level step as served, with the referenced level's properties inlined. */
export const levelStepSchema = levelStepSourceSchema.extend({
  /** Absent when the server found no level by that name. */
  levelProperties: levelPropertiesSchema.optional(),
});
