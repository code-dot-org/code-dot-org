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
export {
  activeCatalogue,
  catalogueById,
  CATALOGUES,
  DEFAULT_CATALOGUE,
  setActiveCatalogue,
  WORLD_CATALOGUE,
} from './catalogues';

import {DEFAULT_CATALOGUE} from './catalogues';
import type {
  Catalogue,
  Tile,
  TileId,
  TileState,
  Unlock,
  UnlockTarget,
} from './types';

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

/**
 * What is asked of a catalogue often enough to be worth building once.
 *
 * MEMOIZED BY CATALOGUE rather than computed per call. These used to be
 * module-level constants over the one imported `TILES`, which is exactly what
 * a second tree could not be added beside; a `Map` keyed by the catalogue
 * keeps that cost and loses the assumption.
 */
export interface CatalogueIndex {
  byId: ReadonlyMap<TileId, Tile>;
  /** Which tile grants a thing, keyed by {@link unlockKey}. */
  grantedBy: ReadonlyMap<string, TileId>;
}

const indexes = new WeakMap<Catalogue, CatalogueIndex>();

export const indexOf = (catalogue: Catalogue): CatalogueIndex => {
  const already = indexes.get(catalogue);
  if (already) {
    return already;
  }
  const built: CatalogueIndex = {
    byId: new Map(catalogue.tiles.map(one => [one.id, one])),
    grantedBy: new Map(
      catalogue.tiles.flatMap(one =>
        one.unlocks.map(unlock => [unlockKey(unlock), one.id] as const),
      ),
    ),
  };
  indexes.set(catalogue, built);
  return built;
};

/** One tile of a catalogue, or a thrown error — an unknown id is a bug. */
export const tileIn = (catalogue: Catalogue, id: TileId): Tile => {
  const found = indexOf(catalogue).byId.get(id);
  if (!found) {
    throw new Error(`no such tile in ${catalogue.id}: ${id}`);
  }
  return found;
};

/**
 * Whether a learner may open a tile.
 *
 * ALL of a tile's inbound edges must be complete, which is what makes a genre's
 * gate mean "you have met both of these" (specs/PROGRESSION.md).
 */
export const tileStateIn = (
  catalogue: Catalogue,
  completed: ReadonlySet<TileId>,
  id: TileId,
): TileState => {
  if (completed.has(id)) {
    return 'done';
  }
  return tileIn(catalogue, id).requires.every(need => completed.has(need))
    ? 'open'
    : 'shut';
};

/** Everything a learner has unlocked on this tree — see {@link shelf}. */
export const shelfOf = (
  catalogue: Catalogue,
  completed: ReadonlySet<TileId>,
): Unlock[] =>
  catalogue.tiles
    .filter(one => completed.has(one.id))
    .flatMap(one => [...one.unlocks]);

// ── The default tree, for everything that has only ever known one ───────────
//
// Kept as named exports rather than made callers pass `DEFAULT_CATALOGUE`
// everywhere: a test, a story and the headless generator all want the world
// tree and saying so once here is better than saying it in forty places. What
// is now possible is that a caller which SHOULD care can take a catalogue.

/** Every tile of the default catalogue, by id. */
export const TILES_BY_ID: ReadonlyMap<TileId, Tile> =
  indexOf(DEFAULT_CATALOGUE).byId;

/** One tile of the default catalogue, or a thrown error. */
export const tile = (id: TileId): Tile => tileIn(DEFAULT_CATALOGUE, id);

export const tileState = (
  completed: ReadonlySet<TileId>,
  id: TileId,
): TileState => tileStateIn(DEFAULT_CATALOGUE, completed, id);

/** Which tile of the default catalogue grants a thing, by {@link unlockKey}. */
export const GRANTED_BY: ReadonlyMap<string, TileId> =
  indexOf(DEFAULT_CATALOGUE).grantedBy;

/**
 * The lesson that taught a thing, for the link back from a rule's row in the
 * import dialog or from its toolbox category (specs/PROGRESSION_UI.md).
 */
export const grantedByIn = (
  catalogue: Catalogue,
  unlock: UnlockTarget,
): Tile | undefined => {
  const id = indexOf(catalogue).grantedBy.get(unlockKey(unlock));
  return id === undefined ? undefined : tileIn(catalogue, id);
};

export const grantedBy = (unlock: UnlockTarget): Tile | undefined =>
  grantedByIn(DEFAULT_CATALOGUE, unlock);

/**
 * Everything a learner has unlocked — the shelf a New Project is built from.
 *
 * NOT what a lesson may hand them: a lesson's own starting project is free to
 * contain anything, and an edge means readiness rather than possession.
 */
export const shelf = (completed: ReadonlySet<TileId>): Unlock[] =>
  shelfOf(DEFAULT_CATALOGUE, completed);
