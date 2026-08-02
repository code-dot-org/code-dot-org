// An animation's timing, as the editor presents it.
//
// The file lets a frame name its own delay and the animation name a rate for
// the ones that do not (engine/core/animationTypes). Nearly every animation
// wants the second: a walk cycle has ONE timing, and six copies of it are six
// numbers to keep in step by hand. So the editor asks for frames per second,
// and a per-frame delay is what you add when one frame is an exception.
//
// The awkward case is an animation written the old way — every frame carrying
// the same delay, none of them meaning to be an exception. Changing the rate
// has to clear those, or the field would appear to do nothing; it must NOT
// clear a frame that says something different, because that one was on purpose.

/** As much of a frame as timing needs. */
export interface Timed {
  delay?: number;
}

/** As much of an animation as timing needs. */
export interface Rated<F extends Timed> {
  frameRate?: number;
  frames: F[];
}

/** The delay one frame is held for, resolved the way the engine resolves it. */
export const DEFAULT_DELAY = 100;

export function delayOf(animation: Rated<Timed>, frame: Timed): number {
  if (typeof frame.delay === 'number') {
    return frame.delay;
  }
  if (animation.frameRate && animation.frameRate > 0) {
    return 1000 / animation.frameRate;
  }
  return DEFAULT_DELAY;
}

/**
 * How long each frame is held, in order — what the preview plays by.
 *
 * At least a millisecond each: a frame held for no time is not a frame, and a
 * whole animation of them would take no time at all, which every calculation
 * over the timeline then divides by.
 */
export function durations(animation: Rated<Timed>): number[] {
  return animation.frames.map(frame => Math.max(1, delayOf(animation, frame)));
}

/** The delay every frame shares, or undefined if they do not share one. */
export function uniformDelay(frames: readonly Timed[]): number | undefined {
  if (frames.length === 0) {
    return undefined;
  }
  const first = frames[0].delay;
  if (typeof first !== 'number') {
    return undefined;
  }
  return frames.every(frame => frame.delay === first) ? first : undefined;
}

/**
 * The rate to show for an animation, in frames per second.
 *
 * Its own, if it has one. Otherwise the rate its frames are all running at,
 * which is what a file written frame-by-frame means even though it never says
 * so — showing nothing there would be a lie about an animation that plainly has
 * a rate. Undefined when the frames disagree: there is no one rate to show.
 */
export function shownRate(animation: Rated<Timed>): number | undefined {
  if (animation.frameRate && animation.frameRate > 0) {
    return animation.frameRate;
  }
  const shared = uniformDelay(animation.frames);
  return shared && shared > 0 ? 1000 / shared : undefined;
}

/**
 * Retime an animation to `frameRate`.
 *
 * Frames that were merely keeping the old rate stop saying so — they follow the
 * animation from now on. A frame whose delay was something else keeps it: that
 * is an exception somebody made deliberately, and a rate change is not an
 * instruction to throw it away.
 */
export function retimed<F extends Timed>(
  animation: Rated<F>,
  frameRate: number,
): Rated<F> {
  const wasUniform = uniformDelay(animation.frames);
  const old = shownRate(animation);
  const inStep = wasUniform ?? (old ? 1000 / old : undefined);
  return {
    ...animation,
    frameRate,
    frames: animation.frames.map(frame => {
      if (frame.delay === undefined) {
        return frame;
      }
      // Within half a millisecond of the old rate: a delay written as 83 for
      // 12fps is that rate, not an exception to it.
      const redundant =
        inStep !== undefined && Math.abs(frame.delay - inStep) < 0.5;
      return redundant ? {...frame, delay: undefined} : frame;
    }),
  };
}
