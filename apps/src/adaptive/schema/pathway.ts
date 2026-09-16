import {z} from 'zod';

import {projectSchema} from './project';
import {skillSchema} from './skill';
import {stepSchema} from './steps';

/**
 * Full adaptive pathway schema, as authored in dashboard/config/level_content/adaptive
 * Drives an entire adaptive pathway experience, whose entrypoint is currently a single
 * Adaptive level.
 */
export const pathwaySourceSchema = z.strictObject({
  formatVersion: z.literal(3),
  id: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
  // Adaptive pathways are built around a single project.
  project: projectSchema,
  // A pathway's standards are its skills' standards; see pathwayStandards().
  steps: z.array(stepSchema).min(1),
});

/** Resolved pathway schema served by the server. Inlines the referenced skills, with their standards resolved. */
export const pathwaySchema = pathwaySourceSchema.extend({
  skills: z.record(z.string(), skillSchema),
});
