// The Collision rule ("Has Collisions") — the general, gravity-agnostic
// impenetrability: a movable body may not overlap a "Solid" body, on any axis.
// Its `resolve` step is where that push-out happens; Gravity orders its own,
// narrower step ("land on a ground") after it.
//
// Collision requires Motion: resolution operates on the positions Motion just
// integrated, so `resolve` is ordered *after* Motion's `reposition`. This makes
// the per-tick order a linear chain (velocity → move → resolve → react) rather
// than leaving `reposition` and `resolve` unordered relative to each other.
//
// Solidity and "acts as ground" are deliberately separate traits: a Solid body
// blocks all sides (a wall), while Gravity's Ground is the surface an actor
// lands on and may pass *up* through (a jump-through platform). A normal tile
// carries both; the two never had to be the same trait.

import {RuleBuilder} from '../builders/RuleBuilder';
import type {Actor} from '../core/Actor';
import {Vector} from '../core/Vector';

import {
  MotionRule,
  MovableTrait,
  RepositionStep,
  VelocityProperty,
} from './motion';
import {
  IntrinsicSizeProperty,
  PositionProperty,
  PositionalTrait,
  ScaleProperty,
} from './spatial';

const rule = new RuleBuilder({id: 'collision', name: 'Has Collisions'});
rule.requires([MotionRule]);

export const CollidableTrait = rule.addTrait({
  id: 'collidable',
  name: 'Can Collide',
});
CollidableTrait.requires([PositionalTrait]);

/**
 * A body a movable actor cannot pass through, on any side — a wall, a crate, the
 * solid part of a tile. Independent of Gravity's "Acts as Ground": grounds you
 * can jump up through are not solid; walls you never stand on are not ground.
 */
export const SolidTrait = rule.addTrait({id: 'solid', name: 'Solid'});
// A solid has a box other bodies resolve against.
SolidTrait.requires([CollidableTrait]);

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
  'point',
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

/**
 * Push every movable actor out of every solid body it overlaps. Axis-aligned
 * boxes; each overlap is resolved on the axis the actor *entered through* — the
 * one it was clear of a tick ago, reconstructed from its pre-move position. That
 * stops a fast mover at the face it actually crossed (rather than tunnelling to
 * the nearer one) and lets a body slide along a surface to its edge without
 * catching. Solids are treated as static; overlaps are resolved per body, exact
 * for separated bodies (a row of abutting bodies can still snag on an interior
 * seam via the deep-hit fallback — swept resolution is the next step up).
 *
 * This is impenetrability only. Landing on a surface you may pass up through
 * ("Acts as Ground") is Gravity's concern, ordered after this.
 */
export const ResolveStep = rule.addStepAfter(
  'resolve',
  RepositionStep,
  (world, delta) => {
    const solids = [...world.actors.with(SolidTrait)];
    for (const actor of world.actors.with(MovableTrait)) {
      if (!actor.has(CollidableTrait)) {
        continue; // no box to resolve
      }
      const size = collisionSize(actor);
      let position = actor.get(PositionProperty);
      let velocity = actor.get(VelocityProperty);
      // Where the actor was before Motion moved it this tick — the entry side.
      const prevX = position.x - velocity.x * delta;
      const prevY = position.y - velocity.y * delta;

      for (const solid of solids) {
        if (solid === actor) {
          continue; // a movable solid does not resolve against itself
        }
        const solidPosition = solid.get(PositionProperty);
        const solidSize = collisionSize(solid);
        const reachX = (size.x + solidSize.x) / 2;
        const reachY = (size.y + solidSize.y) / 2;
        const overlapX = reachX - Math.abs(position.x - solidPosition.x);
        const overlapY = reachY - Math.abs(position.y - solidPosition.y);
        if (overlapX <= 0 || overlapY <= 0) {
          continue; // not touching this body
        }
        // Resolve on the axis the actor was clear of a tick ago; if it was
        // already overlapping both (a deep hit), fall back to the shallower one.
        const clearedY = reachY - Math.abs(prevY - solidPosition.y) <= 0;
        const clearedX = reachX - Math.abs(prevX - solidPosition.x) <= 0;
        const resolveVertical = clearedY || (!clearedX && overlapY <= overlapX);
        if (resolveVertical) {
          position = new Vector(
            position.x,
            prevY <= solidPosition.y
              ? solidPosition.y - reachY // rest on top
              : solidPosition.y + reachY, // under (ceiling)
          );
          velocity = new Vector(velocity.x, 0);
        } else {
          position = new Vector(
            prevX <= solidPosition.x
              ? solidPosition.x - reachX // left face
              : solidPosition.x + reachX, // right face
            position.y,
          );
          velocity = new Vector(0, velocity.y);
        }
      }

      actor.set(PositionProperty, position);
      actor.set(VelocityProperty, velocity);
    }
  },
);

/**
 * Every collidable actor whose box currently overlaps `actor`'s — the actors it
 * is "touching" — optionally narrowed to one actor `type` (the template id).
 * "Touching" is a collision fact, so only `collidable` actors have a box and can
 * take part: `actor` and each candidate must carry {@link CollidableTrait} (a
 * non-collidable subject touches nothing). Excludes `actor` itself. Reuses
 * `resolve`'s AABB test (`collisionSize` + center overlap) but *reports* contacts
 * instead of pushing bodies apart, and needs the whole actor list — so it is a
 * world-scoped query the Collision rule answers:
 * `world.query(TouchingQuery, actor, type?)`.
 */
export const TouchingQuery = rule.addQuery(
  'touching',
  (world, actorArg, typeArg): Actor[] => {
    const actor = actorArg as Actor;
    const type = typeArg as string | undefined;
    if (!actor.has(CollidableTrait)) {
      return [];
    }
    const position = actor.get(PositionProperty);
    const size = collisionSize(actor);
    const touching: Actor[] = [];
    for (const other of world.actors) {
      if (other === actor || !other.has(CollidableTrait)) {
        continue;
      }
      if (type !== undefined && other.type !== type) {
        continue;
      }
      const otherPosition = other.get(PositionProperty);
      const otherSize = collisionSize(other);
      const overlapX =
        (size.x + otherSize.x) / 2 - Math.abs(position.x - otherPosition.x);
      const overlapY =
        (size.y + otherSize.y) / 2 - Math.abs(position.y - otherPosition.y);
      if (overlapX > 0 && overlapY > 0) {
        touching.push(other);
      }
    }
    return touching;
  },
  {name: 'actors touching'},
);

export const CollisionRule = rule.build();
