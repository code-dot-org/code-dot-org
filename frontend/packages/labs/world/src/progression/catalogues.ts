// The trees a learner can be on, and which one they are on now.
//
// One today. The shape exists because a second is the next thing asked for —
// an app progression rather than a game one (specs/APPS.md) — and because the
// alternative shape, a module-level `TILES` everything imports, is what made a
// second one impossible: the store, the shelf, the map and the flyout button
// all reached for the same global.
//
// WHAT IS NOT HERE: any notion of a learner being on two at once, or of one
// tree requiring another. Both are real questions and neither has been asked.

import {TILES} from './catalogue';
import type {Catalogue} from './types';

/** The original tree: a game progression, from a first actor to a whole genre. */
export const WORLD_CATALOGUE: Catalogue = {
  id: 'world',
  name: 'World Lab',
  version: 1,
  tiles: TILES,
};

export const CATALOGUES: readonly Catalogue[] = [WORLD_CATALOGUE];

/** What a level gets when it names none, and what every test gets. */
export const DEFAULT_CATALOGUE = WORLD_CATALOGUE;

/**
 * One by id, or the default.
 *
 * FALLS BACK RATHER THAN THROWS. The id comes from level properties somebody
 * typed, and a lab that refused to open because a level named a tree that has
 * been renamed is worse than one that opens on the tree everybody has.
 */
export const catalogueById = (id: string | undefined): Catalogue =>
  CATALOGUES.find(one => one.id === id) ?? DEFAULT_CATALOGUE;

/**
 * The tree in play, for the code that runs outside React.
 *
 * The flyout's "How this works" button and the rule library's grouping both
 * ask which lesson taught a thing, and neither is a component — they are
 * called from Blockly and from a plain module. The provider sets this as it
 * mounts, the same seam `lessonSeam` uses for the same reason.
 */
let active: Catalogue = DEFAULT_CATALOGUE;

export const activeCatalogue = (): Catalogue => active;

export const setActiveCatalogue = (catalogue: Catalogue): void => {
  active = catalogue;
};
