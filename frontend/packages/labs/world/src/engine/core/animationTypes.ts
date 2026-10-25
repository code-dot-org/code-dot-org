// What the driver is told about an actor's picture (INTERFACE.md §Animations).
//
// Pure value shapes. An animation itself is a timeline of keyframes
// (`core/keyframes`), kept on the actor's kind and played by the Animation
// rule (`rules/animation`); what reaches the driver is the picture it shows
// now. `sprite` is an opaque asset name the driver resolves to a self-origin
// URL; the engine never interprets pixels.

/** A source rectangle within a spritesheet image. */
export interface Cell {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The resolved current frame the driver draws for one actor (renderSnapshot). */
export interface FrameState {
  sprite: string;
  cell?: Cell;
  offset: {x: number; y: number};
  scale: number;
}
