import {z} from 'zod';

/**
 * The zod schema for the level properties of the lab.
 */
export const LevelKindSchema = z.object({
  startBlocks: z.object().optional(),
  toolboxBlocks: z.object().optional(),
  levelData: z.object(),
});
