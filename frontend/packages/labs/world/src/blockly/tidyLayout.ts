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
/** Between one stack and the next down the column. */
const GAP = 32;

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
 * Place every box in ONE column, in the order the workspace already reads in.
 *
 * One column, the definition first and the handlers under it, so a file reads
 * top to bottom as one list. It was columns once — the definition alone and
 * the handlers beside it, wrapping when a column ran long — and a file you
 * had to read in two directions was harder to follow than a long one, now
 * that a long one collapses to its headers (`lazyBodies`).
 *
 * Order is taken from the boxes as they arrive, BY COLUMN: left to right, and
 * top to bottom within a column. Inside one column that is plain top to
 * bottom; a file saved when the layout made columns still reads in the order
 * it did, definition first.
 *
 * A generated actor stacks everything at one x, where this is plain
 * top-to-bottom, which is the order such a file is written in.
 *
 * `keys`, when given, IS the order — smallest first — and the positions say
 * nothing about it. The editor passes them once it has laid a file out: a
 * block keeps the place it was given, and only one the learner moved is
 * placed by where it now is (`orderKeys`).
 *
 * Returns one place per box, in the order the boxes were given.
 */
export function arrangeTopBlocks(
  boxes: readonly Box[],
  keys?: readonly number[],
): Place[] {
  const order = boxes
    .map((box, index) => ({box, index}))
    .sort((a, b) =>
      keys
        ? keys[a.index] - keys[b.index]
        : a.box.x - b.box.x || a.box.y - b.box.y,
    );

  const places: Place[] = new Array<Place>(boxes.length);
  let y = ORIGIN.y;
  for (const {box, index} of order) {
    places[index] = {x: ORIGIN.x, y};
    y += box.height + GAP;
  }
  return places;
}

/**
 * The order to lay top blocks out in, as keys for `arrangeTopBlocks`.
 *
 * A block the layout has placed keeps that place; one it has not — new, or
 * MOVED by the learner since — is placed by where it is now, which is where
 * it was dropped. The keys are the y of each place, so a dropped block
 * compares against the places of the ones around it.
 *
 * Why not just read the positions, as the layout once did: Blockly moves
 * blocks on its own. Expanding a body connects it, and Blockly then nudges
 * apart blocks that overlap — the definition included — so a definition
 * nudged to the right read as last and was laid out at the bottom.
 */
export function orderKeys(
  ids: readonly string[],
  boxes: readonly Box[],
  placed: ReadonlyMap<string, number>,
  moved: ReadonlySet<string>,
): number[] {
  return ids.map((id, index) => {
    const held = placed.get(id);
    return held === undefined || moved.has(id) ? boxes[index].y : held;
  });
}

/**
 * The places a document's top blocks are written at, as remembered places:
 * left to right, then top to bottom, numbered — the order a file reads in
 * as it was saved, before anything has moved a block. A top block written
 * without a position is taken in the order the file lists it.
 */
export function placesOfDocument(
  tops: ReadonlyArray<{id?: string; x?: number; y?: number}>,
): Map<string, number> {
  const positioned = tops.every(
    top => typeof top.x === 'number' && typeof top.y === 'number',
  );
  const order = tops
    .map((top, index) => ({top, index}))
    .sort((a, b) =>
      positioned
        ? a.top.x! - b.top.x! || a.top.y! - b.top.y!
        : a.index - b.index,
    );
  const places = new Map<string, number>();
  order.forEach(({top}, rank) => {
    if (top.id) {
      places.set(top.id, rank);
    }
  });
  return places;
}
