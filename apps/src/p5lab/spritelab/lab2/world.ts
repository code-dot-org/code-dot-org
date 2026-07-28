// The World tab's grid model and its compilation into scene-start code
// (experiment; see worldTabEnabled in SpriteLab2View).

import {APP_WIDTH} from '@cdo/apps/p5lab/constants';

// The playfield is 8x8 cells (matching the platform blocks' bitmap grid);
// the world is 3x that per side, authored ahead of a future scrollable
// playfield. Only the top-left scene-sized corner runs today.
export const SCENE_GRID_SIZE = 8;
export const WORLD_GRID_SIZE = SCENE_GRID_SIZE * 3;
export const CELL_SIZE = APP_WIDTH / SCENE_GRID_SIZE;

export interface WorldCell {
  // Animation name to draw and spawn.
  image: string;
  // Blocks join the 'walls' group (solid environment); sprites are plain.
  kind: 'block' | 'sprite';
}

export interface SpriteLab2World {
  // Row-major [row][col]; null = empty cell.
  grid: (WorldCell | null)[][];
}

// One placement, as a pure update: safe to apply inside a functional
// sources updater, so rapid paints can't overwrite each other. A world
// without a grid (saved by an older experiment) is treated as empty.
export function paintWorldCell(
  world: SpriteLab2World | undefined,
  row: number,
  col: number,
  cell: WorldCell | null
): SpriteLab2World {
  const grid = (world?.grid ?? createEmptyWorld().grid).map(cells => [
    ...cells,
  ]);
  if (grid[row] && col < grid[row].length) {
    grid[row][col] = cell;
  }
  return {grid};
}

export function createEmptyWorld(): SpriteLab2World {
  return {
    grid: Array.from({length: WORLD_GRID_SIZE}, () =>
      Array.from({length: WORLD_GRID_SIZE}, () => null)
    ),
  };
}

// Interpreted-JS prelude that spawns the world's starter sprites, prepended
// to the scene's compiled program. Blocks spawn before sprites so sprites
// draw on top. Placed items are cell-sized: the prelude pins the default
// sprite size to one cell, which platformer levels already use.
export function compileWorldPrelude(world?: SpriteLab2World): string {
  const rows = world?.grid ?? [];
  const blocks: string[] = [];
  const sprites: string[] = [];
  for (let row = 0; row < SCENE_GRID_SIZE; row++) {
    for (let col = 0; col < SCENE_GRID_SIZE; col++) {
      const cell = rows[row]?.[col];
      if (!cell) {
        continue;
      }
      const location = `{x: ${CELL_SIZE / 2 + CELL_SIZE * col}, y: ${
        CELL_SIZE / 2 + CELL_SIZE * row
      }}`;
      const image = JSON.stringify(cell.image);
      if (cell.kind === 'block') {
        blocks.push(`makeNewGroupSprite(${image}, 'walls', ${location});`);
      } else {
        sprites.push(`makeNewSpriteAnon(${image}, ${location});`);
      }
    }
  }
  if (!blocks.length && !sprites.length) {
    return '';
  }
  return [
    `setDefaultSpriteSize(${CELL_SIZE});`,
    ...blocks,
    ...sprites,
    '',
  ].join('\n');
}
