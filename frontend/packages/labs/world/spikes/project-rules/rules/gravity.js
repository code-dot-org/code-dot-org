// A project-authored copy of the built-in Gravity rule (engine/rules/gravity.ts),
// proving a rule can live in the learner's project instead of the engine bundle.
// It imports only PRIMITIVES (RuleBuilder, Vector) and the RULES it depends on
// (Motion, Collision, and their members) from `world-lab` — everything a
// built-in rule reaches for is on the public `world-lab` surface, so the port is
// mechanical: drop the relative imports for `world-lab`, drop the TS types.
//
// Verified (spikes/project-rules/FINDINGS.md): with this file and scenes/spike.js
// added to the default project and ENTRY_FILE pointed at the spike, the preview
// compiles it (esbuild, ~900ms) and runs it — the player falls and lands, and
// the project rule's startsFalling/stopsFalling events fire.

import {
  RuleBuilder,
  Vector,
  MotionRule,
  CollisionRule,
  ResolveStep,
  collisionSize,
  MovableTrait,
  CollidableTrait,
  VelocityProperty,
  PositionProperty,
} from 'world-lab';

const rule = new RuleBuilder({id: 'gravity', name: 'Has Gravity'});
rule.requires([MotionRule, CollisionRule]);

export const DirectionProperty = rule.addProperty(
  'direction',
  'vector',
  new Vector(0, 1),
  {name: 'direction'},
);
export const StrengthProperty = rule.addProperty('strength', 'number', 900, {
  name: 'strength',
});

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

export const GravityScaleProperty = AffectedByGravityTrait.addProperty(
  'scale',
  'number',
  1,
  {name: 'gravity scale'},
);
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

const CONTACT_EPSILON = 1e-6;

// After Collision resolves: land affected actors on grounds and raise the
// falling/landing events on the transition. (Faithful port of the built-in.)
export const HandleCollisionsStep = rule.addStepAfter(
  'handleCollisions',
  ResolveStep,
  (world, delta) => {
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
        if (Math.abs(position.x - groundPosition.x) >= reachX) {
          continue;
        }
        if (gravityY >= 0) {
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

export default rule.build();
