import {z} from 'zod';

import {stepBaseSchema} from './base';

/** The congrats panels there are, each a component of its own. */
export const CONGRATS_PANEL_IDS = ['hoai2026'] as const;

/**
 * A step that ends a pathway with a panel of its own: its words, its image
 * and its row of next steps, such as sharing the project and getting a
 * certificate, all in code. The content picks the panel and may give it a
 * logo.
 */
export const congratsStepSchema = stepBaseSchema.extend({
  kind: z.literal('congrats'),
  /** Which panel the step shows. */
  panelId: z.enum(CONGRATS_PANEL_IDS),
  /** Image shown above the panel's heading, such as the course's logo. */
  logoUrl: z.string().min(1).optional(),
});
