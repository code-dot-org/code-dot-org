// Naming one cell of a spritesheet from a block.
//
// A `set sprite` field holds an image file name, and — when that image is a
// spritesheet — which cell of it: `coinSpin.png#3`, the fourth cell in reading
// order. The INDEX is what is stored, because "the third cell" is what a learner
// means and it survives the art being redrawn.
//
// The rectangle is worked out here, in the editor, and generated into the code.
// The engine is never told about grids (INTERFACE.md §Animations): a frame
// carries the rectangle it draws, and so does a static sprite. That is also why
// this resolution needs the project's `.sheet` files AND its image sizes — a
// cell index means nothing without knowing how many fit across.

import {sheetCells, type CellRect} from '../animationEditor/sheetFrames';
import type {SheetFile} from '../appearance/sheetFile';
import type {ImageSize} from '../runtime/imageSize';

/** What a `set sprite` field's value says. */
export interface SpriteRef {
  /** The image file name — what the driver keys a texture by. */
  sprite: string;
  /** Which cell, in reading order; absent when the whole image is meant. */
  cell?: number;
}

let sheets: Record<string, SheetFile> = {};
let sizes: Record<string, ImageSize> = {};

/** Replace what the editor knows about the project's grids and image sizes. */
export function setProjectGrids(
  nextSheets: Record<string, SheetFile>,
  nextSizes: Record<string, ImageSize>,
): void {
  sheets = nextSheets;
  sizes = nextSizes;
}

/**
 * Split a field value into an image and (maybe) a cell index.
 *
 * Digits and nothing else after the hash: `Number('')` is zero, so a value that
 * merely ends in `#` would otherwise name the first cell of a picture that has
 * none.
 */
export function parseSpriteRef(value: string): SpriteRef {
  const parts = /^(.*)#(\d+)$/.exec(value);
  return parts ? {sprite: parts[1], cell: Number(parts[2])} : {sprite: value};
}

/** How many cells an image holds, or 0 when it is not a sheet (or unmeasured). */
export function cellCount(sprite: string): number {
  return sheetCells(sizes[sprite], sheets[sprite]).length;
}

/**
 * The rectangle a field value names, or undefined for the whole image.
 *
 * Undefined also when the cell cannot be worked out — an image whose bytes the
 * editor never saw, or an index past the end of a grid that has since changed.
 * Drawing the whole picture is a visible wrong answer; a made-up rectangle is
 * not.
 */
export function spriteCell(value: string): CellRect | undefined {
  const {sprite, cell} = parseSpriteRef(value);
  if (cell === undefined) {
    return undefined;
  }
  return sheetCells(sizes[sprite], sheets[sprite])[cell];
}
