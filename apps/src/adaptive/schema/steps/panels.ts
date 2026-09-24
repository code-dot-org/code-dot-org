import {z} from 'zod';

import {stepBaseSchema} from './base';

export const panelSlideSchema = z.strictObject({
  caption: z.string().min(1),
  imageUrl: z.string().optional(),
});

/** A panels step. */
export const panelsStepSchema = stepBaseSchema.extend({
  kind: z.literal('panels'),
  panels: z.array(panelSlideSchema).min(1),
});
