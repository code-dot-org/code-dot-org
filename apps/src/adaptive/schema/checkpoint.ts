import {z} from 'zod';

import {stepSchema, stepSourceSchema} from './steps';

/**
 * The unit of progress in a pathway: an ordered sequence of steps that,
 * once complete, returns the student to the map. Checkpoints form a graph
 * through `requires`; one with no `requires` is a root.
 */
export const checkpointSourceSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  /** Skills this checkpoint develops, by id in the pathway's `skills` map. */
  skillIds: z.array(z.string().min(1)).optional(),
  /** Checkpoint ids that must be complete before this one unlocks. */
  requires: z.array(z.string().min(1)).optional(),
  /**
   * The evidence level, in each of this checkpoint's skills, at which a
   * student has already demonstrated it. Defaults to 1.
   */
  targetEvidenceLevel: z.number().int().min(1).optional(),
  /**
   * Whether a student who has demonstrated this checkpoint may be placed
   * past it. Needs `skillIds`.
   */
  skippable: z.boolean().optional(),
  steps: z.array(stepSourceSchema).min(1),
});

/** A checkpoint as served, with referenced levels resolved. */
export const checkpointSchema = checkpointSourceSchema.extend({
  steps: z.array(stepSchema).min(1),
});
