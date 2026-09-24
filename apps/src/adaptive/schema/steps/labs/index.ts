import {z} from 'zod';

import {stepBaseSchema} from '../base';

import {weblab2LabSchema} from './weblab2';

export const SUPPORTED_PROJECT_LAB_TYPES = ['weblab2'] as const;
export const labTypeSchema = z.enum(SUPPORTED_PROJECT_LAB_TYPES);

export const labPropertiesSchema = z.discriminatedUnion('type', [
  weblab2LabSchema,
]);

/** Validation data for the lab step, if validated. */
export const stepValidationSchema = z.strictObject({
  successCriteria: z.string().min(1),
});

/** A lab step. Lab-specific properties live in the lab property. */
export const labStepSchema = stepBaseSchema.extend({
  kind: z.literal('lab'),
  lab: labPropertiesSchema,
  /**
   * How project code should be sourced; project continues work on the pathway's
   * overall project; sandbox code only lives for the current step.
   */
  sourceMode: z.enum(['project', 'practice']).default('project'),
  instructions: z.string().min(1),
  validation: stepValidationSchema.optional(),
});

export {weblab2LabSchema};
