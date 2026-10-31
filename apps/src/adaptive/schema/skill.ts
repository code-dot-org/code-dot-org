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
  /**
   * What a student at each evidence level can do, keyed by evidence level.
   * Evidence level 0 is no evidence. When present, checkpoints and questions
   * may only name evidence levels described here, besides 0.
   */
  evidenceLevels: z
    .record(z.string().regex(/^(0|[1-9]\d*)$/), z.string().min(1))
    .optional(),
  standards: z.array(standardRefSchema).optional(),
});

/** Skill schema served by the server, with resolved standards. */
export const skillSchema = skillSourceSchema.extend({
  standards: z.array(resolvedStandardSchema).optional(),
});
