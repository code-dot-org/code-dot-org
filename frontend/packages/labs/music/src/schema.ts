import {z} from 'zod';

import {BlocklyLevelPropertiesSchema} from '@code-dot-org/core/api';

export const ToolboxSchema = z.object({
  includeAi: z.boolean().default(false),
});

export const LevelDataSchema = z.object({
  allowChangeStartingPlayheadPosition: z.boolean().default(false),
  showSoundFilters: z.boolean().default(false),
  library: z.string(),
  toolbox: ToolboxSchema,
  // The level's authored starting workspace (Blockly serialization).
  startSources: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Music-specific level properties, on top of the shared Blockly fields.
 */
export const MusicLevelPropertiesSchema = z.object({
  startBlocks: z.record(z.string(), z.unknown()).optional(),
  preloadAssetList: z
    .boolean()
    .nullable()
    .transform(value => value ?? false),
  containedLevelNames: z
    .array(z.string())
    .nullable()
    .transform(value => value ?? []),
  useRestrictedSongs: z.boolean().default(false),
  levelData: LevelDataSchema,
});

/**
 * The zod schema for the level properties of the lab.
 *
 * Music is a Blockly-based lab, so a music level carries *both* the shared
 * Blockly properties and the music-specific ones — this is a merge, not a
 * union. (A union would parse a music payload against the Blockly member and
 * silently strip `levelData` and friends, since zod objects drop unknown
 * keys.)
 */
export const LevelKindSchema = BlocklyLevelPropertiesSchema.extend(
  MusicLevelPropertiesSchema.shape,
);
