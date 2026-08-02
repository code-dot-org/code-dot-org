// Where the preview's playhead is.
//
// The editor's preview plays an animation the way the engine does — frame by
// frame, each held for its own delay — and the transport (play, pause, step,
// speed) is all in terms of ONE number: how far into the animation, in authored
// milliseconds, playback has got. These turn that number into a frame and back.
//
// Out here rather than in the component because they are the part with edges: a
// time past the end, a delay of zero, a first frame with nothing before it, an
// animation that does not loop.

/** As much of a frame as the playhead needs to know. */
export interface Timed {
  delay: number;
}

/** A frame is held for at least a millisecond — a zero delay is not a frame. */
const held = (frame: Timed): number => Math.max(1, frame.delay);

/** How long one run through takes, in milliseconds. */
export function totalTime(frames: readonly Timed[]): number {
  return frames.reduce((sum, frame) => sum + held(frame), 0);
}

/**
 * Which frame is on screen `t` milliseconds in.
 *
 * Clamped at both ends: a negative time is the first frame, and a time past the
 * end is the last — a caller that wants looping wraps `t` itself, because
 * whether an animation loops is the animation's business.
 */
export function frameAt(frames: readonly Timed[], t: number): number {
  let acc = 0;
  for (let index = 0; index < frames.length; index++) {
    acc += held(frames[index]);
    if (t < acc) {
      return index;
    }
  }
  return frames.length - 1;
}

/** When a frame begins, in milliseconds from the start. */
export function startOf(frames: readonly Timed[], index: number): number {
  return totalTime(frames.slice(0, Math.max(0, index)));
}

/**
 * The frame drawn before a given one, for the onion skin — or -1 if none is.
 *
 * The first frame of a looping animation follows the last, which is exactly the
 * pair that has to line up and the pair nothing else would show together. The
 * first frame of one that does not loop follows nothing.
 */
export function previousFrame(
  frames: readonly Timed[],
  index: number,
  loop: boolean,
): number {
  if (frames.length < 2 || index < 0 || index >= frames.length) {
    return -1;
  }
  if (index > 0) {
    return index - 1;
  }
  return loop ? frames.length - 1 : -1;
}
