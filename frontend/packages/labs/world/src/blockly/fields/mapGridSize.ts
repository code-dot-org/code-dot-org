// How big the grid a `create ⟨kind⟩ in map` block draws should be.
//
// A world's size is a runtime fact — `World.mapBounds`, in pixels — and the
// editor cannot run the world to ask. What it can do is READ the block that
// declares it: `set size of map to x … y …` is a statement in the same
// workspace, and when its numbers are literal (which is what its shadows are)
// the grid can be drawn at that size.
//
// So this is a static approximation of a runtime value, and it is honest about
// being one. A size computed rather than typed — `x of ⟨map size⟩ x 2` — is not
// readable here, and the grid falls back to one screen rather than guessing.
// The arrangement is stored in PIXELS either way, so a grid that is too small
// only limits where you can click; nothing it has already placed is lost.

import type {Blockly} from '@code-dot-org/blockly';

import {VIEWPORT_TILES} from '../../runtime/viewport';

/** The block that says how big the world is. */
export const SET_MAP_SIZE = 'world_set_map_size';

/**
 * A grid, in tiles.
 *
 * Capped at something a person can still click through: a map may legitimately
 * be enormous, and a field editor that renders four thousand buttons is a
 * frozen tab rather than a feature. Past the cap the grid shows the first part
 * of the map, which is the part an arrangement is usually about.
 */
export interface MapGrid {
  columns: number;
  rows: number;
}

const MAX_TILES = 64;

/** A value socket's number, when it is one that was typed rather than worked out. */
const literal = (block: Blockly.Block, name: string): number | undefined => {
  const target = block.getInputTargetBlock?.(name);
  if (!target || target.type !== 'math_number') {
    return undefined;
  }
  const value = Number(target.getFieldValue('NUM'));
  return Number.isFinite(value) && value > 0 ? value : undefined;
};

// The block is already in tiles, which is the point of it being in tiles: the
// grid draws one cell per tile and has nothing to convert.
const tiles = (declared: number | undefined): number =>
  declared === undefined
    ? VIEWPORT_TILES
    : Math.min(MAX_TILES, Math.max(1, Math.round(declared)));

/**
 * The grid to draw for a block in this workspace.
 *
 * The FIRST declaration in the workspace, which is the only case worth
 * designing for — a world says how big it is once. Several is not an error and
 * the runtime takes the last one executed; the editor takes the first one it
 * finds, and a world whose size changes as it runs is past what a static grid
 * can show anyway.
 */
export function mapGridSize(block: Blockly.Block | null | undefined): MapGrid {
  const declaration = block?.workspace
    ?.getBlocksByType?.(SET_MAP_SIZE, true)
    ?.find(candidate => !candidate.isInsertionMarker?.());
  if (!declaration) {
    return {columns: VIEWPORT_TILES, rows: VIEWPORT_TILES};
  }
  return {
    columns: tiles(literal(declaration, 'X')),
    rows: tiles(literal(declaration, 'Y')),
  };
}
