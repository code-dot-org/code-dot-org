// Taking an actor out of the world.
//
// The half `addActor` never had, and the one a learner asks for by name: when
// the player touches a coin, the coin goes. What makes it more than a splice is
// WHEN — a removal almost always comes from inside the tick that noticed it, and
// the world is being walked by whatever is running.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, PositionProperty, Vector, WorldBuilder} from '../index';
import type {World} from '../index';

import {
  AffectedByGravityTrait,
  GravityRule,
  GroundTrait,
  StartsFallingEvent,
} from './fixtures/gravityRule';

const place = (world: World, id: string, y = 20) =>
  world.addActor(
    new ActorBuilder({id, name: id})
      .useTraits([AffectedByGravityTrait])
      .set(PositionProperty, new Vector(100, y))
      .instantiate(),
  );

const makeWorld = () => {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([GravityRule])
    .instantiate();
  world.addActor(
    new ActorBuilder({id: 'ground', name: 'Ground'})
      .useTraits([GroundTrait])
      .set(PositionProperty, new Vector(100, 400))
      .instantiate(),
  );
  return world;
};

const ids = (world: World) => [...world.actors].map(actor => actor.id);

describe('World.removeActor', () => {
  it('takes the actor out, by reference or by id', () => {
    const world = makeWorld();
    place(world, 'coin');
    place(world, 'gem');
    const [, coin] = [...world.actors];

    expect(world.removeActor(coin)).toBe(true);
    expect(world.removeActor('gem')).toBe(true);

    expect(ids(world)).toEqual(['ground']);
  });

  it('says so when there is nothing to remove', () => {
    // Removing one already gone does nothing — a handler may fire twice before
    // anyone notices, and that should not be an error.
    const world = makeWorld();
    place(world, 'coin');
    const [, coin] = [...world.actors];
    world.removeActor(coin);

    expect(world.removeActor(coin)).toBe(false);
    expect(world.removeActor('never-existed')).toBe(false);
  });

  it('stops the rules seeing it', () => {
    const world = makeWorld();
    place(world, 'coin');
    const [, coin] = [...world.actors];
    const before = coin.get(PositionProperty).y;

    world.removeActor(coin);
    world.tick(0.2);

    // Gravity moved everything still in the world, and nothing else.
    expect(coin.get(PositionProperty).y).toBe(before);
    expect(world.hasActor('coin')).toBe(false);
  });

  it('cuts the actor’s way back to the world', () => {
    // `addActor` sets that back-reference because placement is what makes it
    // true; removal is what makes it false.
    const world = makeWorld();
    place(world, 'coin');
    const [, coin] = [...world.actors];

    world.removeActor(coin);

    expect(coin.world).toBeUndefined();
  });

  it('waits until the tick is over when asked during one', () => {
    // The case that matters: a handler removes an actor while the world is
    // being walked. Splicing the list underneath that walk would skip the actor
    // after the one removed, so the removal is swept when the tick ends —
    // still before the frame is drawn.
    const world = makeWorld();
    place(world, 'coin');
    place(world, 'gem');
    const [, coin, gem] = [...world.actors];

    let duringHandler: string[] = [];
    coin.on(StartsFallingEvent, (inWorld, actor) => {
      inWorld.removeActor(actor);
      // Still there, mid-tick: the list nothing may be spliced under.
      duringHandler = [...inWorld.actors].map(each => each.id);
    });
    world.emit(StartsFallingEvent, coin);

    world.tick(0.1);

    expect(duringHandler).toContain('coin');
    // …and gone by the time the tick returns, before anything is drawn.
    expect(ids(world)).toEqual(['ground', 'gem']);
    expect(coin.world).toBeUndefined();
    expect(gem.world).toBe(world);
  });

  it('takes out every actor of one kind, and leaves the rest', () => {
    // What `remove actor ⟨any Coin⟩` compiles to: the broadcast over
    // `world.actors.ofType(…)`. Removing all of a kind needs no block of its
    // own — this pair is it — so this pins down that the pair does the job.
    const world = makeWorld();
    for (const id of ['coin1', 'coin2', 'coin3']) {
      world.addActor(
        new ActorBuilder({id: 'coin', name: 'Coin'})
          .set(PositionProperty, new Vector(10, 10))
          .instantiate(id),
      );
    }
    place(world, 'gem');

    // `WorldLab.each` over a snapshot, which is what the generated code does:
    // `ofType` already returns a new array, so the walk is not the list.
    for (const coin of world.actors.ofType('coin')) {
      world.removeActor(coin);
    }

    expect(ids(world)).toEqual(['ground', 'gem']);
  });

  it('empties the world at setup, where nothing is ticking', () => {
    // `WorldBuilder.clear`'s case: place, then replace. Immediate, because
    // there is no walk in progress to disturb.
    const world = makeWorld();
    place(world, 'coin');
    const [, coin] = [...world.actors];

    world.clearActors();

    expect(ids(world)).toEqual([]);
    expect(coin.world).toBeUndefined();
  });

  it('waits until the tick is over when the world is cleared during one', () => {
    // Same hazard as a single removal, and the likelier one: "the exit was
    // touched, take the room away" comes from a handler, which runs inside the
    // walk of the list this empties.
    const world = makeWorld();
    place(world, 'coin');
    place(world, 'gem');
    const [, coin] = [...world.actors];

    let duringHandler: string[] = [];
    coin.on(StartsFallingEvent, inWorld => {
      inWorld.clearActors();
      duringHandler = [...inWorld.actors].map(each => each.id);
    });
    world.emit(StartsFallingEvent, coin);

    world.tick(0.1);

    // Still whole mid-tick, and empty by the time the tick returns.
    expect(duringHandler).toEqual(['ground', 'coin', 'gem']);
    expect(ids(world)).toEqual([]);
    expect(coin.world).toBeUndefined();
  });

  it('leaves the actors after it in place', () => {
    // What deferral is for: a walk that removes one actor must still visit the
    // rest.
    const world = makeWorld();
    place(world, 'a');
    place(world, 'b');
    place(world, 'c');
    const [, a] = [...world.actors];

    // Once: the gravity rule raises this event itself as things start to fall,
    // so the handler can run more than once in a tick.
    const visited: string[] = [];
    let walked = false;
    a.on(StartsFallingEvent, inWorld => {
      if (walked) {
        return;
      }
      walked = true;
      inWorld.removeActor('b');
      for (const actor of inWorld.actors) {
        visited.push(actor.id);
      }
    });
    world.emit(StartsFallingEvent, a);

    world.tick(0.1);

    expect(visited).toEqual(['ground', 'a', 'b', 'c']);
    expect(ids(world)).toEqual(['ground', 'a', 'c']);
  });
});
