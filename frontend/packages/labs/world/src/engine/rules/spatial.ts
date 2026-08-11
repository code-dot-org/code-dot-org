// The Spatial rule ("Has Space") — the foundation every other rule builds on.
// Its one trait, "Can Be Positioned", gives an Actor a position, scale,
// rotation, and vertical skew, plus the actions to change them (DESIGN.md).

import {RuleBuilder} from '../builders/RuleBuilder';
import type {Actor} from '../core/Actor';
import {SPATIAL} from '../core/spatialKeys';
import {Vector, type VectorLike} from '../core/Vector';
import {watchProperty} from '../core/watchProperty';

// Ids come from the shared SPATIAL table so core's renderSnapshot and this rule
// cannot drift apart.
const rule = new RuleBuilder({
  id: SPATIAL.rule,
  name: 'Space',
  ability: 'Has Space',
});

export const PositionalTrait = rule.addTrait({
  id: SPATIAL.trait,
  name: 'Can Be Positioned',
});

export const PositionProperty = PositionalTrait.addProperty(
  SPATIAL.position,
  'point',
  new Vector(0, 0),
  {name: 'position'},
);
export const ScaleProperty = PositionalTrait.addProperty(
  SPATIAL.scale,
  'point',
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

/**
 * The actor's intrinsic bounding size in sprite pixels — the box the sprite
 * "fits", before scale. Lives on the positional trait so both the Animation
 * rule (which writes it) and the Collision rule (which reads it as the default
 * collision box) can reach it without depending on each other; the Animation
 * rule owns the writes (rules/animation.ts), and has two sources: a cell states
 * its own size, and a whole image's is whatever the project measured and stated
 * (`World.imageSize`). The engine still never interprets pixels — it is told.
 *
 * A degenerate `(0, 0)` means "unknown": no appearance, or a picture nobody has
 * measured. Collision falls back to its own default box, and so does "Stays in
 * the Map".
 */
export const IntrinsicSizeProperty = PositionalTrait.addProperty(
  SPATIAL.intrinsicSize,
  'point',
  new Vector(0, 0),
  {readonly: true, name: 'intrinsic size'},
);

export const MoveAction = PositionalTrait.addAction(
  'move',
  (actor, to) => actor.set(PositionProperty, Vector.from(to as VectorLike)),
  {
    name: 'Move to',
    params: [{name: 'to', type: 'point', default: new Vector(0, 0)}],
  },
);
export const RotateAction = PositionalTrait.addAction(
  'rotate',
  (actor, degrees) => actor.set(RotationProperty, degrees as number),
  {name: 'Rotate to', params: [{name: 'degrees', type: 'number', default: 0}]},
);
export const ScaleAction = PositionalTrait.addAction(
  'scaleTo',
  (actor, to) => actor.set(ScaleProperty, Vector.from(to as VectorLike)),
  {
    name: 'Scale to',
    params: [{name: 'to', type: 'point', default: new Vector(1, 1)}],
  },
);
/** Helper that sets both scale components to the same value (DESIGN.md). */
export const ResizeAction = PositionalTrait.addAction(
  'resize',
  (actor, factor) =>
    actor.set(ScaleProperty, new Vector(factor as number, factor as number)),
  {name: 'Resize to', params: [{name: 'factor', type: 'number', default: 1}]},
);

// ── Leaving the map ──────────────────────────────────────────────────────────
// Two ways to ask one question, because a game asks it two ways. A brick game
// asks "has the ball gone past the paddle" at the moment it happens; a shooter
// asks "is this bullet still worth keeping" while it is looking at all of them
// anyway. An event answers the first and a query the second, and neither reads
// well in the other's place.
//
// In the foundation rather than in a rule of their own, because the map's edges
// are not something an actor opts into having. Every actor with a position has
// a position relative to them, and a game that wants to notice one crossing
// should not have to elect a trait to say so.

/**
 * What an actor whose picture nobody measured is assumed to be.
 *
 * The same guess "Stays in the Map" and `collision size of` make, for the same
 * reason: an actor is drawn before anything has said how big its picture is,
 * and one drawn from outside the project may never be measured at all.
 */
const ASSUMED_SIZE = 32;

/**
 * Half the actor's drawn extent — how far its edges reach from its middle.
 *
 * `Math.abs`, because a scale of -1 is how a sprite is flipped to face the
 * other way. Left signed, an actor's own edges land on the wrong sides of it
 * and a flipped bullet is judged gone half a body early.
 */
function halfExtent(actor: Actor): Vector {
  const intrinsic = actor.get(IntrinsicSizeProperty);
  const scale = actor.get(ScaleProperty);
  const width =
    (intrinsic.x > 0 ? intrinsic.x : ASSUMED_SIZE) * Math.abs(scale.x);
  const height =
    (intrinsic.y > 0 ? intrinsic.y : ASSUMED_SIZE) * Math.abs(scale.y);
  return new Vector(width / 2, height / 2);
}

/**
 * Whether an actor at `at` would be ENTIRELY past one of the map's edges.
 *
 * Wholly outside, not "its middle is outside", and that is the difference that
 * makes the block do the useful thing: `remove` a bullet when it leaves and it
 * goes once it is out of sight, rather than while half of it is still drawn.
 *
 * "Stays in the Map" measures the same way. Screen Wrap deliberately does not,
 * and says so in its own header — a thing that vanishes and reappears wants its
 * middle to be what crosses, or it pops.
 *
 * Takes the position rather than reading it, so the watcher below can ask the
 * question of where the actor WAS as easily as where it is.
 *
 * An actor that has not been placed is in no map, and so outside nothing.
 */
function outsideMapAt(actor: Actor, at: Vector): boolean {
  const world = actor.world;
  if (!world) {
    return false;
  }
  const half = halfExtent(actor);
  const bounds = world.mapBounds();
  return (
    at.x + half.x < 0 ||
    at.y + half.y < 0 ||
    at.x - half.x > bounds.x ||
    at.y - half.y > bounds.y
  );
}

/** Asked of an actor: `⟨this actor⟩ is outside the map`. */
export const OutsideMapQuery = PositionalTrait.addQuery(
  'outsideMap',
  (actor: Actor) => outsideMapAt(actor, actor.get(PositionProperty)),
  {name: 'is outside the map', returns: 'boolean'},
);

/** Raised the frame an actor's last edge passes one of the map's. */
export const LeftMapEvent = rule.addEvent('leftMap', {
  name: 'leaves the map',
});

// Noticed at the moment the position changes, not by a step that checks every
// actor every frame.
//
// A step would have to remember, per actor, whether it was inside last time, or
// it could not tell LEAVING from BEING outside — a bit on every actor in every
// world, maintained by a loop that runs in every world, to answer a question
// most worlds never ask. The setter already has both halves of the crossing in
// hand and runs only when the answer can have changed, so there is nothing to
// remember and nothing to sweep.
//
// What this does NOT catch, and a frame loop would: an actor that ends up
// outside without moving, by being scaled down at the edge, or by its picture
// finally being measured. Leaving is something an actor does by moving, and
// `is outside the map` answers the other case for anyone who needs it.
watchProperty(PositionProperty, (actor, previous: Vector, next: Vector) => {
  const world = actor.world;
  if (!world) {
    // Not placed yet: this is an actor being built, not one going anywhere.
    return;
  }
  if (outsideMapAt(actor, previous) || !outsideMapAt(actor, next)) {
    return;
  }
  // At most once a tick. Out, back, and out again inside one tick is two
  // crossings and one departure — a handler that removes the actor or takes a
  // life must not be run twice for a wobble nobody saw drawn.
  if (!world.hasPendingEvent(LeftMapEvent, actor)) {
    world.emit(LeftMapEvent, actor);
  }
});

export const SpatialRule = rule.build();
