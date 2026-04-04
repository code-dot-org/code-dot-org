import {z} from 'zod';

export const LevelDataSchema = z.object({
  src: z.string(),
  key: z.string(),
  name: z.string(),
  download: z.string(),
  thumbnail: z.string(),
  enableFallback: z.boolean(),
  autoplay: z.boolean(),
});

/**
 * The zod schema for the level properties of the lab.
 */
export const LevelKindSchema = z.object({
  videoKey: z.string(),
  levelData: LevelDataSchema,
});
