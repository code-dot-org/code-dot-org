import {z} from 'zod';

import {labPropertiesSchema} from './steps/labs';

/** Defines the lab and description for the single project an adaptive pathway is built around. */
export const projectSchema = z.strictObject({
  lab: labPropertiesSchema,
  description: z.string().min(1),
});
