export const GRID_SIZE = 50;

/** The default solid/impassable cell type. */
export const SOLID_CELL = 'solid';

export function createEmptyGrid(): string[][] {
  return Array.from({length: GRID_SIZE}, () => Array(GRID_SIZE).fill(''));
}

/**
 * Migrate a legacy boolean grid to the new string format.
 * true → 'solid', false → ''
 */
export function migrateGrid(raw: (string | boolean)[][]): string[][] {
  return raw.map(row =>
    row.map(cell => {
      if (cell === true) {
        return SOLID_CELL;
      }
      if (cell === false || cell === undefined || cell === null) {
        return '';
      }
      return String(cell);
    })
  );
}
