import {z} from 'zod';

import {resolvedStandardSchema, standardRefSchema} from './common';

/**
 * A skill a pathway develops. Checkpoints associate with skills through
 * `skillIds`; a skill does not own checkpoints and does not gate progress.
 */
export const skillSourceSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  standards: z.array(standardRefSchema).optional(),
});

/** Skill schema served by the server, with resolved standards. */
export const skillSchema = skillSourceSchema.extend({
  standards: z.array(resolvedStandardSchema).optional(),
});
