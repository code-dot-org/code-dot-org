import {z} from 'zod';

import {Panel, PanelLayout} from '@cdo/apps/panels/types';

import {subsetOf} from '../subsetOf';

import {stepBaseSchema} from './base';

/** Where the text box sits over the image. */
export const panelLayoutSchema = subsetOf<PanelLayout>()(
  z.enum([
    'text-top-left',
    'text-top-center',
    'text-top-right',
    'text-bottom-left',
    'text-bottom-center',
    'text-bottom-right',
  ])
);

/**
 * One panel, shaped like the panels lab's `Panel` so the same viewer plays it.
 */
export const panelSchema = subsetOf<Panel>()(
  z
    .strictObject({
      key: z.string().min(1).meta({title: 'Key'}),
      imageUrl: z.string().min(1).meta({title: 'Image URL'}),
      // Empty for an image-only panel; the viewer then hides the text box.
      text: z.string().meta({
        title: 'Text',
        description: 'Empty for an image-only panel.',
      }),
      layout: panelLayoutSchema.optional().meta({
        title: 'Layout',
        description: 'Where the text box sits over the image.',
      }),
      typing: z.boolean().optional().meta({title: 'Typed out'}),
      fadeInOverPrevious: z.boolean().optional().meta({
        title: 'Fade in over the previous panel',
      }),
    })
    .meta({title: 'Panel'})
);

/** A panels step. */
export const panelsStepSchema = stepBaseSchema
  .extend({
    kind: z.literal('panels'),
    panels: z.array(panelSchema).min(1).meta({title: 'Panels'}),
  })
  .meta({title: 'Panels'});
