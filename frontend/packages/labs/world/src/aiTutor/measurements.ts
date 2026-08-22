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

/** The largest a map may be, matching the editor's own clamp. */
const MAX_TILES = 64;

interface MapSize {
  columns: number;
  rows: number;
  /** Whether the world said so, or is taking what it is given. */
  declared: boolean;
}

const clamp = (value: number): number =>
  Math.min(MAX_TILES, Math.max(1, Math.round(value)));

/**
 * The size a world file declares, if it declares one.
 *
 * Reads the JSON the same way `mapGridSize` reads the live workspace: the FIRST
 * `set size of map` block, its X and Y inputs, each a plain number. Anything
 * computed is not read — a size that is an expression is a size this cannot
 * state, and saying nothing is better than saying something wrong.
 */
export const declaredMapSize = (contents: string): MapSize | undefined => {
  let found: MapSize | undefined;

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
    if (block.type === 'world_set_map_size') {
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

/** The size a world runs at: what it declared, or the screen. */
export const mapSizeOf = (contents: string): MapSize =>
  declaredMapSize(contents) ?? {
    columns: VIEWPORT_TILES,
    rows: VIEWPORT_TILES,
    declared: false,
  };

const describe = (path: string, size: MapSize): string =>
  size.declared
    ? `- \`${path}\` is ${size.columns} x ${size.rows} tiles ` +
      `(${size.columns * TILE_SIZE} x ${size.rows * TILE_SIZE} pixels), ` +
      'which it sets with `set size of map to`.'
    : `- \`${path}\` does not set a size, so it is one screen: ` +
      `${size.columns} x ${size.rows} tiles ` +
      `(${size.columns * TILE_SIZE} x ${size.rows * TILE_SIZE} pixels).`;

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
    `One tile is ${TILE_SIZE} pixels square. The screen is ${VIEWPORT_TILES} x ` +
      `${VIEWPORT_TILES} tiles, which is ${VIEWPORT_WIDTH} x ${VIEWPORT_HEIGHT} ` +
      'pixels. Do not assume any other tile size.',
    '',
    ...paths.map(path => describe(path, mapSizeOf(worlds[path]))),
    '',
    'Positions are in PIXELS, not tiles, and an actor’s position is its ' +
      `CENTRE. The middle of tile *n* is \`n * ${TILE_SIZE} + ${TILE_SIZE / 2}\`, ` +
      `so the first tile’s centre is ${TILE_SIZE / 2} and the fourth’s is ` +
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
