import {z} from 'zod';

import {stepBaseSchema} from './base';

/**
 * A step that shows the student's progress so far: checkpoints completed,
 * each destination's progress, and time spent, under a heading of its own.
 */
export const statsStepSchema = stepBaseSchema.extend({
  kind: z.literal('stats'),
  heading: z.string().min(1),
  subheading: z.string().min(1).optional(),
});
