// The progression: the catalogue, and the questions asked of it.
//
// specs/PROGRESSION.md designs the lessons; specs/PROGRESSION_UI.md designs the
// map a learner reads them on. This module is neither — it is the data and the
// handful of pure functions over it, so that the renderer, the modal, the mock
// host and the tests all agree about what a tile is and when it opens.

export * from './hex';
export * from './types';
export {REGIONS, FOUNDATIONS, GENRES, region, regionHue} from './regions';
export {TILES} from './catalogue';

import {TILES} from './catalogue';
import type {Tile, TileId, TileState, Unlock, UnlockTarget} from './types';

/** Every tile, by id. */
export const TILES_BY_ID: ReadonlyMap<TileId, Tile> = new Map(
  TILES.map(tile => [tile.id, tile]),
);

/** One tile, or a thrown error — an unknown id is a bug, not a condition. */
export const tile = (id: TileId): Tile => {
  const found = TILES_BY_ID.get(id);
  if (!found) {
    throw new Error(`no such tile: ${id}`);
  }
  return found;
};

/**
 * Whether a learner may open a tile.
 *
 * ALL of a tile's inbound edges must be complete, which is what makes a genre's
 * gate mean "you have met both of these" (specs/PROGRESSION.md).
 */
export const tileState = (
  completed: ReadonlySet<TileId>,
  id: TileId,
): TileState => {
  if (completed.has(id)) {
    return 'done';
  }
  return tile(id).requires.every(need => completed.has(need)) ? 'open' : 'shut';
};

/**
 * What an unlock IS, as a string.
 *
 * Two tiles must not grant the same thing — there would be no answer to "which
 * lesson taught me this" — so this is both the key of the reverse index and
 * what the layout test checks uniqueness with.
 */
export const unlockKey = (unlock: UnlockTarget): string => {
  switch (unlock.kind) {
    case 'block':
      return `block:${unlock.type}`;
    case 'category':
      return `category:${unlock.name}`;
    default:
      return `${unlock.kind}:${unlock.id}`;
  }
};

/** Which tile grants a thing, keyed by {@link unlockKey}. */
export const GRANTED_BY: ReadonlyMap<string, TileId> = new Map(
  TILES.flatMap(t => t.unlocks.map(u => [unlockKey(u), t.id] as const)),
);

/**
 * The lesson that taught a thing, for the link back from a rule's row in the
 * import dialog or from its toolbox category (specs/PROGRESSION_UI.md).
 */
export const grantedBy = (unlock: UnlockTarget): Tile | undefined => {
  const id = GRANTED_BY.get(unlockKey(unlock));
  return id === undefined ? undefined : tile(id);
};

/**
 * Everything a learner has unlocked — the shelf a New Project is built from.
 *
 * NOT what a lesson may hand them: a lesson's own starting project is free to
 * contain anything, and an edge means readiness rather than possession.
 */
export const shelf = (completed: ReadonlySet<TileId>): Unlock[] =>
  TILES.filter(t => completed.has(t.id)).flatMap(t => [...t.unlocks]);
