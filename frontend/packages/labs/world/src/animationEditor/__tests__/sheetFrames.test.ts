// Cutting a sheet into cells.
//
// The arithmetic between a `.sheet` and an image. Worth its own tests because
// every wrong answer here is a rectangle that runs off the edge of a picture —
// a frame that draws part of its neighbour, or nothing at all.

import {describe, expect, it} from 'vitest';

import type {SheetFile} from '../../appearance/sheetFile';
import {cellIndex, sheetCells, sheetGrid} from '../sheetFrames';

const sheet = (width: number, height = width): SheetFile => ({
  type: 'sheet',
  cell: {width, height},
});

describe('sheetGrid', () => {
  it('counts the cells across and down', () => {
    expect(sheetGrid({width: 192, height: 32}, sheet(32))).toEqual({
      columns: 6,
      rows: 1,
    });
    expect(sheetGrid({width: 128, height: 96}, sheet(32))).toEqual({
      columns: 4,
      rows: 3,
    });
  });

  it('counts whole cells only', () => {
    // 40 pixels of a 32-pixel grid is one cell and a remainder that is not one.
    expect(sheetGrid({width: 40, height: 32}, sheet(32))).toEqual({
      columns: 1,
      rows: 1,
    });
  });

  it('has no grid without both an image and a sheet', () => {
    expect(sheetGrid(undefined, sheet(32))).toEqual({columns: 0, rows: 0});
    expect(sheetGrid({width: 32, height: 32}, undefined)).toEqual({
      columns: 0,
      rows: 0,
    });
    // A cell of no size would be an infinity of them.
    expect(sheetGrid({width: 32, height: 32}, sheet(0))).toEqual({
      columns: 0,
      rows: 0,
    });
  });
});

describe('sheetCells', () => {
  it('reads a strip left to right', () => {
    expect(sheetCells({width: 96, height: 32}, sheet(32))).toEqual([
      {x: 0, y: 0, width: 32, height: 32},
      {x: 32, y: 0, width: 32, height: 32},
      {x: 64, y: 0, width: 32, height: 32},
    ]);
  });

  it('reads a grid row by row', () => {
    const cells = sheetCells({width: 64, height: 64}, sheet(32));
    expect(cells.map(cell => [cell.x, cell.y])).toEqual([
      [0, 0],
      [32, 0],
      [0, 32],
      [32, 32],
    ]);
  });

  it('handles cells that are not square', () => {
    expect(
      sheetCells(
        {width: 32, height: 48},
        {type: 'sheet', cell: {width: 16, height: 24}},
      ),
    ).toHaveLength(4);
  });

  it('is empty when there is no grid', () => {
    expect(sheetCells(undefined, sheet(32))).toEqual([]);
  });
});

describe('cellIndex', () => {
  const cells = sheetCells({width: 96, height: 32}, sheet(32));

  it('says which cell a frame draws', () => {
    expect(cellIndex(cells, {x: 64, y: 0, width: 32, height: 32})).toBe(2);
  });

  it('says nothing for a frame that draws no cell', () => {
    expect(cellIndex(cells, undefined)).toBe(-1);
    expect(cellIndex(cells, {x: 7, y: 0, width: 32, height: 32})).toBe(-1);
  });
});
