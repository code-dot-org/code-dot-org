import {z} from 'zod';

import {stepBaseSchema} from './base';

/** The figures a stats step can show, in the order it shows them. */
export const STAT_KINDS = [
  'checkpoints',
  'skills',
  'destinations',
  'timeSpent',
] as const;

/**
 * A step that shows the student's progress so far under a heading of its
 * own: checkpoints completed, a ring per skill, a ring per destination, and
 * time spent.
 */
export const statsStepSchema = stepBaseSchema.extend({
  kind: z.literal('stats'),
  heading: z.string().min(1),
  subheading: z.string().min(1).optional(),
  /** Which figures to show, in this order; all of them when absent. */
  stats: z.array(z.enum(STAT_KINDS)).min(1).optional(),
});
