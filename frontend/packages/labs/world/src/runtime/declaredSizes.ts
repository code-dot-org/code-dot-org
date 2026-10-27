// What a `.world` file says about size, read from its stored JSON.
//
// Two questions, one shape: how big the level is (`set size of map`), and how
// much of it is on screen at once (`set size of view`). Both are read from the
// saved workspace rather than from a running world, because the things that ask
// are not running one — the tutor is describing a project it has been handed,
// and the map editor is drawing a guide for a document.
//
// Anything computed is not read. A size that is an expression is a size this
// cannot state, and saying nothing is better than saying something wrong.

import {
  TILE_SIZE,
  VIEWPORT_HEIGHT,
  VIEWPORT_TILES,
  VIEWPORT_WIDTH,
} from './viewport';

/** How big something is, in tiles, and whether the world said so. */
export interface DeclaredSize {
  columns: number;
  rows: number;
  /** Whether the world said so, or is taking what it is given. */
  declared: boolean;
}

/** The largest a map may be, matching the editor's own clamp. */
const MAX_TILES = 64;

const clamp = (value: number): number =>
  Math.min(MAX_TILES, Math.max(1, Math.round(value)));

/**
 * The size a world file declares with one kind of block, if it declares one.
 *
 * Reads the JSON the same way `mapGridSize` reads the live workspace: the FIRST
 * block of that type, its X and Y inputs, each a plain number. Anything
 * computed is not read — a size that is an expression is a size this cannot
 * state, and saying nothing is better than saying something wrong.
 *
 * Two blocks answer to this and they mean different things. `set size of map`
 * is how big the level is; `set size of view` is how much of it is on screen.
 * A platformer sets the first and leaves the second, a one-room puzzle sets
 * both to the same thing, and telling the tutor one when it asked about the
 * other would misplace every block it suggests.
 */
const declaredSize = (
  contents: string,
  type: string,
): DeclaredSize | undefined => {
  let found: DeclaredSize | undefined;

  const visit = (node: unknown): void => {
    if (found || !node) {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (typeof node !== 'object') {
      return;
    }
    const block = node as {
      type?: string;
      inputs?: Record<
        string,
        {block?: {type?: string; fields?: {NUM?: number}}}
      >;
    };
    if (block.type === type) {
      const axis = (name: 'X' | 'Y'): number | undefined => {
        const inner = block.inputs?.[name]?.block;
        const value = Number(inner?.fields?.NUM);
        return inner?.type === 'math_number' &&
          Number.isFinite(value) &&
          value > 0
          ? clamp(value)
          : undefined;
      };
      const columns = axis('X');
      const rows = axis('Y');
      if (columns !== undefined && rows !== undefined) {
        found = {columns, rows, declared: true};
        return;
      }
    }
    Object.values(block).forEach(visit);
  };

  try {
    visit(JSON.parse(contents));
  } catch {
    // A world that does not parse is one the editor could not open either.
    // Nothing to measure, and not this file's business to complain.
    return undefined;
  }
  return found;
};

/** How big the level is, if the world says. */
export const declaredMapSize = (contents: string): DeclaredSize | undefined =>
  declaredSize(contents, 'world_set_map_size');

/** How much of it is on screen, if the world says. */
export const declaredViewSize = (contents: string): DeclaredSize | undefined =>
  declaredSize(contents, 'world_set_view_size');

/** The standard window, which a world that says nothing gets. */
export const SCREEN: DeclaredSize = {
  columns: VIEWPORT_TILES,
  rows: VIEWPORT_TILES,
  declared: false,
};

/** The size a world runs at: what it declared, or the screen. */
export const mapSizeOf = (contents: string): DeclaredSize =>
  declaredMapSize(contents) ?? SCREEN;

/** The window that world is seen through: what it declared, or the screen. */
export const viewSizeOf = (contents: string): DeclaredSize =>
  declaredViewSize(contents) ?? SCREEN;

/**
 * The window a game is seen through, in PIXELS: its Main Screen's size, in
 * the engine's tiles, or the standard one for a screen that states none.
 *
 * For the map editor's dashed guide, which is drawn on a document that
 * belongs to no screen. The Main Screen is the game, so its size is the size
 * the game is shown at (`BlocklyGenerator.screenSize`).
 */
export const gameViewSize = (
  screen: string | undefined,
): {w: number; h: number} => {
  let size: {width?: unknown; height?: unknown} | undefined;
  try {
    size = (JSON.parse(screen ?? '') as {size?: typeof size}).size;
  } catch {
    size = undefined;
  }
  const columns = Number(size?.width);
  const rows = Number(size?.height);
  return Number.isFinite(columns) &&
    columns > 0 &&
    Number.isFinite(rows) &&
    rows > 0
    ? {w: clamp(columns) * TILE_SIZE, h: clamp(rows) * TILE_SIZE}
    : {w: VIEWPORT_WIDTH, h: VIEWPORT_HEIGHT};
};
