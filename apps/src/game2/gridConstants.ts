export const GRID_COLS = 30;
export const GRID_ROWS = 30;

export function createEmptyGrid(): string[][] {
  return Array.from({length: GRID_ROWS}, () => Array(GRID_COLS).fill(''));
}
