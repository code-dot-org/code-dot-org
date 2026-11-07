import {describe, expect, it} from 'vitest';

import {nextInGrid, type Box} from '../rovingGrid';

/** Seven 10-pixel tiles wrapped three to a row, the last row short. */
const GRID: Box[] = Array.from({length: 7}, (_, at) => ({
  x: (at % 3) * 10,
  y: Math.floor(at / 3) * 10,
  width: 10,
  height: 10,
}));

describe('nextInGrid', () => {
  it('moves along the run, and stops at its ends', () => {
    expect(nextInGrid(GRID, 3, 'ArrowLeft')).toBe(2);
    expect(nextInGrid(GRID, 3, 'ArrowRight')).toBe(4);
    expect(nextInGrid(GRID, 0, 'ArrowLeft')).toBeUndefined();
    expect(nextInGrid(GRID, 6, 'ArrowRight')).toBeUndefined();
  });

  it('goes to the first and the last', () => {
    expect(nextInGrid(GRID, 4, 'Home')).toBe(0);
    expect(nextInGrid(GRID, 4, 'End')).toBe(6);
    expect(nextInGrid(GRID, 0, 'Home')).toBeUndefined();
  });

  it('goes up and down a column', () => {
    expect(nextInGrid(GRID, 4, 'ArrowUp')).toBe(1);
    expect(nextInGrid(GRID, 1, 'ArrowDown')).toBe(4);
    expect(nextInGrid(GRID, 1, 'ArrowUp')).toBeUndefined();
  });

  it('lands on the nearest of a short row', () => {
    expect(nextInGrid(GRID, 5, 'ArrowDown')).toBe(6);
    expect(nextInGrid(GRID, 6, 'ArrowDown')).toBeUndefined();
  });

  it('ignores the other keys', () => {
    expect(nextInGrid(GRID, 3, 'Enter')).toBeUndefined();
  });
});
