import {z} from 'zod';

import {abilitySchema} from './ability';
import {checkpointSchema} from './checkpoint';
import {projectSchema} from './project';
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
  project: projectSchema,
  // A pathway's standards are its skills' standards; see pathwayStandards().
  skills: z.record(z.string(), skillSourceSchema),
  abilities: z.record(z.string(), abilitySchema).default({}),
  /** Checkpoint to badge as the suggested next step while it is available. */
  recommendedCheckpointId: z.string().min(1).optional(),
  checkpoints: z.array(checkpointSchema).min(1),
});

/** Resolved pathway schema served by the server, with skill standards resolved. */
export const pathwaySchema = pathwaySourceSchema.extend({
  skills: z.record(z.string(), skillSchema),
});
