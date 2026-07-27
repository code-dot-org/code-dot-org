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
  'vector',
  new Vector(0, 0),
  {name: 'position'},
);
export const ScaleProperty = PositionalTrait.addProperty(
  SPATIAL.scale,
  'vector',
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

export const MoveAction = PositionalTrait.addAction(
  'move',
  (actor, to) => actor.set(PositionProperty, Vector.from(to as VectorLike)),
  {name: 'Move to'},
);
export const RotateAction = PositionalTrait.addAction(
  'rotate',
  (actor, degrees) => actor.set(RotationProperty, degrees as number),
  {name: 'Rotate to'},
);
export const ScaleAction = PositionalTrait.addAction(
  'scaleTo',
  (actor, to) => actor.set(ScaleProperty, Vector.from(to as VectorLike)),
  {name: 'Scale to'},
);
/** Helper that sets both scale components to the same value (DESIGN.md). */
export const ResizeAction = PositionalTrait.addAction(
  'resize',
  (actor, factor) =>
    actor.set(ScaleProperty, new Vector(factor as number, factor as number)),
  {name: 'Resize to'},
);

export const SpatialRule = rule.build();
