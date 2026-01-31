import {z} from 'zod';

/**
 * Fields common to every level.
 *
 * This can be extended in the type form `LevelProperties<T>`.
 */
export const LevelPropertiesBaseSchema = z.object({
  id: z.number(),
  appName: z.string(),
});
