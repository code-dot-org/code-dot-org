import {z} from 'zod';

import {planSchema} from './planTemplate';
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
   * The evidence level, by skill in `skillIds`, at which a student has
   * already demonstrated this checkpoint. A skill left out needs evidence
   * level 1.
   */
  targetEvidenceLevels: z
    .record(z.string().min(1), z.number().int().min(1))
    .optional(),
  /**
   * Whether a student who has demonstrated this checkpoint may be placed
   * past it. Needs `skillIds`.
   */
  skippable: z.boolean().optional(),
  /**
   * Whether finishing this checkpoint returns to the map focused on the
   * next open checkpoint, so the student sees what their evidence skipped.
   */
  routeAfterCompletion: z.boolean().optional(),
  /**
   * The map destination this checkpoint belongs to. Only a terminal (leaf)
   * checkpoint, one that no other checkpoint requires, can have one.
   */
  destination: z.string().min(1).optional(),
  /**
   * The project plan this checkpoint's plan questions fill. Needed by a
   * review step, and by any question that names a plan slot.
   */
  plan: planSchema.optional(),
  steps: z.array(stepSourceSchema).min(1),
});

/** A checkpoint as served, with referenced levels resolved. */
export const checkpointSchema = checkpointSourceSchema.extend({
  steps: z.array(stepSchema).min(1),
});
