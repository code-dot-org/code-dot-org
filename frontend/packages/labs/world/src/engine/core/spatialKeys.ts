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
  // The name of the built-in sprite to draw the actor with; empty = a plain
  // rectangle. Lives on the positional trait so every drawable actor can carry
  // one, and renderSnapshot reads it alongside the transform.
  sprite: 'sprite',
  // The name of the built-in animation (a sprite sequence) to play. Takes
  // precedence over `sprite`; empty = none. Also on the positional trait.
  animation: 'animation',
} as const;
