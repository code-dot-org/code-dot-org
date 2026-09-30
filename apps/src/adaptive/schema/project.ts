import {z} from 'zod';

import {levelPropertiesSchema} from './steps/level';

/**
 * The single project an adaptive pathway is built around. Levels that name
 * `templateLevel` as their project template share the student's project
 * channel, so a level step edits the project by pointing at one of them.
 */
export const projectSourceSchema = z.strictObject({
  /** Name of the project template level. */
  templateLevel: z.string().min(1),
  description: z.string().min(1),
});

/** The project as served, with the template level's properties inlined. */
export const projectSchema = projectSourceSchema.extend({
  /** Absent when the server found no level by that name. */
  levelProperties: levelPropertiesSchema.optional(),
});
