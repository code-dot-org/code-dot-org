import {z} from 'zod';

import {stepSchema} from './steps';

/**
 * The unit of progress in a pathway: an ordered sequence of steps that,
 * once complete, returns the student to the map. Checkpoints form a graph
 * through `requires`; one with no `requires` is a root.
 */
export const checkpointSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  /** Skills this checkpoint develops, by id in the pathway's `skills` map. */
  skillIds: z.array(z.string().min(1)).optional(),
  /** Checkpoint ids that must be complete before this one unlocks. */
  requires: z.array(z.string().min(1)).optional(),
  steps: z.array(stepSchema).min(1),
});
