import {z} from 'zod';

import {stepBaseSchema} from './base';

/**
 * A step that shows formatted text and a button to the next step: an intro
 * card before a checkpoint's questions, a note between steps. The step's
 * title is the header's; any heading the card shows is in the markdown.
 */
export const markdownStepSchema = stepBaseSchema.extend({
  kind: z.literal('markdown'),
  markdown: z.string().min(1),
  /** The button's label in place of the player's Continue. */
  continueLabel: z.string().min(1).optional(),
});
