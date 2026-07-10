// Rudimentary world-grid dimensions for SpriteLab2. Smaller than Game2's 30x30
// since Sprite Lab's playspace is small; this editor is a placeholder that
// persists to project sources but is not yet wired into the p5.play runtime.
export const GRID_COLS = 16;
export const GRID_ROWS = 16;

export const DEFAULT_WORLD_ID = 'world1';

export function createEmptyGrid(): string[][] {
  return Array.from({length: GRID_ROWS}, () => Array(GRID_COLS).fill(''));
}
