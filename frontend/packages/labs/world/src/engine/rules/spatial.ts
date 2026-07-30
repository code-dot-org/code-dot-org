// The Spatial rule ("Has Space") — the foundation every other rule builds on.
// Its one trait, "Can Be Positioned", gives an Actor a position, scale,
// rotation, and vertical skew, plus the actions to change them (DESIGN.md).

import {RuleBuilder} from '../builders/RuleBuilder';
import {SPATIAL} from '../core/spatialKeys';
import {Vector, type VectorLike} from '../core/Vector';

// Ids come from the shared SPATIAL table so core's renderSnapshot and this rule
// cannot drift apart.
const rule = new RuleBuilder({id: SPATIAL.rule, name: 'Has Space'});

export const PositionalTrait = rule.addTrait({
  id: SPATIAL.trait,
  name: 'Can Be Positioned',
});

export const PositionProperty = PositionalTrait.addProperty(
  SPATIAL.position,
  'point',
  new Vector(0, 0),
  {name: 'position'},
);
export const ScaleProperty = PositionalTrait.addProperty(
  SPATIAL.scale,
  'point',
  new Vector(1, 1),
  {name: 'scale'},
);
export const RotationProperty = PositionalTrait.addProperty(
  SPATIAL.rotation,
  'number',
  0,
  {name: 'rotation'},
);
export const SkewProperty = PositionalTrait.addProperty(
  SPATIAL.skew,
  'number',
  0,
  {name: 'vertical skew'},
);

/**
 * The actor's intrinsic bounding size in sprite pixels — the box the sprite
 * "fits", before scale. Lives on the positional trait so both the Animation
 * rule (which writes it) and the Collision rule (which reads it as the default
 * collision box) can reach it without depending on each other; the Animation
 * rule owns the writes, publishing the current animation's frame-cell extent
 * (rules/animation.ts). A degenerate `(0, 0)` means "unknown" — no appearance,
 * or a single image whose pixel size the engine cannot know (the engine never
 * interprets pixels) — and Collision falls back to its own default box.
 */
export const IntrinsicSizeProperty = PositionalTrait.addProperty(
  SPATIAL.intrinsicSize,
  'point',
  new Vector(0, 0),
  {readonly: true, name: 'intrinsic size'},
);

export const MoveAction = PositionalTrait.addAction(
  'move',
  (actor, to) => actor.set(PositionProperty, Vector.from(to as VectorLike)),
  {
    name: 'Move to',
    params: [{name: 'to', type: 'point', default: new Vector(0, 0)}],
  },
);
export const RotateAction = PositionalTrait.addAction(
  'rotate',
  (actor, degrees) => actor.set(RotationProperty, degrees as number),
  {name: 'Rotate to', params: [{name: 'degrees', type: 'number', default: 0}]},
);
export const ScaleAction = PositionalTrait.addAction(
  'scaleTo',
  (actor, to) => actor.set(ScaleProperty, Vector.from(to as VectorLike)),
  {
    name: 'Scale to',
    params: [{name: 'to', type: 'point', default: new Vector(1, 1)}],
  },
);
/** Helper that sets both scale components to the same value (DESIGN.md). */
export const ResizeAction = PositionalTrait.addAction(
  'resize',
  (actor, factor) =>
    actor.set(ScaleProperty, new Vector(factor as number, factor as number)),
  {name: 'Resize to', params: [{name: 'factor', type: 'number', default: 1}]},
);

export const SpatialRule = rule.build();
