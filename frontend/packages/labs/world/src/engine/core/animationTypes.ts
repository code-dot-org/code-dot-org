// The animation serialization model (INTERFACE.md §Animations). An Animation is
// a set of frames, each a sprite (optionally a cell of a spritesheet) shown for
// a `delay`; a static sprite is the degenerate one-frame case. These are pure
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
  /** Milliseconds to hold this frame before advancing. */
  delay: number;
}

/** A named animation: an ordered set of frames, looping by default. */
export interface AnimationDef {
  /** Friendly, localizable label for the interface. */
  name?: string;
  frames: AnimationFrame[];
  /** Loop back to frame 0 (default true); when false, holds the last frame and
   *  emits `AnimationEndedEvent`. */
  loop?: boolean;
}

/** The resolved current frame the driver draws for one actor (renderSnapshot). */
export interface FrameState {
  sprite: string;
  cell?: Cell;
  offset: {x: number; y: number};
  scale: number;
}
