// The Spatial rule ("Has Space") — the foundation every other rule builds on.
// Its one trait, "Can Be Positioned", gives an Actor a position, scale,
// rotation, and vertical skew, plus the actions to change them (DESIGN.md).

import {RuleBuilder} from '../builders/RuleBuilder';
import type {Actor} from '../core/Actor';
import {
  all,
  filtered,
  type ActorSource,
  type ActorValue,
  LazyActors,
} from '../core/actorValue';
import {SPATIAL} from '../core/spatialKeys';
import {advanceTween} from '../core/tween';
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

/**
 * The actors within `distance` of any of `of` — the neighborhood query.
 *
 * `the actors in ⟨…⟩ within ⟨60⟩ of ⟨this actor⟩`, and the block that makes a
 * flock, a swarm or a crowd sayable. Written with `filter actors` instead it is
 * a distance formula spelled out in arithmetic in front of a lesson that is
 * about none of it; written over `all actors` it is not a neighborhood at all.
 *
 * IT LIVES HERE because a distance is a question about POSITIONS, which is what
 * this rule owns. The other list operations are in `core/actorValue` and know
 * nothing about where an actor is — measuring one would mean core importing the
 * rule layer, which is the dependency `core/spatialKeys` exists to avoid.
 *
 * FROM MIDDLE TO MIDDLE, not edge to edge. Two things a hundred pixels apart
 * are a hundred apart whatever size they are drawn, which is what a learner
 * measuring a neighborhood means; overlapping is Collisions' question and it
 * answers that one properly.
 *
 * NEAR ANY OF THEM, when several are given: `within ⟨80⟩ of ⟨any Guard⟩` is
 * every actor near a guard, which is what those words say.
 *
 * IT LEAVES OUT WHAT IT MEASURES FROM. A thing is not near itself, and a boid
 * asking how many neighbors it has should not count one for being present. A
 * game that wants the whole group has the group already.
 *
 * Lazy, like every other list operation, so `take ⟨3⟩ of` stops at three.
 */
export function within(
  value: ActorSource,
  of: ActorValue,
  distance: number,
): LazyActors {
  const centers = all(of);
  // A negative or unfinished distance is a neighborhood nothing is in, rather
  // than an error a learner has to guard: an empty socket reads as 0 and a
  // radius of nothing should find nothing.
  const reach = Number.isFinite(distance) ? distance : -1;
  const world = centers[0]?.world;
  // ASKED OF THE WORLD when the source IS the world, which is the shape every
  // flock is written in: `the actors in ⟨all actors⟩ within ⟨80⟩ of ⟨this
  // actor⟩`, once per actor per frame. Measured over one frame, one query per
  // actor: 5.0ms at 150 actors and 17.0ms at 300 measuring every pair, against
  // 0.54ms and 0.89ms asking the index (`core/spatialIndex`). Sixteen point
  // seven milliseconds is a frame, so the old shape spent the whole of one at
  // three hundred — before gravity, before drawing — which is the size
  // `simulation/many` walks a learner up to on purpose.
  //
  // Identity, not a type test: `world.actors` is one object for the life of a
  // world, and it is what `all actors` compiles to. A narrower source — the
  // actors somebody collected, a filtered list — is not the world and takes the
  // walk below, which is the right answer rather than a fallback: the index
  // knows about every actor and would hand back ones the source left out.
  if (world && reach >= 0 && (value as unknown) === world.actors) {
    return new LazyActors(function* () {
      // ORDER IS THE INDEX'S HERE, and the walk's below. What a neighborhood
      // IS is a set — `is anything near me`, `how many`, `steer toward each` —
      // and nothing in the language asks for the first of one in a way that
      // could mean something. `the actor with the least ⟨distance⟩` is how you
      // ask for the nearest, and it reads them all whatever order they arrive.
      const seen = new Set<Actor>();
      for (const center of centers) {
        for (const near of world.actorsNear(
          center.get(PositionProperty),
          reach,
        )) {
          // A thing is not near itself, and near any of several is still once.
          if (!centers.includes(near) && !seen.has(near)) {
            seen.add(near);
            yield near;
          }
        }
      }
    });
  }
  return filtered(
    value,
    actor =>
      !centers.includes(actor) &&
      centers.some(center => gap(actor, center) <= reach),
  );
}

