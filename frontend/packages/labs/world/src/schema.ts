// What a World Lab level is allowed to say.
//
// Level properties are validated on the way in, and zod objects drop keys they
// were not told about — so a lab's own level data reaches it only if the lab
// registers a schema for its kind (`registerLevelKindSchema`, in App). Without
// this file, `levelData` on a World level is parsed away silently and every
// level looks like the default one.

import {z} from 'zod';

import {LevelPropertiesBaseSchema} from '@code-dot-org/core/api';

/** The lab's own per-level settings. Everything optional: a level says only
 *  what it wants to differ from the editor's defaults. */
export const WorldLevelDataSchema = z.object({
  // Whether a `use rule` / `use trait` block offers to open the file behind it
  // (see `levelData.ts`). Default on — the button is a way into a project the
  // learner owns, and a level turns it off to keep a lesson on one side of the
  // seam.
  showRuleSource: z.boolean().optional(),
  // Whether the file browser is there at all. Default on; a level about one
  // file has nothing to browse.
  showFileBrowser: z.boolean().optional(),
  // Toolbox categories to leave out, by the name shown on them ("Gravity",
  // "Loops"). Their blocks stay defined — a workspace that already holds one
  // still renders and still generates code; they are only unreachable from the
  // toolbox.
  hiddenToolboxCategories: z.array(z.string()).optional(),
});

/**
 * World-specific level properties on top of the base ones.
 *
 * Not the Blockly properties: a World level's workspace is a project of files
 * (Codebridge), not one serialized Blockly workspace, so it carries the base
 * properties and this.
 */
export const LevelKindSchema = LevelPropertiesBaseSchema.extend({
  levelData: WorldLevelDataSchema.optional(),
});
