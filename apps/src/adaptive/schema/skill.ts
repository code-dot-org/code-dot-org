import {z} from 'zod';

import {resolvedStandardSchema, standardRefSchema} from './common';

/**
 * A skill a pathway develops. Checkpoints associate with skills through
 * `skillIds`; a skill does not own checkpoints and does not gate progress.
 */
export const skillSourceSchema = z.strictObject({
  id: z.string().min(1).meta({title: 'Id'}),
  title: z.string().min(1).meta({title: 'Title'}),
  description: z.string().min(1).meta({title: 'Description'}),
  /** A Font Awesome (solid) or kit icon name, shown on this skill's map nodes. */
  icon: z.string().min(1).optional().meta({
    title: 'Icon',
    description: "An icon name, shown on this skill's map nodes.",
  }),
  /**
   * What a student at each evidence level can do, keyed by evidence level.
   * Evidence level 0 is no evidence. When present, checkpoints and questions
   * may only name evidence levels described here, besides 0.
   */
  evidenceLevels: z
    .record(z.string().regex(/^(0|[1-9]\d*)$/), z.string().min(1))
    .optional()
    .meta({
      title: 'Evidence levels',
      description:
        'What a student at each evidence level can do, by level. Level 0 is no evidence. Checkpoints and questions may name only these levels, besides 0.',
    }),
  standards: z.array(standardRefSchema).optional().meta({title: 'Standards'}),
});

/** Skill schema served by the server, with resolved standards. */
export const skillSchema = skillSourceSchema.extend({
  standards: z.array(resolvedStandardSchema).optional(),
});
