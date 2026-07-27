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
import type {Actor} from '../core/Actor';
import {Vector} from '../core/Vector';

import {MotionRule, RepositionStep} from './motion';
import {IntrinsicSizeProperty, PositionalTrait, ScaleProperty} from './spatial';

const rule = new RuleBuilder({id: 'collision', name: 'Has Collisions'});
rule.requires([MotionRule]);

export const CollidableTrait = rule.addTrait({
  id: 'collidable',
  name: 'Can Collide',
});
CollidableTrait.requires([PositionalTrait]);

/**
 * An explicit collision-box size (width, height) in sprite pixels. Optional:
 * the default `(0, 0)` means "auto" — fit the sprite, i.e. defer to the
 * intrinsic size the Animation rule publishes (`IntrinsicSizeProperty`). Set it
 * to override that fit with a hand-tuned box (a tighter feet box, a bigger
 * hitbox). Axis-aligned only for now; a circle shape could join it later (the
 * coin is the obvious candidate).
 */
export const SizeProperty = CollidableTrait.addProperty(
  'size',
  'vector',
  new Vector(0, 0),
  {name: 'size'},
);

/** The default box for a collidable actor with neither an override nor a sprite. */
const FALLBACK_SIZE = new Vector(32, 32);

/** Whether a size vector is a real, positive-area box (not the "auto" sentinel). */
function isSized(size: Vector): boolean {
  return size.x > 0 && size.y > 0;
}

/**
 * The actor's collision box in world units: the explicit `SizeProperty`
 * override if set, else the intrinsic sprite size the Animation rule published,
 * else a default box — then scaled by the actor's transform. Reads only the
 * positional trait (which `CollidableTrait` requires) and its own override, so
 * Collision inspects the current sprite without depending on the Animation rule.
 */
export function collisionSize(actor: Actor): Vector {
  const override = actor.get(SizeProperty);
  const intrinsic = actor.get(IntrinsicSizeProperty);
  const base = isSized(override)
    ? override
    : isSized(intrinsic)
      ? intrinsic
      : FALLBACK_SIZE;
  const scale = actor.get(ScaleProperty);
  return new Vector(base.x * Math.abs(scale.x), base.y * Math.abs(scale.y));
}

/** Ordering anchor for collision-reactive steps; AABB resolution is later. */
export const ResolveStep = rule.addStepAfter('resolve', RepositionStep, () => {
  // Intentionally empty for the vertical slice.
});

export const CollisionRule = rule.build();
