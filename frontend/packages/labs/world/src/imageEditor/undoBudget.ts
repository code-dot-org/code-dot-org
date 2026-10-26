// How many undo steps a picture of a given size may keep.
//
// An undo step is a snapshot of every pixel, because that is the only record
// that survives a bucket fill — a fill touches an unbounded region, so a
// diff of what changed is not smaller than the picture in the case that
// matters. Snapshots are therefore priced in whole images, and a backdrop is
// a big one: 1920×1080 is eight megabytes a step, so thirty steps of it is a
// quarter of a gigabyte of history for a drawing nobody has finished yet.
//
// So the depth is a budget rather than a number. Small pictures — the 32×32
// sprites most of this lab is made of — hit the depth cap long before the
// byte cap and keep the full thirty; large ones keep fewer, and never fewer
// than four, because an undo stack of one is not an undo stack.
//
// Its own file because it is arithmetic, and because the alternative is
// finding out by drawing thirty times.

/** Total bytes of snapshots to keep, across the whole stack. */
export const UNDO_BYTE_BUDGET = 16 * 1024 * 1024;
/** Kept however large the picture is: fewer than this is not a history. */
export const MIN_UNDO_DEPTH = 4;
/** Kept however small it is: more than this is hoarding. */
export const MAX_UNDO_DEPTH = 30;

/**
 * How many snapshots of a `width`×`height` picture the stack may hold.
 *
 * Clamped at both ends, so the budget decides only in the middle — which is
 * where a picture is big enough for thirty steps to matter and small enough
 * for four to be a real limitation.
 */
export function undoDepthFor(width: number, height: number): number {
  const bytesPerStep = width * height * 4;
  return Math.min(
    MAX_UNDO_DEPTH,
    Math.max(MIN_UNDO_DEPTH, Math.floor(UNDO_BYTE_BUDGET / bytesPerStep)),
  );
}
