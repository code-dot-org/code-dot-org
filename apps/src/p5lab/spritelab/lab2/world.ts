// The World tab's grid model and its compilation into scene-start code
// (experiment; see worldTabEnabled in SpriteLab2View).

import {APP_WIDTH} from '@cdo/apps/p5lab/constants';

import {noteImageReference} from './imageReferences';

// Cells per side of the playfield, for a world being created now. The stored
// world is WORLD_MULTIPLE times this per side, authored ahead of a
// scrollable playfield; only the top-left scene-sized corner runs today.
export const DEFAULT_SCENE_GRID_SIZE = 10;
export const WORLD_MULTIPLE = 3;

export interface WorldCell {
  // Animation name to draw and spawn.
  image: string;
  // Blocks join the 'walls' group (solid environment); sprites are plain.
  kind: 'block' | 'sprite';
}

/** How many playfields wide and high a scene runs. */
export const WORLD_EXTENTS = [1, 2, 3] as const;
export type WorldExtent = (typeof WORLD_EXTENTS)[number];

export interface World {
  // Row-major [row][col]; null = empty cell.
  grid: (WorldCell | null)[][];
  /** The scene runs this many playfields wide and high: the first one at
      the bottom left, the rest to its right and above. Absent means one. */
  extent?: WorldExtent;
}

/**
 * Cells per side of the playfield this world holds. The grid's own
 * dimensions are the source of truth: one project's world is shared by every
 * level that opens its channel, so a size kept in level properties would let
 * two levels disagree about the same stored placements.
 */
export function sceneGridSize(world?: World): number {
  const rows = world?.grid?.length ?? 0;
  return rows ? Math.floor(rows / WORLD_MULTIPLE) : DEFAULT_SCENE_GRID_SIZE;
}

/** Playfield pixels per cell — sprites are placed and sized by this. */
export function cellSize(sceneSize: number): number {
  return APP_WIDTH / sceneSize;
}

export function worldExtent(world?: World): WorldExtent {
  const extent = world?.extent ?? 1;
  return WORLD_EXTENTS.includes(extent) ? extent : 1;
}

/** Cells per side of the whole running world. */
export function runningSize(world?: World): number {
  return sceneGridSize(world) * worldExtent(world);
}

// The stored grid keeps the first playfield at its top-left corner, with
// the spare rows under it and the spare columns to its right. The running
// world puts that playfield at the BOTTOM left: columns are read straight
// across, and the rows above it come from the spare rows, the first spare
// row being the one just above the playfield, so a placement keeps its
// height over the floor whatever the extent.
export function storageRow(
  sceneSize: number,
  extent: number,
  row: number
): number {
  const sky = sceneSize * (extent - 1);
  return row >= sky ? row - sky : sceneSize + (sky - 1 - row);
}

/** The running row a stored row shows at, or null when the extent leaves
    it out. */
export function runningRow(
  sceneSize: number,
  extent: number,
  stored: number
): number | null {
  const sky = sceneSize * (extent - 1);
  if (stored < sceneSize) {
    return stored + sky;
  }
  const row = sky - 1 - (stored - sceneSize);
  return row >= 0 ? row : null;
}

/** The world as it runs and as the editor shows it: a square of
    runningSize cells, row 0 at the top, the floor along the last row. */
export function runningGrid(world?: World): (WorldCell | null)[][] {
  const size = sceneGridSize(world);
  const extent = worldExtent(world);
  const side = size * extent;
  return Array.from({length: side}, (_, row) =>
    Array.from(
      {length: side},
      (_, col) => world?.grid?.[storageRow(size, extent, row)]?.[col] ?? null
    )
  );
}

/** The world at a new extent. Shrinking clears what the smaller world
    leaves out, so growing again starts from empty cells. */
export function setWorldExtent(
  world: World | undefined,
  extent: WorldExtent
): World {
  const base = world?.grid?.length ? world : createEmptyWorld();
  const size = sceneGridSize(base);
  const side = size * extent;
  const grid = base.grid.map((cells, stored) => {
    const shown = runningRow(size, extent, stored) !== null;
    return cells.map((cell, col) => (shown && col < side ? cell : null));
  });
  return {...base, grid, extent};
}

export function createEmptyWorld(
  sceneSize: number = DEFAULT_SCENE_GRID_SIZE
): World {
  const side = sceneSize * WORLD_MULTIPLE;
  return {
    grid: Array.from({length: side}, () =>
      Array.from({length: side}, () => null)
    ),
  };
}

