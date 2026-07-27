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
  animation: 'animation',
  frame: 'frame',
  elapsed: 'elapsed',
  done: 'done',
  playing: 'playing',
} as const;