/** How far apart two actors' middles are. */
function gap(one: Actor, other: Actor): number {
  const here = one.get(PositionProperty);
  const there = other.get(PositionProperty);
  return Math.hypot(here.x - there.x, here.y - there.y);
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

/**
 * Raised on an actor the first time a world holds it.
 *
 * ON THE SPATIAL RULE because being in a world is what this rule is about: an
 * actor's position, its scale, whether it has left the map — and now the
 * moment it arrived. It is not an ability and nothing elects it; every actor
 * is created, the way every actor has a position.
 *
 * QUEUED, LIKE EVERY EVENT, so a handler runs after the tick rather than in
 * the middle of whatever placed the actor — which matters more here than
 * elsewhere, because the commonest thing to do when an actor appears is to add
 * ANOTHER one, and a world that grew an actor while it was being built or
 * walked is a world mutating a list somebody is iterating.
 *
 * So an actor placed while the world is being described hears this on the
 * first tick, and one spawned during a tick hears it on the next. What that
 * costs is a frame; what it buys is that `add actor` inside the handler is the
 * same ordinary call it is anywhere else.
 *
 * THIS IS WHAT LETS AN ACTOR BRING ITS OWN COMPANY (specs/ENHANCEMENTS.md). A
 * health bar over an actor's head used to have to be placed by the WORLD and
 * pointed back at the actor, so giving one actor a bar meant editing every
 * world it appears in — and two of that actor shared one bar. An actor that
 * hears its own creation can add its bar itself, which is both fewer files to
 * edit and one bar each.
 */
export const CreatedEvent = rule.addEvent(SPATIAL.created, {
  name: 'is created',
});

/**
 * Raised on an actor when it is taken out of the world it was in.
 *
 * The other end of `is created`, and it exists for the same reason: an actor
 * that brings company has to be able to take it away again. A health bar over
 * a head is placed by the actor it is about, and an actor removed with its bar
 * still in the world leaves a bar about nobody, hanging where its subject used
 * to be (specs/ENHANCEMENTS.md).
 *
 * QUEUED, like everything else, so it is dispatched on the tick after the
 * removal — by which time the actor is out of the world's list and its `world`
 * back-reference is gone. That is not a problem for a handler: an event
 * handler is passed the world it is being dispatched by, so `remove actor
 * ⟨…⟩` works from a handler on an actor that has itself left.
 *
 * NOT RAISED BY `clear world`, and that is a decision rather than an
 * oversight. Emptying a world is not something that happens TO each actor in
 * it — nothing survives to react, a companion would be cleared by the same
 * sweep, and a hundred handlers running as a level is torn down is a hundred
 * chances to put something back into a world that is being emptied.
 */
export const RemovedEvent = rule.addEvent(SPATIAL.removed, {
  name: 'is removed',
});

/**
 * Raised on an actor when one of its tweens reaches its end.
 *
 * On the SPATIAL rule because a tween is not about appearance — it moves any
 * property with a path between two values, and position is the obvious one.
 * The value carried is the tween's name, so one handler can answer for several
 * ("when a tween finishes: if it was `fade out`, remove me").
 */
export const TweenFinishedEvent = rule.addEvent('tweenFinished', {
  name: 'a tween finishes',
});

/**
 * Advance every tween in flight, once a frame.
 *
 * IN `adjust`, after `move` and before `touch`. A tween is an authored
 * instruction and the simulation is not, so when both write a position the
 * tween is the later word — and collisions then see where the tween actually
 * put things rather than where physics wanted them. For opacity and scale the
 * phase makes no difference; it is position that decides it.
 *
 * The list is copied before walking it: a handler for `a tween finishes` may
 * start another tween, or remove the actor, and a step that mutates the array
 * it is iterating skips its neighbor.
 */
export const AdvanceTweensStep = rule.addStepIn(
  'advanceTweens',
  'adjust',
  (world, delta) => {
    for (const actor of world.actors.with(PositionalTrait)) {
      for (const run of [...actor.tweens()]) {
        if (advanceTween(run, actor, delta)) {
          actor.stopTween(run);
          world.emit(TweenFinishedEvent, actor, run.id);
        }
      }
    }
  },
);

export const SpatialRule = rule.build();
