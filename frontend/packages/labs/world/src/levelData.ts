// What a level says about this lab.
//
// A World Lab level is mostly its starting project, but some of the editor's
// affordances are teaching decisions rather than preferences: a first lesson
// about *using* gravity is not a lesson about reading how gravity works, and a
// level that is about reading it wants the way in. Those choices live here, in
// the level's own data, so a curriculum author sets them per level rather than
// every project getting the same editor.
//
// Shaped like the other labs' (`MusicLevelProperties`): the lab's data hangs off
// `levelData`, and `LevelProperties<T>` intersects it with the base properties
// every level has.

import type {z} from 'zod';

import type {LevelProperties} from '@code-dot-org/core/api';

import type {WorldLevelDataSchema} from './schema';

/**
 * The lab's own per-level settings, inferred from the schema that lets them
 * through — so the type and the validation cannot disagree about a field.
 */
export type WorldLevelData = z.infer<typeof WorldLevelDataSchema>;

export interface WorldData {
  levelData?: WorldLevelData;
}

export type WorldLevelProperties = LevelProperties<WorldData>;

/** Whether this level offers the "open the file behind this block" button. */
export function showsRuleSource(
  properties: WorldLevelProperties | undefined,
): boolean {
  return properties?.levelData?.showRuleSource !== false;
}

/**
 * Whether this level lets a learner reach the project's other files.
 *
 * The FILE MENUS, since the tree went (`layout/WorldLayout`) — the level data
 * keeps the name it was saved under, which is what "showFileBrowser" now means
 * for a lab that has no browser: a level about one file shows the file and
 * nothing else, and its one file cannot be closed.
 */
export function showsFileBrowser(
  properties: WorldLevelProperties | undefined,
): boolean {
  return properties?.levelData?.showFileBrowser !== false;
}

/** Toolbox categories this level leaves out, by their displayed name. */
export function hiddenToolboxCategories(
  properties: WorldLevelProperties | undefined,
): readonly string[] {
  return properties?.levelData?.hiddenToolboxCategories ?? [];
}

/**
 * Whether the stock libraries offer only what this learner has unlocked.
 *
 * Off unless a level says otherwise. The unlock is only real if a New Project
 * cannot simply take everything (specs/PROGRESSION.md) — and it is only fair if
 * saying no to that is one setting away, which is what this is.
 */
export function gatesShelf(
  properties: WorldLevelProperties | undefined,
): boolean {
  return properties?.levelData?.gateShelf === true;
}
