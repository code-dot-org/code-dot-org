// The World tab's grid model and its compilation into scene-start code
// (experiment; see worldTabEnabled in SpriteLab2View).

import {APP_WIDTH} from '@cdo/apps/p5lab/constants';

import {noteImageReference} from './imageReferences';

// Cells per side of the playfield, for a world being created now. The stored
// grid is the playfield: its side is the playfield's.
export const DEFAULT_SCENE_GRID_SIZE = 10;
// A legacy grid is three times a playfield the lab has had per side (8 at
// first, 10 since) with only its top-left corner in use; trimLegacyWorld
// keeps that corner. Applied as a project's scenes are read (migrateSources).
const LEGACY_WORLD_MULTIPLE = 3;
const LEGACY_PLAYFIELD_SIZES = [8, DEFAULT_SCENE_GRID_SIZE];

export interface WorldCell {
  // Animation name to draw and spawn.
  image: string;
  // Blocks join the 'walls' group (solid environment); sprites are plain.
  kind: 'block' | 'sprite';
}

export interface World {
  // Row-major [row][col]; null = empty cell.
  grid: (WorldCell | null)[][];
}

/**
 * Cells per side of the playfield this world holds. The grid's own
 * dimensions are the source of truth: one project's world is shared by every
 * level that opens its channel, so a size kept in level properties would let
 * two levels disagree about the same stored placements.
 */
export function sceneGridSize(world?: World): number {
  const rows = world?.grid?.length ?? 0;
  return rows || DEFAULT_SCENE_GRID_SIZE;
}

/** Whether a grid has the legacy shape: three times a playfield the lab has
    had per side. Nothing outside the corner was ever shown or run, so the
    shape alone decides. */
export function isLegacyWorld(world?: World): boolean {
  const side = world?.grid?.length ?? 0;
  return LEGACY_PLAYFIELD_SIZES.includes(side / LEGACY_WORLD_MULTIPLE);
}

/** The world cut back to its playfield when its grid has the legacy shape;
    the same world otherwise. */
export function trimLegacyWorld(world: World): World;
export function trimLegacyWorld(world?: World): World | undefined;
export function trimLegacyWorld(world?: World): World | undefined {
  if (!world || !isLegacyWorld(world)) {
    return world;
  }
  const corner = world.grid.length / LEGACY_WORLD_MULTIPLE;
  return {
    ...world,
    grid: world.grid.slice(0, corner).map(cells => cells.slice(0, corner)),
  };
}

/** Playfield pixels per cell — sprites are placed and sized by this. */
export function cellSize(sceneSize: number): number {
  return APP_WIDTH / sceneSize;
}

export function createEmptyWorld(
  sceneSize: number = DEFAULT_SCENE_GRID_SIZE
): World {
  return {
    grid: Array.from({length: sceneSize}, () =>
      Array.from({length: sceneSize}, () => null)
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
  const side = sceneSize;
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
  return {grid};
}

// Interpreted-JS prelude that spawns the world's starter sprites, prepended
// to the scene's compiled program. Blocks spawn before sprites so sprites
// draw on top. Placed items are cell-sized: the prelude pins the default
// sprite size to one cell, which platformer levels already use.
export function compileWorldPrelude(world?: World): string {
  const rows = world?.grid ?? [];
  const sceneSize = sceneGridSize(world);
  const cell = cellSize(sceneSize);
  const blocks: string[] = [];
  const sprites: string[] = [];
  for (let row = 0; row < sceneSize; row++) {
    for (let col = 0; col < sceneSize; col++) {
      const placement = rows[row]?.[col];
      if (!placement) {
        continue;
      }
      const location = `{x: ${cell / 2 + cell * col}, y: ${
        cell / 2 + cell * row
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
  if (!blocks.length && !sprites.length) {
    return '';
  }
  return [`setDefaultSpriteSize(${cell});`, ...blocks, ...sprites, ''].join(
    '\n'
  );
}
