// Where the preview's playhead is.
//
// The editor's preview plays an animation the way the engine does — frame by
// frame, each held for its own delay — and the transport (play, pause, step,
// speed) is all in terms of ONE number: how far into the animation, in authored
// milliseconds, playback has got. These turn that number into a frame and back.
//
// Out here rather than in the component because they are the part with edges: a
// time past the end, a first frame with nothing before it, an animation that
// does not loop.
//
// In resolved milliseconds, not frames: how long a frame is held is the
// animation's business (timing.durations, which asks the engine's rule), and
// none of this cares why it is 125 rather than 83.

/** How long one run through takes, in milliseconds. */
export function totalTime(durations: readonly number[]): number {
  return durations.reduce((sum, delay) => sum + delay, 0);
}

/**
 * Which frame is on screen `t` milliseconds in.
 *
 * Clamped at both ends: a negative time is the first frame, and a time past the
 * end is the last — a caller that wants looping wraps `t` itself, because
 * whether an animation loops is the animation's business.
 */
export function frameAt(durations: readonly number[], t: number): number {
  let acc = 0;
  for (let index = 0; index < durations.length; index++) {
    acc += durations[index];
    if (t < acc) {
      return index;
    }
  }
  return durations.length - 1;
}

/** When a frame begins, in milliseconds from the start. */
export function startOf(durations: readonly number[], index: number): number {
  return totalTime(durations.slice(0, Math.max(0, index)));
}

/**
 * The frame drawn before a given one, for the onion skin — or -1 if none is.
 *
 * The first frame of a looping animation follows the last, which is exactly the
 * pair that has to line up and the pair nothing else would show together. The
 * first frame of one that does not loop follows nothing.
 */
export function previousFrame(
  count: number,
  index: number,
  loop: boolean,
): number {
  if (count < 2 || index < 0 || index >= count) {
    return -1;
  }
  if (index > 0) {
    return index - 1;
  }
  return loop ? count - 1 : -1;
}
