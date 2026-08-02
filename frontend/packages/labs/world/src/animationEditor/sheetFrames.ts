// Cutting a spritesheet into the cells an animation plays.
//
// A `.sheet` says how big a cell is (appearance/sheetFile); an image says how
// big it is. Between them the cells are decided, and this is that arithmetic —
// kept out of the editor because it is the part worth being exactly right about
// and the part that is easy to check.
//
// Reading order, left to right and top to bottom, because that is the order a
// strip is drawn in and the order the frames of a walk cycle come in. A cell is
// a rectangle in the image, which is what a frame stores (`position`) and what
// the driver hands the texture (PhaserBinding.cellFrame) — a sheet is never a
// thing at runtime, only at the moment somebody chooses frames from one.

import type {SheetFile} from '../appearance/sheetFile';

/** A source rectangle within an image. */
export interface CellRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The size of an image, as much of one as this needs to know. */
export interface ImageSize {
  width: number;
  height: number;
}

/**
 * How many whole cells across and down an image holds.
 *
 * Whole ones only: a sheet whose image is not a round number of cells has a
 * remainder that is not any cell, and offering it would hand back a rectangle
 * that runs off the edge of the picture.
 */
export function sheetGrid(
  image: ImageSize | undefined,
  sheet: SheetFile | undefined,
): {columns: number; rows: number} {
  if (!image || !sheet || sheet.cell.width <= 0 || sheet.cell.height <= 0) {
    return {columns: 0, rows: 0};
  }
  return {
    columns: Math.max(1, Math.floor(image.width / sheet.cell.width)),
    rows: Math.max(1, Math.floor(image.height / sheet.cell.height)),
  };
}

/** Every cell of a sheet, in reading order. */
export function sheetCells(
  image: ImageSize | undefined,
  sheet: SheetFile | undefined,
): CellRect[] {
  const {columns, rows} = sheetGrid(image, sheet);
  const cells: CellRect[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      cells.push({
        x: column * (sheet as SheetFile).cell.width,
        y: row * (sheet as SheetFile).cell.height,
        width: (sheet as SheetFile).cell.width,
        height: (sheet as SheetFile).cell.height,
      });
    }
  }
  return cells;
}

/** Which cell of a sheet a frame's rectangle is, or -1 if it is not one. */
export function cellIndex(
  cells: readonly CellRect[],
  rect: CellRect | undefined,
): number {
  if (!rect) {
    return -1;
  }
  return cells.findIndex(cell => cell.x === rect.x && cell.y === rect.y);
}
