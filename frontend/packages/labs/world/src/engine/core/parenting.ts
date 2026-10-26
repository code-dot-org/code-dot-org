// Parenting: one actor carried, turned and scaled by another
// (specs/PARENTING.md).
//
// A child's position, rotation and scale are stored IN ITS PARENT'S FRAME and
// its world ones are worked out on demand, up the chain of parents. The word
// `position` keeps meaning the world position everywhere — every rule,
// collision, camera and hit test reads it and means "where in the world" — so
// what changes for a parented actor is only where the number comes from: a
// read composes, a write converts back and stores locally. An actor with no
// parent is exactly what it was.
//
// THE SLOT IS THE LOCAL VALUE. There is no second property for "local
// position": the store an actor already has for `position` holds the local
// one, and for a root the local and the world are the same number. That is
// what keeps a map file honest without a new field — a placement's stored
// position is its local one when it has a parent — and it is why the
// derivation lives in `Actor.get` and `Actor.set` rather than in a rule: the
// property is the same property, read through the parent.
//
// THE ARITHMETIC IS A SCENE TREE'S, which is Phaser's (`TransformMatrix`):
// per node translate, then rotate, then scale, parent first. In degrees, about
// the actor's centre, and without shear, which is applied to the actor's own
// image last and is not inherited.
//
// The rule that declares the properties registers them here (`rules/spatial`),
// because this file cannot import the rule — the rule imports the Actor, and
// the Actor asks here. Until it has registered, nothing is parented.

import type {Actor} from './Actor';
import type {GameEvent, Property} from './types';
import {Vector} from './Vector';

/** What a rule hands over so that `Actor` can derive through a parent. */
export interface ParentingKeys {
  /** Actor-typed: stored as one actor in a list, or an empty list. */
  parent: Property<readonly Actor[]>;
  position: Property<Vector>;
  rotation: Property<number>;
  scale: Property<Vector>;
  /** Raised on the child with the parent as the value, and on the parent
   *  with the child as the value (specs/PARENTING.md, "Events"). */
  events: {
    gotParent: GameEvent;
    lostParent: GameEvent;
    gainedChild: GameEvent;
    lostChild: GameEvent;
  };
}

/** Position, rotation and scale as one thing: a node's transform. */
export interface Transform {
  position: Vector;
  rotation: number;
  scale: Vector;
}

let keys: ParentingKeys | undefined;

export function registerParenting(next: ParentingKeys): void {
  keys = next;
}

/** The registered keys, or undefined before the Space rule has loaded. */
export const parentingKeys = (): ParentingKeys | undefined => keys;

/** Whether `property` is one of the three the parent's frame applies to. */
export const isWorldTransformProperty = (property: Property): boolean =>
  keys !== undefined &&
  (property === keys.position ||
    property === keys.rotation ||
    property === keys.scale);

/**
 * A child's world transform, given its parent's and its own local one.
 *
 *     position = parent.position + rotate(parent.rotation, parent.scale ⊙ local.position)
 *     rotation = parent.rotation + local.rotation
 *     scale    = parent.scale ⊙ local.scale
 */
export function compose(parent: Transform, local: Transform): Transform {
  return {
    position: parent.position.add(
      local.position.multiply(parent.scale).rotate(parent.rotation),
    ),
    rotation: parent.rotation + local.rotation,
    scale: parent.scale.multiply(local.scale),
  };
}

/** A component-wise division that answers 0 where the parent's scale is 0. */
const unscale = (vector: Vector, by: Vector): Vector =>
  new Vector(
    by.x === 0 ? 0 : vector.x / by.x,
    by.y === 0 ? 0 : vector.y / by.y,
  );

/**
 * The local transform that puts a child at `world` under `parent` — the
 * inverse of `compose`, used when something sets a child's world values and
 * when a child is given a parent without moving.
 */
export function toLocal(parent: Transform, world: Transform): Transform {
  return {
    position: unscale(
      world.position.subtract(parent.position).rotate(-parent.rotation),
      parent.scale,
    ),
    rotation: world.rotation - parent.rotation,
    scale: unscale(world.scale, parent.scale),
  };
}

/** The transform an actor STORES: its local one, or its own if it is a root. */
export function localTransformOf(actor: Actor): Transform {
  if (!keys) {
    throw new Error('world-lab: parenting is not registered');
  }
  return {
    position: actor.local(keys.position),
    rotation: actor.local(keys.rotation),
    scale: actor.local(keys.scale),
  };
}

/**
 * Where an actor is in the WORLD: its stored transform composed onto its
 * parent's world transform, all the way up. A root's is its own.
 */
export function worldTransformOf(actor: Actor): Transform {
  const local = localTransformOf(actor);
  const parent = actor.parent();
  return parent ? compose(worldTransformOf(parent), local) : local;
}

/** Whether `candidate` is `actor` or carried, at any depth, by `actor`. */
export function isDescendantOf(candidate: Actor, actor: Actor): boolean {
  // Bounded by the chain, which a cycle would make endless — and refusing a
  // cycle is what this is for, so the walk stops if it comes back round.
  const seen = new Set<Actor>();
  for (let at: Actor | undefined = candidate; at; at = at.parent()) {
    if (at === actor) {
      return true;
    }
    if (seen.has(at)) {
      return false;
    }
    seen.add(at);
  }
  return false;
}
