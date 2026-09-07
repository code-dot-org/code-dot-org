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
  type DeclaredSize,
  mapSizeOf,
  viewSizeOf,
} from '../runtime/declaredSizes';
import {
  TILE_SIZE,
  VIEWPORT_HEIGHT,
  VIEWPORT_TILES,
  VIEWPORT_WIDTH,
} from '../runtime/viewport';

const tiles = (size: DeclaredSize): string =>
  `${size.columns} x ${size.rows} tiles ` +
  `(${size.columns * TILE_SIZE} x ${size.rows * TILE_SIZE} pixels)`;

/**
 * One world's line: how big it is, and how much of it is seen at once.
 *
 * The window is only mentioned when the world set it. Saying "and the screen
 * shows 10 x 10" of every world would be three lines of boilerplate per
 * project restating what the paragraph above already said.
 */
const describe = (
  path: string,
  size: DeclaredSize,
  view: DeclaredSize,
): string => {
  const level = size.declared
    ? `- \`${path}\` is ${tiles(size)}, which it sets with ` +
      '`set size of map to`.'
    : `- \`${path}\` does not set a size, so it is one screen: ` +
      `${tiles(size)}.`;
  return view.declared
    ? `${level} It shows ${tiles(view)} at once, which it sets with ` +
        '`set size of view to`.'
    : level;
};

/**
 * The measurements section, or nothing if the project holds no world.
 *
 * `worlds` is every `.world` file by path. Each is measured separately: a
 * project may hold several, and they need not agree.
 */
export const worldMeasurements = (
  worlds: Record<string, string>,
): string | undefined => {
  const paths = Object.keys(worlds).sort();
  if (!paths.length) {
    return undefined;
  }

  return [
    '# How big things are',
    '',
    `One tile is ${TILE_SIZE} pixels square. A world shows ${VIEWPORT_TILES} x ` +
      `${VIEWPORT_TILES} tiles at once — ${VIEWPORT_WIDTH} x ${VIEWPORT_HEIGHT} ` +
      'pixels — unless it says otherwise with `set size of view to`, which is ' +
      'noted below for each world that does. Do not assume any other tile size.',
    '',
    ...paths.map(path =>
      describe(path, mapSizeOf(worlds[path]), viewSizeOf(worlds[path])),
    ),
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
