// The animation serialization model (INTERFACE.md §Animations). An Animation is
// a set of frames, each a sprite (optionally a cell of a spritesheet), shown at
// the animation's `frameRate` unless the frame names its own `delay`; a static
// sprite is the degenerate one-frame case. These are pure
// value shapes — the AnimationRule (rules/animation.ts) steps them and the
// driver draws the current frame. `sprite` is an opaque asset name the driver
// resolves to a self-origin URL; the engine never interprets pixels.

/** A source rectangle within a spritesheet image. */
export interface Cell {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** One frame of an animation. */
export interface AnimationFrame {
  /** Asset name (a single image or a spritesheet); resolved to a URL by the driver. */
  sprite: string;
  /** The cell within a spritesheet; omitted ⇒ the whole image. */
  position?: Cell;
  /** Draw offset from the actor position (center-drawn); default (0, 0). */
  offset?: {x: number; y: number};
  /** Relative render scale; default 1. */
  scale?: number;
  /**
   * Milliseconds to hold this frame before advancing.
   *
   * An exception, not the rule: omitted, the frame is held for the
   * animation's `frameRate` like every other one. A walk cycle has one timing;
   * what it wants said per frame is the odd frame that pauses.
   */
  delay?: number;
}

/**
 * A named animation: an ordered set of frames, looping by default.
 *
 * Its name is the key it is filed under in the file — `{"animations": {"walk":
 * …}}` — which is also what a `play animation` block holds and what
 * `playAnimation` looks up. There is no second, friendlier name: one was
 * carried here for a while and nothing ever read it, which made it a thing to
 * keep in step with the real name for no benefit.
 */
export interface AnimationDef {
  /**
   * Frames per second, for the frames that do not name a delay.
   *
   * Absent, frames without a delay are held for {@link DEFAULT_FRAME_DELAY}.
   */
  frameRate?: number;
  frames: AnimationFrame[];
  /** Loop back to frame 0 (default true); when false, holds the last frame and
   *  emits `AnimationEndedEvent`. */
  loop?: boolean;
}

/** How long a frame is held when neither it nor its animation says. */
export const DEFAULT_FRAME_DELAY = 100;

/**
 * How long a frame is held, in milliseconds.
 *
 * The one place that decides: a frame's own delay, else the animation's rate,
 * else the default. The engine steps animations by this and the editor's
 * preview plays them by this, so a disagreement between them would be an
 * animation that runs at one speed in the editor and another in the game.
 */
export function frameDelay(
  def: Pick<AnimationDef, 'frameRate'>,
  frame: Pick<AnimationFrame, 'delay'>,
): number {
  if (typeof frame.delay === 'number') {
    return frame.delay;
  }
  if (typeof def.frameRate === 'number' && def.frameRate > 0) {
    return 1000 / def.frameRate;
  }
  return DEFAULT_FRAME_DELAY;
}

/** The resolved current frame the driver draws for one actor (renderSnapshot). */
export interface FrameState {
  sprite: string;
  cell?: Cell;
  offset: {x: number; y: number};
  scale: number;
}
