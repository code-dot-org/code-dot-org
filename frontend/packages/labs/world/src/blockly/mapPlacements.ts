// The placements a `create actor in map` block carries, and what a click does.
//
// A map that lives in the world rather than beside it (MAPS.md §1): the
// arrangement of a world's own actors is part of that world, so it is the map
// FIELD'S VALUE — Blockly saves and loads it with the block, into the `.world`
// file. One block, one actor type, its own placements; delete the block and
// exactly its actors go with it.
//
// The entries omit `type`: the block's ACTOR field says which actor these are,
// and storing it twice is storing it wrong. The generator supplies it.
//
// The editing model is one function, `toggleCell`. A click means "there should
// be one here" or "there should not", and nothing else — which is what lets the
// editor be a field dropdown rather than a window.

/** One placement, as the block stores it: an id and its overrides. */
export interface MapPlacement {
  id: string;
  /** Per-instance overrides, keyed by owner (trait) id then property id. */
  properties?: Record<string, Record<string, unknown>>;
}

/**
 * What a placement is DRAWN as, as a key — or undefined when its kind's own
 * picture is the answer.
 *
 * Content-derived, so two placements that differ in nothing are rendered once
 * and share the answer — and so an edit to one changes only its own key. The
 * same trick a drawing's texture is cached by (`engine/core/drawing`), one
 * level up.
 *
 * The owner ids are sorted because a key that depended on the order a
 * `properties` object happened to be built in would miss its own cache after an
 * edit that changed nothing.
 */
export const placementKey = (
  type: string,
  properties: Record<string, Record<string, unknown>> = {},
): string | undefined => {
  const owners = Object.keys(properties)
    .filter(owner => owner !== POSITIONAL)
    .sort();
  if (!owners.length) {
    return undefined;
  }
  const described = owners
    .map(owner => {
      const values = properties[owner];
      const inner = Object.keys(values)
        .sort()
        .map(id => `${id}=${JSON.stringify(values[id])}`)
        .join(',');
      return `${owner}{${inner}}`;
    })
    .join(';');
  return `${type}|${described}`;
};

/**
 * The owner every placement overrides, and the one that cannot change a
 * picture.
 *
 * A thumbnail is drawn with no position at all, and the scale and rotation on
 * it are applied by whatever draws the placement rather than baked in. So two
 * actors that differ only in where they stand are one picture — which is most
 * of a map, and the difference between rendering three Labels and rendering
 * forty tiles.
 */
const POSITIONAL = 'positional';

/**
 * A placement's instance id in the running world.
 *
 * Prefixed with the block's id because it must be unique across the world and
 * two blocks may each have a `p1` — and stable across rebuilds, because that is
 * what lets the reconciler tell "the same actor moved" from "a different actor"
 * (MAPS.md §3).
 */
export const instanceId = (blockId: string, placementId: string): string =>
  `${blockId}:${placementId}`;

/** A cell of the map's grid, in tiles from the top-left. */
export interface Cell {
  column: number;
  row: number;
}

/** The world position a cell's centre is at, in world pixels. */
export const cellCentre = (cell: Cell, tile: number) => ({
  x: cell.column * tile + tile / 2,
  y: cell.row * tile + tile / 2,
});

/** Which cell a placement sits in, or undefined if it has no position. */
export const cellOf = (
  placement: MapPlacement,
  tile: number,
): Cell | undefined => {
  const position = placement.properties?.positional?.position as
    | {x?: number; y?: number}
    | undefined;
  if (typeof position?.x !== 'number' || typeof position?.y !== 'number') {
    return undefined;
  }
  return {
    column: Math.floor(position.x / tile),
    row: Math.floor(position.y / tile),
  };
};

const sameCell = (a: Cell, b: Cell) => a.column === b.column && a.row === b.row;

/** The placement in this cell, if this block has one there. */
export const placementAt = (
  placements: readonly MapPlacement[],
  cell: Cell,
  tile: number,
): MapPlacement | undefined =>
  placements.find(placement => {
    const at = cellOf(placement, tile);
    return at && sameCell(at, cell);
  });

/**
 * A free id for a new placement, as `p1`, `p2`, … .
 *
 * Numbered rather than random because these become instance ids in the running
 * world (`instanceId`), and an id that changes on every edit is an actor the
 * hot reloader cannot recognise as the one that was already there.
 */
const nextId = (placements: readonly MapPlacement[]): string => {
  const used = new Set(placements.map(placement => placement.id));
  for (let n = 1; ; n++) {
    if (!used.has(`p${n}`)) {
      return `p${n}`;
    }
  }
};

/**
 * Click a cell: put one there, or take away the one that is.
 *
 * The whole of the editing model — a click means "there should be one here" or
 * "there should not", and nothing else. Which is why the popup can be a field
 * dropdown rather than a window.
 */
export const toggleCell = (
  placements: readonly MapPlacement[],
  cell: Cell,
  tile: number,
): MapPlacement[] => {
  const existing = placementAt(placements, cell, tile);
  if (existing) {
    return placements.filter(placement => placement !== existing);
  }
  return [
    ...placements,
    {
      id: nextId(placements),
      properties: {positional: {position: cellCentre(cell, tile)}},
    },
  ];
};
