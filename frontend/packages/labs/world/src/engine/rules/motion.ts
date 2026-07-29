// The Motion rule ("Has Physics") — gives an Actor a velocity and integrates it
// each tick. "Has Velocity" / "Can Move" depends on the Spatial "positional"
// trait, since integrating velocity writes position (DESIGN.md).

import {RuleBuilder} from '../builders/RuleBuilder';
import {Vector, type VectorLike} from '../core/Vector';

import {PositionProperty, PositionalTrait, SpatialRule} from './spatial';

const rule = new RuleBuilder({id: 'motion', name: 'Has Physics'});
rule.requires([SpatialRule]);

export const MovableTrait = rule.addTrait({id: 'movable', name: 'Can Move'});
MovableTrait.requires([PositionalTrait]);

export const VelocityProperty = MovableTrait.addProperty(
  'velocity',
  'vector',
  new Vector(0, 0),
  {name: 'velocity'},
);

/** Apply an instantaneous force — add to velocity (jump, bounce, knockback). */
export const ApplyForceAction = MovableTrait.addAction(
  'applyForce',
  (actor, force) =>
    actor.set(
      VelocityProperty,
      actor.get(VelocityProperty).add(Vector.from(force as VectorLike)),
    ),
  {
    name: 'Apply force',
    params: [{name: 'force', type: 'vector', default: new Vector(0, 0)}],
  },
);

/** Integrate velocity into position: position += velocity * delta. */
export const RepositionStep = rule.addStep('reposition', (world, delta) => {
  for (const actor of world.actors.with(MovableTrait)) {
    const velocity = actor.get(VelocityProperty);
    actor.set(
      PositionProperty,
      actor.get(PositionProperty).add(velocity.scale(delta)),
    );
  }
});

export const MotionRule = rule.build();
