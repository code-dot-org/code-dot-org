// The window a game is seen through, read from its Main Screen.
//
// Read from the saved file rather than from a running world, because what
// asks is not running one: the map editor draws a guide for a document.

import {TILE_SIZE, VIEWPORT_HEIGHT, VIEWPORT_WIDTH} from './viewport';

/** The largest a screen may be, matching the editor's own clamp. */
const MAX_TILES = 64;

const clamp = (value: number): number =>
  Math.min(MAX_TILES, Math.max(1, Math.round(value)));

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
