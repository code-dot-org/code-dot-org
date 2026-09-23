// Arranging the top blocks of a workspace so they do not sit on top of one
// another.
//
// A FILE CANNOT LAY ITSELF OUT. The height of a stack is the renderer's answer
// and nobody else's: it depends on the theme, the font that turned up, how deep
// the values nest inside each row, and which of them a learner has collapsed.
// So the generated actors (`actors/stock/workspace`) no longer try. They give
// their handlers an ORDER — distinct, deliberately overlapping positions — and
// the editor, which is the only place a renderer exists, measures what it has
// loaded and puts it somewhere legible.
//
// The arithmetic is here, apart from Blockly, so it can be read and tested as
// arithmetic. `tidyTopBlocks` in the editor is the ten lines that ask the
// renderer for the boxes and hand back the moves.

/** A top block's bounding box, in workspace units. */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Where a box is to go. */
export interface Place {
  readonly x: number;
  readonly y: number;
}

/** The top-left corner everything is laid out from. */
const ORIGIN: Place = {x: 20, y: 20};

/** Between one stack and the next down a column. */
const GAP = 32;

/** Between one column and the next across. */
const GUTTER = 48;

/**
 * How long a column of handlers may get before the next one starts.
 *
 * A FLOOR IN TWO WAYS. A column always takes the first block offered it, so a
 * stack taller than this is not cut in half — nothing can cut a stack in half.
 * And the definition's own height raises it, so the handlers beside a tall
 * `define actor` do not wrap into a third column while the second is still
 * shorter than the thing it stands next to.
 *
 * What it is for: fifteen handlers are four thousand pixels of scrolling, and
 * a workspace no taller than the definition it is about is one a reader can
 * take in.
 */
const COLUMN_HEIGHT = 1600;

/** Do two boxes share any area? Touching edges do not count. */
const overlap = (a: Box, b: Box): boolean =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

/**
 * Is any block sitting on any other?
 *
 * The whole trigger, and deliberately the strict reading. Blocks that merely
 * sit close together are a layout somebody chose; blocks that overlap are a
 * layout nobody chose, because the one underneath cannot be read at all. A
 * learner's own arrangement is left alone unless it has got into that state.
 */
export const anyOverlap = (boxes: readonly Box[]): boolean =>
  boxes.some((box, index) =>
    boxes.slice(index + 1).some(other => overlap(box, other)),
  );

/**
 * Place every box in columns, in the order the workspace already reads in.
 *
 * The first block — whichever is highest, and in an actor file that is the
 * `define actor` stack — takes a column to itself, because it is the thing the
 * file is about and it is usually the tallest thing in it. The rest follow down
 * a column beside it and wrap into another when that column has had enough.
 *
 * Order is taken from the boxes as they arrive, BY COLUMN: left to right, and
 * top to bottom within a column. That is the only thing the incoming positions
 * are used for, and it has to be the column-wise reading rather than the
 * row-wise one or the arrangement would not survive being run on its own
 * output — sorting by y alone walks across the columns it just made, and the
 * second pass deals them out in a different order than the first.
 *
 * A generated actor stacks everything at one x, where this degenerates to
 * plain top-to-bottom, which is the order such a file is written in.
 *
 * Returns one place per box, in the order the boxes were given.
 */
export function arrangeTopBlocks(boxes: readonly Box[]): Place[] {
  const order = boxes
    .map((box, index) => ({box, index}))
    .sort((a, b) => a.box.x - b.box.x || a.box.y - b.box.y);

  /** How far down a column may run before the next one starts. */
  const budget = Math.max(COLUMN_HEIGHT, order[0]?.box.height ?? 0);

  const places: Place[] = new Array<Place>(boxes.length);
  let columnX = ORIGIN.x;
  let columnWidth = 0;
  let y = ORIGIN.y;
  /** Whether the column has anything in it, which decides if it may wrap. */
  let started = false;

  for (const [rank, {box, index}] of order.entries()) {
    // The first block keeps a column of its own: the next one starts beside it
    // however short it turned out to be.
    const wrap = started && (rank === 1 || y + box.height > ORIGIN.y + budget);
    if (wrap) {
      columnX += columnWidth + GUTTER;
      columnWidth = 0;
      y = ORIGIN.y;
    }
    places[index] = {x: columnX, y};
    columnWidth = Math.max(columnWidth, box.width);
    y += box.height + GAP;
    started = true;
  }

  return places;
}
