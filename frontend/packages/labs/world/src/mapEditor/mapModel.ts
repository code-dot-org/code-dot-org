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

import {TILE_SIZE} from '../runtime/viewport';

/** The grid a placement snaps to, in world pixels. */
export const DEFAULT_TILE = TILE_SIZE;

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

export function parseMap(contents: string): MapDoc {
  const empty: MapDoc = {
    type: 'map',
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
