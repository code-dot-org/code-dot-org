// What a map is, as data.
//
// A map is a list of placements — an actor type, an instance id, and whatever
// per-instance property overrides that instance carries. The editors read and
// write this shape; the engine reads the same one (`WorldBuilder.loadMap`), and
// a `.map` file is it, serialized.
//
// Split out of `MapEditor` when the canvas grew a second caller: the `.map` file
// editor holds a document, and the `create actor in map` popup holds one
// synthesized from a block's own placements (MAPS.md §2). Both need these types
// and these accessors; neither should own them.

import {TILE_SIZE, VIEWPORT_TILES} from '../runtime/viewport';

/** The grid a placement snaps to, in world pixels. */
export const DEFAULT_TILE = TILE_SIZE;

/**
 * How big a map is, in TILES — the region the editor draws and fits to.
 *
 * Distinct from {@link Tile}, which is how big ONE tile is in world pixels.
 * The two multiply to the map's extent ({@link extentOf}).
 *
 * A map used to be exactly the viewport, ten tiles each way, because that was
 * the only size anything had (runtime/viewport). A map may now be any size the
 * author says — but the GAME still runs at the fixed viewport, so a map bigger
 * than it has actors the player will not see. That is the editor's business to
 * make visible, not this file's.
 */
export interface MapSize {
  width: number;
  height: number;
}

/** What a map is when it does not say — the viewport, as every map was. */
export const DEFAULT_MAP_SIZE: MapSize = {
  width: VIEWPORT_TILES,
  height: VIEWPORT_TILES,
};

/**
 * Bounds on a map's dimensions, in tiles.
 *
 * One tile is the smallest thing that is still a map. The upper bound is not a
 * limit anyone should reach — it is there because the grid is drawn a line per
 * tile, and a map sized from a typo (a pasted `100000`) would hang the canvas
 * rather than look wrong.
 */
export const MIN_MAP_TILES = 1;
export const MAX_MAP_TILES = 200;

export interface Tile {
  width: number;
  height: number;
}
export interface Vec {
  x: number;
  y: number;
}
export interface Placement {
  type: string;
  id: string;
  /** Per-instance overrides, keyed by owner (trait) id then property id. */
  properties?: Record<string, Record<string, unknown>>;
}
/** An actor's resolved transform, with engine defaults (scale 1, rotation 0). */
export interface Transform {
  pos: Vec;
  scale: Vec;
  rotation: number;
  /** Vertical skew in degrees — a shear about the actor's center (0 = none). */
  skew: number;
}
export interface MapDoc {
  type: 'map';
  /** How many tiles across and down (see {@link MapSize}). */
  size: MapSize;
  tile: Tile;
  actors: Placement[];
}
/** The camera: screen_px = world * scale + offset (offset in CSS pixels). */
export interface View {
  scale: number;
  x: number;
  y: number;
}
export interface Size {
  w: number;
  h: number;
}

/**
 * A tile count that can be drawn: a whole number within the bounds.
 *
 * Applied on the way IN rather than trusted, because the value has been through
 * a text file — a hand-edited `.map`, a half-typed number in the editor's own
 * field. `NaN` reaches this from `Number('')`, and `NaN` tiles is a grid loop
 * that never terminates.
 */
export const clampTiles = (value: unknown): number | undefined => {
  // Ahead of `Number`, which answers 0 for all three of these — so a field the
  // author has just cleared to type into would read as a size, and the map
  // would collapse to one tile between two keystrokes.
  if (value === null || (typeof value === 'string' && value.trim() === '')) {
    return undefined;
  }
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) {
    return undefined;
  }
  return Math.max(MIN_MAP_TILES, Math.min(MAX_MAP_TILES, n));
};

export function parseMap(contents: string): MapDoc {
  const empty: MapDoc = {
    type: 'map',
    size: {...DEFAULT_MAP_SIZE},
    tile: {width: DEFAULT_TILE, height: DEFAULT_TILE},
    actors: [],
  };
  if (!contents.trim()) {
    return empty;
  }
  try {
    const raw = JSON.parse(contents) as Partial<MapDoc>;
    return {
      type: 'map',
      // A map written before maps had a size is the size every map was.
      size: {
        width: clampTiles(raw.size?.width) ?? DEFAULT_MAP_SIZE.width,
        height: clampTiles(raw.size?.height) ?? DEFAULT_MAP_SIZE.height,
      },
      tile: {
        width: raw.tile?.width ?? DEFAULT_TILE,
        height: raw.tile?.height ?? DEFAULT_TILE,
      },
      actors: Array.isArray(raw.actors) ? raw.actors : [],
    };
  } catch {
    return empty;
  }
}

/** A map's extent in world pixels — its tile counts times its tile size. */
export const extentOf = (map: MapDoc): Size => ({
  w: map.size.width * map.tile.width,
  h: map.size.height * map.tile.height,
});

// Overrides arrive as `unknown` (the generic property bag); coerce to what the
// canvas needs, falling back when a value is absent or malformed.
export const asVec = (v: unknown): Vec | undefined =>
  v && typeof (v as Vec).x === 'number' && typeof (v as Vec).y === 'number'
    ? {x: (v as Vec).x, y: (v as Vec).y}
    : undefined;
export const asNum = (v: unknown): number | undefined =>
  typeof v === 'number' ? v : undefined;

/** Read a placement's override for `owner.prop` (undefined if unset). */
export const propValue = (
  actor: Placement,
  ownerId: string,
  propId: string,
): unknown => actor.properties?.[ownerId]?.[propId];

export const positionOf = (actor: Placement): Vec | undefined =>
  asVec(propValue(actor, 'positional', 'position'));

/** Resolve an actor's transform, filling the engine's defaults. */
export const transformOf = (actor: Placement): Transform => ({
  pos: asVec(propValue(actor, 'positional', 'position')) ?? {x: 0, y: 0},
  scale: asVec(propValue(actor, 'positional', 'scale')) ?? {x: 1, y: 1},
  rotation: asNum(propValue(actor, 'positional', 'rotation')) ?? 0,
  skew: asNum(propValue(actor, 'positional', 'skew')) ?? 0,
});

/** A copy of `actor` with `owner.prop` set to `value`. */
export const withProperty = (
  actor: Placement,
  ownerId: string,
  propId: string,
  value: unknown,
): Placement => ({
  ...actor,
  properties: {
    ...actor.properties,
    [ownerId]: {...actor.properties?.[ownerId], [propId]: value},
  },
});

/** Centre the whole map in a `w`×`h` pane with a margin (the reset view). */
