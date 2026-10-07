// Where the top blocks of a workspace go (specs/LAZY_WORKSPACE_PLAN.md).
//
// A workspace is its top blocks — the definitions and the event hats — in
// columns, and where each one sits is the layout's to say. Only the ORDER is
// the learner's, read off where they put things: a handler dropped between
// two others goes between them, and the rest move down to make room.
//
// A FILE CANNOT LAY ITSELF OUT. The height of a stack is the renderer's answer
// and nobody else's: it depends on the theme, the font that turned up, how deep
// the values nest inside each row, and which of them a learner has collapsed.
// So the generated actors (`actors/stock/workspace`) give their handlers an
// order — distinct, deliberately overlapping positions — and the editor, which
// is the only place a renderer exists, measures what it has and puts it where
// this says, on load and after every edit.
//
// The arithmetic is here, apart from Blockly, so it can be read and tested as
// arithmetic. `tidyTopBlocks` in the editor asks the renderer for the boxes
// and makes the moves.

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

/**
 * Whether a block left at the top of a workspace means nothing there.
 *
 * A block that plugs into something — a row with a notch on top, a value with
 * a plug on its left — only does anything attached: the generator skips it on
 * its own, and the orphan plugin greys it out. A definition or an event hat
 * has neither, and is what a workspace is made of. A shadow or an insertion
 * marker is Blockly's own and is never the learner's to drop.
 */
export const isFreeFloating = (block: {
  previousConnection: unknown;
  outputConnection: unknown;
  isShadow(): boolean;
  isInsertionMarker(): boolean;
}): boolean =>
  !block.isShadow() &&
  !block.isInsertionMarker() &&
  Boolean(block.previousConnection || block.outputConnection);

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
