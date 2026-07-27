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

// After Collision resolves: land affected actors on the topmost ground surface,
// and raise startsFalling / stopsFalling as their state changes. A 1-D vertical
// model for the slice — bounding boxes are resolved with half-extents so an
// actor rests *on* the surface rather than sinking its centre into it, but the
// horizontal axis (does the actor overlap this ground's x-span? which block's
// top?) is still real-AABB work for later.
export const HandleCollisionsStep = rule.addStepAfter(
  'handleCollisions',
  ResolveStep,
  world => {
    // The topmost ground *surface* — each ground's box top, not its centre.
    let groundTop = Infinity;
    for (const ground of world.actors.with(GroundTrait)) {
      const top = ground.get(PositionProperty).y - collisionSize(ground).y / 2;
      groundTop = Math.min(groundTop, top);
    }
    for (const actor of world.actors.with(AffectedByGravityTrait)) {
      const position = actor.get(PositionProperty);
      const velocity = actor.get(VelocityProperty);
      const wasFalling = actor.get(FallingProperty);
      // Rest so the actor's box bottom meets the surface: centre a half-height up.
      const restY = groundTop - collisionSize(actor).y / 2;
      if (position.y >= restY) {
        // Landed: clamp to the surface and stop vertical motion.
        actor.set(PositionProperty, new Vector(position.x, restY));
        actor.set(VelocityProperty, new Vector(velocity.x, 0));
        if (wasFalling) {
          actor.set(FallingProperty, false);
          world.emit(StopsFallingEvent, actor);
        }
      } else if (!wasFalling) {
        // Left the ground.
        actor.set(FallingProperty, true);
        world.emit(StartsFallingEvent, actor);
      }
    }
  },
);

export const GravityRule = rule.build();
