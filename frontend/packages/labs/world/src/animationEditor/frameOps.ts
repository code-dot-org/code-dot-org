// Operations on a whole list of frames.
//
// The two an animation actually wants and neither of which is worth doing by
// hand: play it backwards, and play it out and back. Both are a minute of
// dragging thumbnails and a mistake waiting to happen; both are three lines
// here, which is the argument for having them.
//
// Generic over the frame, because none of this is about what a frame IS —
// only about the order they come in. That also makes them testable without a
// document, an image, or a canvas.

/** The same frames, last to first. */
export function reversed<T>(frames: readonly T[]): T[] {
  return [...frames].reverse();
}

/**
 * Out and back: the frames, then the ones between the ends again, reversed.
 *
 * A four-frame animation becomes 1 2 3 4 3 2 — six frames that loop smoothly,
 * because the ends are the two the loop joins and playing either twice in a row
 * is a stutter at the turn.
 *
 * `copy` makes each added frame its own: they are new frames that happen to
 * look like existing ones, and a list holding the same frame twice is a list
 * where deleting one deletes both.
 */
export function pingPong<T>(frames: readonly T[], copy: (frame: T) => T): T[] {
  if (frames.length < 3) {
    // Nothing between the ends: 1 2 already plays out and back.
    return [...frames];
  }
  const middle = frames.slice(1, -1).reverse().map(copy);
  return [...frames, ...middle];
}
