import {z} from 'zod';

import {stepBaseSchema} from './base';

/** The figures a stats step can show, in the order it shows them. */
export const STAT_KINDS = [
  'checkpoints',
  'timeSpent',
  'skills',
  'destinations',
] as const;

/**
 * A step that shows the student's progress so far under a heading of its
 * own, with a logo above when the content names one: checkpoints completed,
 * time spent, a ring per skill, and a ring per destination.
 */
export const statsStepSchema = stepBaseSchema.extend({
  kind: z.literal('stats'),
  heading: z.string().min(1),
  subheading: z.string().min(1).optional(),
  /** Image shown above the heading, such as the course's logo. */
  logoUrl: z.string().min(1).optional(),
  /** Which figures to show, in this order; all of them when absent. */
  stats: z.array(z.enum(STAT_KINDS)).min(1).optional(),
});
