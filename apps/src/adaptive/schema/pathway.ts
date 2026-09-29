import {z} from 'zod';

import {checkpointSchema, checkpointSourceSchema} from './checkpoint';
import {projectSchema, projectSourceSchema} from './project';
import {skillSchema, skillSourceSchema} from './skill';

/**
 * Full adaptive pathway schema, as authored in dashboard/config/level_content/adaptive.
 * Drives an entire adaptive pathway experience, whose entrypoint is currently a single
 * Adaptive level.
 */
export const pathwaySourceSchema = z.strictObject({
  formatVersion: z.literal(4),
  id: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
  // Adaptive pathways are built around a single project.
  project: projectSourceSchema,
  // A pathway's standards are its skills' standards; see pathwayStandards().
  skills: z.record(z.string(), skillSourceSchema),
  checkpoints: z.array(checkpointSourceSchema).min(1),
});

/**
 * Resolved pathway schema served by the server: skill standards resolved and
 * each referenced level's properties inlined.
 */
export const pathwaySchema = pathwaySourceSchema.extend({
  project: projectSchema,
  skills: z.record(z.string(), skillSchema),
  checkpoints: z.array(checkpointSchema).min(1),
});
