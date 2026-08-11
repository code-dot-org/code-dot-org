// Space's two ways of asking about the map's edges: `is outside the map`, and
// the event raised the frame an actor crosses one.
//
// They are one question asked twice because a game asks it twice — a brick game
// wants the moment the ball goes past the paddle, a shooter wants to sweep its
// bullets and drop the ones that are gone. What these pin is the part that is
// easy to get wrong in either: WHOLLY outside, and LEAVING rather than being
// out. An actor half off the right edge is still on screen, and an actor that
// has been gone for a hundred frames left once.

import {beforeEach, describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  IntrinsicSizeProperty,
  LeftMapEvent,
  OutsideMapQuery,
  PositionProperty,
  ScaleProperty,
  Vector,
  WorldBuilder,
} from '../index';

// No map, so `mapBounds` is the viewport — the size a world is before anything
// says otherwise. Read rather than assumed, so this says the same thing if the
// viewport changes.
function makeWorld() {
  const builder = new WorldBuilder({id: 'w', name: 'W'});
  const world = builder.getWorld();
  const actor = builder.addActor(
    new ActorBuilder({id: 'a', name: 'A'})
      .set(PositionProperty, new Vector(0, 0))
      // Measured, so the actor has real edges rather than the assumed square.
      .set(IntrinsicSizeProperty, new Vector(40, 20)),
  );
  return {world, actor, bounds: world.mapBounds()};
}

describe('is outside the map', () => {
  it('is false for an actor inside it', () => {
    const {actor, bounds} = makeWorld();
    actor.set(PositionProperty, new Vector(bounds.x / 2, bounds.y / 2));
    expect(actor.query(OutsideMapQuery)).toBe(false);
  });

  it('is false while any of the actor is still on the map', () => {
    // The distinction the whole block turns on. Its middle is past the left
    // edge and 19 pixels of it are not: `remove` on this reading would take a
    // bullet away while a fifth of it is still drawn.
    const {actor} = makeWorld();
    actor.set(PositionProperty, new Vector(-1, 10));
    expect(actor.query(OutsideMapQuery)).toBe(false);
    actor.set(PositionProperty, new Vector(-19.9, 10));
    expect(actor.query(OutsideMapQuery)).toBe(false);
  });

  it('is true once the last of it is past an edge', () => {
    const {actor, bounds} = makeWorld();
    // Half of 40 is 20, so at -20.1 the right edge is at -0.1: gone.
    actor.set(PositionProperty, new Vector(-20.1, 10));
    expect(actor.query(OutsideMapQuery)).toBe(true);
    // Every edge, not just the one.
    actor.set(PositionProperty, new Vector(10, -10.1));
    expect(actor.query(OutsideMapQuery)).toBe(true);
    actor.set(PositionProperty, new Vector(bounds.x + 20.1, 10));
    expect(actor.query(OutsideMapQuery)).toBe(true);
    actor.set(PositionProperty, new Vector(10, bounds.y + 10.1));
    expect(actor.query(OutsideMapQuery)).toBe(true);
  });

  it('measures a flipped actor the right way round', () => {
    // A scale of -1 is how a sprite faces the other way. Taken signed, its half
    // width is negative and the actor is judged gone a whole body early.
    const {actor} = makeWorld();
    actor.set(ScaleProperty, new Vector(-1, 1));
    actor.set(PositionProperty, new Vector(-19.9, 10));
    expect(actor.query(OutsideMapQuery)).toBe(false);
  });

  it('grows the actor edges with its scale', () => {
    const {actor} = makeWorld();
    actor.set(ScaleProperty, new Vector(2, 1));
    // Half of 40 doubled is 40, so what was outside at -20.1 is not any more.
    actor.set(PositionProperty, new Vector(-20.1, 10));
    expect(actor.query(OutsideMapQuery)).toBe(false);
  });

  it('assumes a square for an actor whose picture nobody measured', () => {
    // Unmeasured is (0, 0), and taken at face value that is a point: the middle
    // crossing would be the whole actor crossing. 32 is the guess "Stays in the
    // Map" and `collision size of` make, so all three agree.
    const builder = new WorldBuilder({id: 'wu', name: 'WU'});
    // Built before the actor is placed, so the actor has a world to be outside.
    builder.getWorld();
    const actor = builder.addActor(
      new ActorBuilder({id: 'au', name: 'AU'}).set(
        PositionProperty,
        new Vector(-15, 10),
      ),
    );
    expect(actor.query(OutsideMapQuery)).toBe(false);
    actor.set(PositionProperty, new Vector(-16.1, 10));
    expect(actor.query(OutsideMapQuery)).toBe(true);
  });
});

