export const GRID_COLS = 30;
export const GRID_ROWS = 30;

/** The default solid/impassable cell type. */
export const SOLID_CELL = 'solid';

export function createEmptyGrid(): string[][] {
  return Array.from({length: GRID_ROWS}, () => Array(GRID_COLS).fill(''));
}

/**
 * Migrate a legacy boolean grid to the new string format and resize to
 * current GRID_ROWS × GRID_COLS.
 * true → 'solid', false → ''
 */
export function migrateGrid(raw: (string | boolean)[][]): string[][] {
  const grid = createEmptyGrid();
  for (let r = 0; r < Math.min(raw.length, GRID_ROWS); r++) {
    for (let c = 0; c < Math.min(raw[r]?.length ?? 0, GRID_COLS); c++) {
      const cell = raw[r][c];
      if (cell === true) {
        grid[r][c] = SOLID_CELL;
      } else if (cell === false || cell === undefined || cell === null) {
        grid[r][c] = '';
      } else {
        grid[r][c] = String(cell);
      }
    }
  }
  return grid;
}
