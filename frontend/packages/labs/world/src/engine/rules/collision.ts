// The Collision rule ("Has Collisions") — marks actors that can collide and
// provides the `resolve` step other rules order against (DESIGN.md's gravity
// runs "After Collision").
//
// Collision requires Motion: resolution operates on the positions Motion just
// integrated, so `resolve` is ordered *after* Motion's `reposition`. This makes
// the per-tick order a linear chain (velocity → move → resolve → react) rather
// than leaving `reposition` and `resolve` unordered relative to each other.
//
// The `resolve` step is a placeholder for the slice — real AABB resolution is
// later work; the ground-stop the slice needs lives in the Gravity rule, which
// orders its own step after this one.

import {RuleBuilder} from '../builders/RuleBuilder';
import {Vector} from '../core/Vector';

import {MotionRule, RepositionStep} from './motion';
import {PositionalTrait} from './spatial';

const rule = new RuleBuilder({id: 'collision', name: 'Has Collisions'});
rule.requires([MotionRule]);

export const CollidableTrait = rule.addTrait({
  id: 'collidable',
  name: 'Can Collide',
});
CollidableTrait.requires([PositionalTrait]);

export const SizeProperty = CollidableTrait.addProperty(
  'size',
  'vector',
  new Vector(32, 32),
  {name: 'size'},
);

/** Ordering anchor for collision-reactive steps; AABB resolution is later. */
export const ResolveStep = rule.addStepAfter('resolve', RepositionStep, () => {
  // Intentionally empty for the vertical slice.
});

export const CollisionRule = rule.build();
