import {z} from 'zod';

import {resolvedStandardSchema, standardRefSchema} from './common';
import {labStepSchema, panelsStepSchema, questionsStepSchema} from './steps';

/** Steps in a checkpoint always play in order; no `next` property. */
export const skillStepSchema = z.discriminatedUnion('kind', [
  panelsStepSchema.omit({next: true}),
  questionsStepSchema.omit({next: true}),
  labStepSchema.omit({next: true}),
]);

/**
 * A unit of progress within a skill. Consists of a sequence of steps that,
 * once complete, returns the student to the overall skill tree.
 * Checkpoints can define which other checkpoints must be completed first via `requires`.
 */
export const checkpointSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  /** A list of checkpoint IDs that must be completed before this one can be started. */
  requires: z.array(z.string().min(1)).optional(),
  steps: z.array(skillStepSchema).min(1),
});

/**
 * A skill that a student works on in an adaptive pathway.
 * Skills are described (title, description, standards) and have a pathway
 * composed of checkpoints.
 */
export const skillSourceSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  standards: z.array(standardRefSchema).optional(),
  checkpoints: z.array(checkpointSchema).min(1),
});

/** Skill schema served by the server, with resolved standards and skill content. */
export const skillSchema = skillSourceSchema.extend({
  standards: z.array(resolvedStandardSchema).optional(),
});
