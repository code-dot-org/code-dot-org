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
  // Whether the stock libraries are limited to what the learner has UNLOCKED
  // (progression/shelf). Default OFF, and deliberately: gating is a teaching
  // device, and a lab that quietly started refusing rules to everybody who had
  // never opened the progression would be a worse lab for every teacher and
  // every experienced maker. A level — or, when there is one, an account — says
  // yes to it. See specs/PROGRESSION.md, "Free play".
  gateShelf: z.boolean().optional(),
  // Whether the color picker offers only its named swatches. Default OFF: the
  // picker opens with sixteen colors that have names and the whole color range
  // under them, which is the right answer for anybody making something. A first
  // lesson about color is not a lesson about picking one exactly, and a level
  // says so here (`levelData.simpleColors`).
  simpleColors: z.boolean().optional(),
  // Which view a WORLD opens on: its map, or its block workspace
  // (mapEditor/WorldEditor). Default `map` — a world is its map first
  // (specs/MAP_FIRST.md) — and a lesson whose task is in the workspace says
  // `world`, so a learner lands where the instructions are
  // (specs/CURRICULUM_PLAN.md).
  worldView: z.enum(['map', 'world']).optional(),
  // Which TREE of lessons this level belongs to, by catalogue id. Default is
  // the original one, which is every level written before there was more than
  // one. An app progression is a second tree over the same machinery, and it
  // is the thing a level has to name so that the map, the shelf and the
  // learner's finished tiles all agree which one is meant
  // (progression/catalogues, specs/APPS.md).
  catalogue: z.string().optional(),
  // What is being made: a game, or an app. Default `game`. An app level
  // leaves out what only a game wants — the game rules and actors, the map's
  // layers and cameras, and their blocks — without refusing a project that
  // already has them (`appBuilder`, specs/APPS.md, "App Builder").
  mode: z.enum(['game', 'app']).optional(),
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