/**
 * The same world at a new playfield size. Growing keeps the playfield's FLOOR
 * at the floor: down is meaningful in a platformer, so a taller playfield adds
 * its new rows above the existing layout rather than below it, and a floor
 * painted along the old bottom row is still a floor. Columns keep their index.
 * Shrinking is refused when it would drop a placement — student work outweighs
 * the requested size — so callers get back a world that may still be larger
 * than they asked for.
 */
export function resizeWorld(
  world: World | undefined,
  sceneSize: number
): World {
  if (!world?.grid?.length) {
    return createEmptyWorld(sceneSize);
  }
  const side = sceneSize * WORLD_MULTIPLE;
  const current = world.grid.length;
  if (current === side) {
    return world;
  }
  // Rows move with the playfield's bottom, in either direction, so a floor
  // stays a floor. Columns keep their index.
  const rowShift = sceneSize - sceneGridSize(world);
  const lost = world.grid.some((cells, row) =>
    cells.some(
      (cell, col) =>
        cell && (row + rowShift < 0 || row + rowShift >= side || col >= side)
    )
  );
  if (lost) {
    return world;
  }
  return {
    ...world,
    grid: Array.from({length: side}, (_, row) =>
      Array.from(
        {length: side},
        (_, col) => world.grid[row - rowShift]?.[col] ?? null
      )
    ),
  };
}

// One placement, as a pure update: safe to apply inside a functional
// sources updater, so rapid paints can't overwrite each other. A world
// without a grid (saved by an older experiment) is treated as empty.
export function paintWorldCell(
  world: World | undefined,
  row: number,
  col: number,
  cell: WorldCell | null
): World {
  // Only the painted row gets a new identity: the editor memoizes its rows
  // on theirs, so the other rows skip their render.
  const grid = (world?.grid ?? createEmptyWorld().grid).slice();
  if (grid[row] && col < grid[row].length) {
    grid[row] = grid[row].slice();
    grid[row][col] = cell;
  }
  return {...world, grid};
}

/** The world with `cell`'s image in one place: cleared from wherever it
    was, then painted at (row, col). */
export function moveWorldCell(
  world: World | undefined,
  row: number,
  col: number,
  cell: WorldCell
): World {
  const grid = (world?.grid ?? createEmptyWorld().grid).map(cells =>
    cells.some(c => c?.image === cell.image)
      ? cells.map(c => (c?.image === cell.image ? null : c))
      : cells
  );
  return paintWorldCell({...world, grid}, row, col, cell);
}

// Interpreted-JS prelude that spawns the world's starter sprites, prepended
// to the scene's compiled program. Blocks spawn before sprites so sprites
// draw on top. Placed items are cell-sized: the prelude pins the default
// sprite size to one cell, which platformer levels already use.
export function compileWorldPrelude(world?: World): string {
  const sceneSize = sceneGridSize(world);
  const extent = worldExtent(world);
  const rows = runningGrid(world);
  const cell = cellSize(sceneSize);
  // The first playfield keeps the canvas's coordinates; the world extends
  // to the right (x past the canvas) and up (y below zero).
  const sky = sceneSize * (extent - 1);
  const blocks: string[] = [];
  const sprites: string[] = [];
  for (let row = 0; row < rows.length; row++) {
    for (let col = 0; col < rows.length; col++) {
      const placement = rows[row]?.[col];
      if (!placement) {
        continue;
      }
      const location = `{x: ${cell / 2 + cell * col}, y: ${
        cell / 2 + cell * (row - sky)
      }}`;
      // The prelude references this image the way a block would; register
      // it for the scene preload's reference set.
      noteImageReference(placement.image);
      const image = JSON.stringify(placement.image);
      if (placement.kind === 'block') {
        blocks.push(`makeNewGroupSprite(${image}, 'walls', ${location});`);
      } else {
        sprites.push(`makeNewSpriteAnon(${image}, ${location});`);
      }
    }
  }
  const size = extent > 1 ? [`setWorldExtent(${extent});`] : [];
  if (!blocks.length && !sprites.length) {
    return size.join('\n');
  }
  return [
    ...size,
    `setDefaultSpriteSize(${cell});`,
    ...blocks,
    ...sprites,
    '',
  ].join('\n');
}
