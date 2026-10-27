// The numbers a world is measured in, told to the tutor once per turn.
//
// A model shown a workspace full of `set position x 208 y 112` has no way to
// know what 208 means, so it asks — "how big is your map?", "what size are your
// tiles?" — which is a turn spent on something the lab already knows. Worse
// than the wasted turn is the guess: 16 and 8 are the common tile sizes in the
// world at large, and a model that assumes one of them places a wall a row and
// a half from where the student wanted it.
//
// So the defaults are stated rather than presumed. Everything here is read from
// the same constants the engine and the map editor read, so this cannot drift
// from the world it describes.

import {
  TILE_SIZE,
  VIEWPORT_HEIGHT,
  VIEWPORT_TILES,
  VIEWPORT_WIDTH,
} from '../runtime/viewport';

/** How big a file says it is, in tiles, or nothing when it does not say. */
const sizeOf = (
  contents: string | undefined,
): {columns: number; rows: number} | undefined => {
  try {
    const size = (
      JSON.parse(contents ?? '') as {size?: {width?: unknown; height?: unknown}}
    ).size;
    const columns = Number(size?.width);
    const rows = Number(size?.height);
    return columns > 0 && rows > 0 ? {columns, rows} : undefined;
  } catch {
    return undefined;
  }
};

const tiles = ({columns, rows}: {columns: number; rows: number}): string =>
  `${columns} x ${rows} tiles ` +
  `(${columns * TILE_SIZE} x ${rows * TILE_SIZE} pixels)`;

const ONE_SCREEN = {columns: VIEWPORT_TILES, rows: VIEWPORT_TILES};

/**
 * The measurements section, or nothing if the project holds no Main Screen
 * and no map.
 *
 * `files` is the project by path. The window is the Main Screen's size, and
 * each map is measured separately: a project may hold several, and they need
 * not agree.
 */
export const worldMeasurements = (
  files: Record<string, string>,
): string | undefined => {
  const screen = files['screens/main.screen'];
  const maps = Object.keys(files)
    .filter(path => path.endsWith('.map'))
    .sort();
  if (screen === undefined && !maps.length) {
    return undefined;
  }
  const view = sizeOf(screen);

  return [
    '# How big things are',
    '',
    `One tile is ${TILE_SIZE} pixels square. Do not assume any other tile ` +
      "size. The game is seen at its Main Screen's size: " +
      (view
        ? `${tiles(view)}, its \`size\`.`
        : `${tiles(ONE_SCREEN)} — ${VIEWPORT_WIDTH} x ${VIEWPORT_HEIGHT} ` +
          'pixels — since it says no other.'),
    '',
    ...maps.map(path => {
      const size = sizeOf(files[path]);
      return size
        ? `- \`${path}\` is ${tiles(size)}, its \`size\`.`
        : `- \`${path}\` says no size, so it is one screen: ${tiles(ONE_SCREEN)}.`;
    }),
    '',
    'Positions are in PIXELS, not tiles, and an actor’s position is its ' +
      `CENTRE. The middle of tile *n* is \`n * ${TILE_SIZE} + ${TILE_SIZE / 2}\`, ` +
      `so the first tile’s center is ${TILE_SIZE / 2} and the fourth’s is ` +
      `${3 * TILE_SIZE + TILE_SIZE / 2}.`,
    '',
    'X grows to the RIGHT and Y grows DOWNWARD, so the top row is y = ' +
      `${TILE_SIZE / 2} and a falling actor’s y increases.`,
    '',
    'Speeds are in UNITS PER SECOND, where one unit is 100 pixels — nothing ' +
      'is per-frame. `amount of gravity` is in units per second squared and ' +
      'defaults to 9.',
  ].join('\n');
};
