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
  {name: 'is on the ground?', returns: 'boolean'},
);

export const GroundTrait = rule.addTrait({
  id: 'ground',
  name: 'Acts as Ground',
});
GroundTrait.requires([CollidableTrait]);

export const StartsFallingEvent = rule.addEvent('startsFalling', {
  name: 'starts falling',
});
export const StopsFallingEvent = rule.addEvent('stopsFalling', {
  name: 'stops falling',
});

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

/** Float slack for the "was on the surface" test (exact resting is `=`). */
const CONTACT_EPSILON = 1e-6;

// After Collision has pushed actors out of solids, land affected actors on the
// surfaces they may stand on, and raise startsFalling / stopsFalling as their
// resting state changes. This is a ONE-WAY, direction-aware landing keyed on
// "Acts as Ground", NOT the general impenetrability (that is Collision's job):
// an actor moving *with* gravity that crosses a ground's facing surface from
// outside is stopped on it; moving *against* gravity it passes straight through
// (a jump-through platform). A ground need not be solid — that orthogonality is
// the whole point. For a tile that is both Solid and Ground, Collision has
// already resolved the contact and this step just records the actor as grounded.
export const HandleCollisionsStep = rule.addStepAfter(
  'handleCollisions',
  ResolveStep,
  (world, delta) => {
    // Sign of gravity along y: > 0 falls down (land on tops), < 0 inverted.
    const gravityY = world.get(DirectionProperty).y;
    const grounds = [...world.actors.with(GroundTrait)];
    for (const actor of world.actors.with(AffectedByGravityTrait)) {
      const size = collisionSize(actor);
      let position = actor.get(PositionProperty);
      let velocity = actor.get(VelocityProperty);
      const prevY = position.y - velocity.y * delta;
      let grounded = false;

      for (const ground of grounds) {
        const groundPosition = ground.get(PositionProperty);
        const groundSize = collisionSize(ground);
        const reachX = (size.x + groundSize.x) / 2;
        const reachY = (size.y + groundSize.y) / 2;
        // Must be over/under the surface to stand on it.
        if (Math.abs(position.x - groundPosition.x) >= reachX) {
          continue;
        }
        if (gravityY >= 0) {
          // Down: the standable surface is the ground's TOP. Land while falling
          // (v.y ≥ 0) after crossing it from above (was at/above it last tick).
          const restY = groundPosition.y - reachY;
          if (
            velocity.y >= 0 &&
            prevY <= restY + CONTACT_EPSILON &&
            position.y >= restY
          ) {
            position = new Vector(position.x, restY);
            velocity = new Vector(velocity.x, 0);
            grounded = true;
          }
        } else {
          // Inverted: the standable surface is the ground's BOTTOM.
          const restY = groundPosition.y + reachY;
          if (
            velocity.y <= 0 &&
            prevY >= restY - CONTACT_EPSILON &&
            position.y <= restY
          ) {
            position = new Vector(position.x, restY);
            velocity = new Vector(velocity.x, 0);
            grounded = true;
          }
        }
      }

      actor.set(PositionProperty, position);
      actor.set(VelocityProperty, velocity);

      // Resting on a ground this tick ⇒ grounded; otherwise falling. Emit only
      // on the transition.
      const wasFalling = actor.get(FallingProperty);
      if (grounded && wasFalling) {
        actor.set(FallingProperty, false);
        world.emit(StopsFallingEvent, actor);
      } else if (!grounded && !wasFalling) {
        actor.set(FallingProperty, true);
        world.emit(StartsFallingEvent, actor);
      }
    }
  },
);

export const GravityRule = rule.build();
