import {z} from 'zod';

import {stepBaseSchema} from './base';

/**
 * A step shown as a dialog over the page: a heading, an optional image,
 * markdown, an optional outside link, and the button to the next step.
 */
export const modalStepSchema = stepBaseSchema.extend({
  kind: z.literal('modal'),
  heading: z.string().min(1),
  imageUrl: z.string().min(1).optional(),
  markdown: z.string().min(1),
  /** A link opened in a new tab, beside the button on. */
  link: z
    .strictObject({label: z.string().min(1), href: z.string().min(1)})
    .optional(),
  /** The button's label in place of the player's Continue. */
  continueLabel: z.string().min(1).optional(),
});
