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
  z.strictObject({
    key: z.string().min(1),
    imageUrl: z.string().min(1),
    text: z.string().min(1),
    layout: panelLayoutSchema.optional(),
    typing: z.boolean().optional(),
    fadeInOverPrevious: z.boolean().optional(),
  })
);

/** A panels step. */
export const panelsStepSchema = stepBaseSchema.extend({
  kind: z.literal('panels'),
  panels: z.array(panelSchema).min(1),
});