describe('when an actor leaves the map', () => {
  let left: string[];

  beforeEach(() => {
    left = [];
  });

  it('is raised the frame the last of it crosses, and only that frame', () => {
    const {world, actor} = makeWorld();
    actor.on(LeftMapEvent, (_world, who) => left.push(who.id));

    actor.set(PositionProperty, new Vector(10, 10));
    world.tick(0.016);
    expect(left).toEqual([]);

    // Middle out, edges still on: not yet.
    actor.set(PositionProperty, new Vector(-10, 10));
    world.tick(0.016);
    expect(left).toEqual([]);

    actor.set(PositionProperty, new Vector(-30, 10));
    world.tick(0.016);
    expect(left).toEqual(['a']);

    // Still outside is not leaving again — an actor that has been gone for a
    // hundred frames left once, and a handler that removes it must not be asked
    // to remove it a hundred times.
    actor.set(PositionProperty, new Vector(-200, 10));
    world.tick(0.016);
    world.tick(0.016);
    expect(left).toEqual(['a']);
  });

  it('says nothing about an actor placed outside the map', () => {
    // It did not leave; it was never there. This is how a bullet spawner works
    // — actors appear off the edge and fly in — and firing for each of them on
    // the frame it appears would be a departure nobody watched happen.
    const builder = new WorldBuilder({id: 'wo', name: 'WO'});
    builder.getWorld();
    const actor = builder.addActor(
      new ActorBuilder({id: 'ao', name: 'AO'})
        .set(PositionProperty, new Vector(-500, 10))
        .set(IntrinsicSizeProperty, new Vector(40, 20)),
    );
    const world = builder.getWorld();
    actor.on(LeftMapEvent, (_world, who) => left.push(who.id));

    world.tick(0.016);
    // Further out is not leaving either: it was already gone.
    actor.set(PositionProperty, new Vector(-900, 10));
    world.tick(0.016);
    expect(left).toEqual([]);

    // It counts once it has been in and gone out again.
    actor.set(PositionProperty, new Vector(10, 10));
    actor.set(PositionProperty, new Vector(-500, 10));
    world.tick(0.016);
    expect(left).toEqual(['ao']);
  });

  it('is raised once for a wobble that crosses twice in one tick', () => {
    // Two crossings, one departure. A handler that removes the actor or takes a
    // life must not run twice for a round trip nobody saw drawn — so the raiser
    // asks whether it has already raised this tick rather than keeping a flag
    // (World.hasPendingEvent).
    const {world, actor} = makeWorld();
    actor.on(LeftMapEvent, (_world, who) => left.push(who.id));

    actor.set(PositionProperty, new Vector(10, 10));
    actor.set(PositionProperty, new Vector(-500, 10));
    actor.set(PositionProperty, new Vector(10, 10));
    actor.set(PositionProperty, new Vector(-500, 10));
    world.tick(0.016);
    expect(left).toEqual(['a']);
  });

  it('is raised again for an actor that comes back and leaves again', () => {
    const {world, actor} = makeWorld();
    actor.on(LeftMapEvent, (_world, who) => left.push(who.id));

    actor.set(PositionProperty, new Vector(10, 10));
    world.tick(0.016);
    actor.set(PositionProperty, new Vector(-500, 10));
    world.tick(0.016);
    actor.set(PositionProperty, new Vector(10, 10));
    world.tick(0.016);
    actor.set(PositionProperty, new Vector(-500, 10));
    world.tick(0.016);
    expect(left).toEqual(['a', 'a']);
  });
});
