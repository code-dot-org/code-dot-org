import {z} from 'zod';

import {stepBaseSchema} from './base';

/**
 * A step that shows formatted text and a button to the next step: an intro
 * card before a checkpoint's questions, a note between steps. The step's
 * title is the header's; any heading or image the card shows is in the
 * markdown, an image as `![alt](url)`, or as an `<img>` tag with a width or
 * height to size it. A logo from the content sits above the markdown.
 */
export const markdownStepSchema = stepBaseSchema
  .extend({
    kind: z.literal('markdown'),
    markdown: z.string().min(1).meta({title: 'Markdown', widget: 'markdown'}),
    /** Image shown above the markdown, such as the course's logo. */
    logoUrl: z.string().min(1).optional().meta({
      title: 'Logo URL',
      description:
        "An image shown above the markdown, such as the course's logo.",
    }),
    /** A link opened in a new tab, rendered as a secondary button action. */
    link: z
      .strictObject({
        label: z.string().min(1).meta({title: 'Label'}),
        href: z.string().min(1).meta({title: 'URL'}),
      })
      .optional()
      .meta({
        title: 'Link',
        description: 'Opened in a new tab, as a secondary button.',
      }),
    /** The button's label in place of the player's Continue. */
    continueLabel: z.string().min(1).optional().meta({
      title: 'Continue button',
      description: '"Continue" when not set.',
    }),
  })
  .meta({title: 'Markdown'});
