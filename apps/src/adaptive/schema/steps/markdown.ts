import {z} from 'zod';

import {stepBaseSchema} from './base';

/**
 * A step that shows formatted text and a button to the next step: an intro
 * card before a checkpoint's questions, a note between steps. The step's
 * title is the header's; any heading or image the card shows is in the
 * markdown, an image as `![alt](url)`, or as an `<img>` tag with a width or
 * height to size it. A logo from the content sits above the markdown.
 */
export const markdownStepSchema = stepBaseSchema.extend({
  kind: z.literal('markdown'),
  markdown: z.string().min(1),
  /** Image shown above the markdown, such as the course's logo. */
  logoUrl: z.string().min(1).optional(),
  /** A link opened in a new tab, rendered as a secondary button action. */
  link: z
    .strictObject({label: z.string().min(1), href: z.string().min(1)})
    .optional(),
  /** The button's label in place of the player's Continue. */
  continueLabel: z.string().min(1).optional(),
});
