// The motion rule as the ENGINE once shipped it — now a test fixture.
//
// Moving is `rules/stock/motion.ts` now, the last of the physics to leave. What
// kept it here was not difficulty but dependency: Collision, Input and Gravity
// all imported it, and engine code cannot import a project file. Once they were
// `.rule` files, so could this be.
//
// It stays as a fixture because the engine's own tests drive machinery with it —
// step ordering, trait composition, a world that actually moves — alongside the
// gravity and collision fixtures it belongs with.

// The Motion rule ("Has Physics") — gives an Actor a velocity and integrates it
// each tick. "Has Velocity" / "Can Move" depends on the Spatial "positional"
// trait, since integrating velocity writes position (DESIGN.md).

import {RuleBuilder} from '../../builders/RuleBuilder';
import type {Actor} from '../../core/Actor';
import {PIXELS_PER_UNIT} from '../../core/units';
import {Vector, type VectorLike} from '../../core/Vector';
import {
  PositionProperty,
  PositionalTrait,
  SpatialRule,
} from '../../rules/spatial';

const rule = new RuleBuilder({id: 'motion', name: 'Has Physics'});
rule.requires([SpatialRule]);

export const MovableTrait = rule.addTrait({id: 'movable', name: 'Can Move'});
MovableTrait.requires([PositionalTrait]);

/**
 * How fast the actor is going, in UNITS per second (see core/units).
 *
 * Not pixels per second: a walk is `1.5`, not `150`. Integration below is the
 * one place the two meet.
 */
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

/**
 * How far an actor travels in `seconds`, in PIXELS.
 *
 * The conversion from a rate to a distance, in one place. Integration uses it,
 * and so does `position before` below — which is how a rule asks the question
 * without knowing what a unit is.
 */
const travel = (velocity: Vector, seconds: number): Vector =>
  velocity.scale(seconds * PIXELS_PER_UNIT);

/**
 * Where `actor` was `seconds` ago at its current speed, in pixels.
 *
 * Exported for the rules that need the entry side of a contact (Collision, and
 * a landing rule); the query below is the same answer, for a `.rule` to ask.
 */
export const previousPosition = (actor: Actor, seconds: number): Vector =>
  actor
    .get(PositionProperty)
    .subtract(travel(actor.get(VelocityProperty), seconds));

/**
 * Where the actor was `seconds` ago, if it had been going at its current speed.
 *
 * The entry side of a contact: Collision uses it to tell which face an actor
 * came in through, and a landing rule to tell whether it crossed a surface this
 * tick. Both used to compute it by hand from velocity and delta — which meant
 * both had to know that a rate is not a position, and an authored rule had no
 * way to know that at all.
 */
export const PreviousPositionQuery = rule.addQuery(
  'previousPosition',
  (_world, actorArg, seconds): Vector =>
    previousPosition(actorArg as Actor, seconds as number),
  {
    name: 'position before',
    returns: 'vector',
    params: [
      {name: 'actor', type: 'actor'},
      {name: 'seconds', type: 'number'},
    ],
  },
);

/** Integrate velocity into position: position += velocity * delta. */
export const RepositionStep = rule.addStep('reposition', (world, delta) => {
  for (const actor of world.actors.with(MovableTrait)) {
    const velocity = actor.get(VelocityProperty);
    actor.set(
      PositionProperty,
      actor.get(PositionProperty).add(travel(velocity, delta)),
    );
  }
});

export const MotionRule = rule.build();
