// The ids of the Spatial rule's members, shared between the rule that defines
// them (rules/spatial.ts) and core code that must read a positional actor
// generically without importing the rule (World.renderSnapshot). Keeping them
// here — plain constants, no imports — lets core stay decoupled from the rule
// layer while still speaking its vocabulary.

export const SPATIAL = {
  rule: 'spatial',
  trait: 'positional',
  position: 'position',
  scale: 'scale',
  rotation: 'rotation',
  skew: 'skew',
  intrinsicSize: 'intrinsicSize',
  // The event every actor gets for nothing: it was placed in a world. Here
  // rather than only in the rule because `World.place` is what raises it, and
  // core reaches the rule's members by id (`World.renderSnapshot` does the
  // same for the transform).
  created: 'created',
  // …and the other end of the same fact. Not raised by `clear world`, which
  // empties a world rather than removing anybody from it (`rules/spatial`).
  removed: 'removed',
} as const;

// The Animation rule's member ids, shared with core so `World.renderSnapshot`
// can read an actor's appearance (its selected sprite/animation and the current
// frame index) without importing the rule — the same decoupling `SPATIAL` gives
// for the transform. Appearance is its own trait (rules/animation.ts), elected
// separately from the positional transform.
export const APPEARANCE = {
  rule: 'animation',
  trait: 'appearance',
  sprite: 'sprite',
  // Which cell of a spritesheet the static sprite draws, as two vectors: where
  // it starts and how big it is. A size of (0, 0) means the whole image.
  spriteCellOrigin: 'spriteCellOrigin',
  spriteCellSize: 'spriteCellSize',
  animation: 'animation',
  // How solid the actor is drawn, 0 to 1. On APPEARANCE and not on the
  // positional foundation, which is the line a Camera falls on: it has a
  // position and no appearance (specs/VIEWPORT.md), and a camera you could
  // fade would be a camera nobody draws.
  opacity: 'opacity',
  frame: 'frame',
  elapsed: 'elapsed',
  done: 'done',
  playing: 'playing',
  restart: 'restart',
} as const;
