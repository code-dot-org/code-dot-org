// The Gravity rule ("Has Gravity") — the DESIGN.md worked example. It applies a
// downward acceleration to any actor "Affected by Gravity" before Motion
// integrates it, and reacts to landing after Collision resolves. It provides two
// traits ("Affected by Gravity", "Acts as Ground") and two events
// ("startsFalling", "stopsFalling").

import {RuleBuilder} from '../builders/RuleBuilder';
import {Vector} from '../core/Vector';

import {
  CollidableTrait,
  CollisionRule,
  ResolveStep,
  collisionSize,
} from './collision';
import {MotionRule, MovableTrait, VelocityProperty} from './motion';
import {PositionProperty} from './spatial';

const rule = new RuleBuilder({id: 'gravity', name: 'Has Gravity'});
rule.requires([MotionRule, CollisionRule]);

// World-scoped: gravity's direction and strength apply to every affected actor.
export const DirectionProperty = rule.addProperty(
  'direction',
  'vector',
  new Vector(0, 1),
  {name: 'direction'},
);
export const StrengthProperty = rule.addProperty('strength', 'number', 900, {
  name: 'strength',
});

/** Flip gravity's direction (world action). */
export const InvertAction = rule.addAction(
  'invert',
  world =>
    world.set(DirectionProperty, world.get(DirectionProperty).rotate(180)),
  {name: 'Invert Gravity'},
);

export const AffectedByGravityTrait = rule.addTrait({
  id: 'affected',
  name: 'Affected by Gravity',
});
AffectedByGravityTrait.requires([MovableTrait, CollidableTrait]);

/** Per-actor multiplier on gravity's strength (heavier / lighter). */
export const GravityScaleProperty = AffectedByGravityTrait.addProperty(
  'scale',
  'number',
  1,
  {name: 'gravity scale'},
);
/** Read-only: the step below owns it. A read-only boolean reads as a query. */
export const FallingProperty = AffectedByGravityTrait.addProperty(
  'falling',
  'boolean',
  false,
  {readonly: true, name: 'is falling?'},
);
export const IsOnGroundQuery = AffectedByGravityTrait.addQuery(
  'isOnGround',
  actor => !actor.get(FallingProperty),
  {name: 'is on the ground?'},
);

export const GroundTrait = rule.addTrait({
  id: 'ground',
  name: 'Acts as Ground',
});
GroundTrait.requires([CollidableTrait]);

export const StartsFallingEvent = rule.addEvent('startsFalling');
export const StopsFallingEvent = rule.addEvent('stopsFalling');

// Before Motion integrates: add this tick's gravity to each affected velocity.
export const ApplyVelocityStep = rule.addStepBefore(
  'applyVelocity',
  MotionRule.steps.reposition,
  (world, delta) => {
    const direction = world.get(DirectionProperty);
    const strength = world.get(StrengthProperty);
    for (const actor of world.actors.with(AffectedByGravityTrait)) {
      const scale = actor.get(GravityScaleProperty);
      const accel = direction.scale(strength * scale * delta);
      actor.set(VelocityProperty, actor.get(VelocityProperty).add(accel));
    }
  },
);

// After Collision resolves: push affected actors out of the ground blocks they
// overlap, and raise startsFalling / stopsFalling as their resting state
// changes. Full axis-aligned box resolution: each overlap is resolved on the
// axis the actor *entered through* — the axis on which it was clear one tick
// ago — so it lands on a block's top, stops at a block's side (a wall), and can
// walk to a block's edge and off it without catching. Using the pre-move
// position (rather than the shallower current overlap) is what avoids two
// classic failures: a fast faller tunnelling to the wrong side, and an actor
// sliding along a surface being ejected sideways near the edge.
//
// Grounds are treated as static; overlaps are resolved per block in turn, which
// is exact for separated blocks. A row of abutting blocks can still snag an
// actor on an interior seam (the min-penetration fallback for a deep, already-
// overlapping hit) — swept resolution across the whole set is the next step up.
export const HandleCollisionsStep = rule.addStepAfter(
  'handleCollisions',
  ResolveStep,
  (world, delta) => {
    const grounds = [...world.actors.with(GroundTrait)];
    for (const actor of world.actors.with(AffectedByGravityTrait)) {
      const size = collisionSize(actor);
      let position = actor.get(PositionProperty);
      let velocity = actor.get(VelocityProperty);
      // Where the actor was before Motion moved it this tick — the entry side.
      const prevX = position.x - velocity.x * delta;
      const prevY = position.y - velocity.y * delta;
      let onGround = false;

      for (const ground of grounds) {
        const groundPosition = ground.get(PositionProperty);
        const groundSize = collisionSize(ground);
        // Centre distance at which the boxes just touch, per axis.
        const reachX = (size.x + groundSize.x) / 2;
        const reachY = (size.y + groundSize.y) / 2;
        const overlapX = reachX - Math.abs(position.x - groundPosition.x);
        const overlapY = reachY - Math.abs(position.y - groundPosition.y);
        if (overlapX <= 0 || overlapY <= 0) {
          continue; // this block isn't touching the actor
        }
        // Resolve on the axis the actor entered through — the one it was clear
        // of a tick ago. If it was already overlapping both (a deep hit), fall
        // back to the shallower axis.
        const clearedY = reachY - Math.abs(prevY - groundPosition.y) <= 0;
        const clearedX = reachX - Math.abs(prevX - groundPosition.x) <= 0;
        const resolveVertical = clearedY || (!clearedX && overlapY <= overlapX);
        if (resolveVertical) {
          if (prevY <= groundPosition.y) {
            position = new Vector(position.x, groundPosition.y - reachY); // on top
            onGround = true;
          } else {
            position = new Vector(position.x, groundPosition.y + reachY); // ceiling
          }
          velocity = new Vector(velocity.x, 0);
        } else {
          if (prevX <= groundPosition.x) {
            position = new Vector(groundPosition.x - reachX, position.y); // left face
          } else {
            position = new Vector(groundPosition.x + reachX, position.y); // right face
          }
          velocity = new Vector(0, velocity.y);
        }
      }

      actor.set(PositionProperty, position);
      actor.set(VelocityProperty, velocity);

      // Resting on a block this tick ⇒ grounded; otherwise falling. Emit only on
      // the transition.
      const wasFalling = actor.get(FallingProperty);
      if (onGround && wasFalling) {
        actor.set(FallingProperty, false);
        world.emit(StopsFallingEvent, actor);
      } else if (!onGround && !wasFalling) {
        actor.set(FallingProperty, true);
        world.emit(StartsFallingEvent, actor);
      }
    }
  },
);

export const GravityRule = rule.build();
