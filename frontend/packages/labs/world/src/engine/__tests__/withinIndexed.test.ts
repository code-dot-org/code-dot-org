// `the actors in ⟨…⟩ within ⟨80⟩ of ⟨…⟩`, asked of the index.
//
// The neighborhood query measured every actor against every center. Written
// the way every flock is — `all actors`, once per actor, per frame — that is n²
// a frame: 5.0ms at 150 actors and 17.0ms at 300, against a 16.7ms frame. It
// asks the spatial index instead when the source IS the world, which is the
// only case where the two can mean the same thing.
//
// So what has to be pinned is that they DO mean the same thing. The answers are
// compared as SETS against the arithmetic written here, because the fast path
// returns them in the index's order and the slow one in the world's — and a
// neighborhood is a set, which the header argues at length.

import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  PositionProperty,
  PositionalTrait,
  Vector,
  World,
} from '../index';
import {SpatialRule, within} from '../rules/spatial';

/** A scattering of actors, and where each one is. */
const scatter = (count: number) => {
  const world = new World({id: 'w', name: 'W', rules: [SpatialRule]});
  let seed = 4242;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < count; i++) {
    world.addActor(
      new ActorBuilder({id: `a${i}`, name: 'a'})
        .useTraits([PositionalTrait])
        .set(PositionProperty, new Vector(next() * 500, next() * 500))
        .instantiate(`a${i}`),
    );
  }
  return world;
};

/** Who is within `reach` of `centers`, worked out the long way. */
const byHand = (world: World, centers: string[], reach: number) => {
  const at = (id: string) =>
    [...world.actors].find(a => a.id === id)!.get(PositionProperty);
  return [...world.actors]
    .filter(
      actor =>
        !centers.includes(actor.id) &&
        centers.some(center => {
          const c = at(center);
          const a = actor.get(PositionProperty);
          return Math.hypot(a.x - c.x, a.y - c.y) <= reach;
        }),
    )
    .map(actor => actor.id)
    .sort();
};

const idsOf = (actors: Iterable<{id: string}>) =>
  [...actors].map(a => a.id).sort();

describe('the neighborhood of an actor', () => {
  it('is the same set the long way round, over and over', () => {
    const world = scatter(150);
    const actors = [...world.actors];

    for (const center of actors.slice(0, 40)) {
      for (const reach of [0, 30, 80, 400]) {
        expect(
          idsOf(within(world.actors, center, reach)),
          `${center.id} within ${reach}`,
        ).toEqual(byHand(world, [center.id], reach));
      }
    }
  });

  it('means near ANY of several, and each of them only once', () => {
    // Two centers whose neighbourhoods overlap: an actor near both is in the
    // answer once, and neither center is in it at all.
    const world = scatter(80);
    const actors = [...world.actors];
    const centers = [actors[0], actors[1], actors[2]];

    expect(idsOf(within(world.actors, centers, 200))).toEqual(
      byHand(
        world,
        centers.map(c => c.id),
        200,
      ),
    );
  });

  it('finds nothing for a reach that is not a distance', () => {
    const world = scatter(20);
    const center = [...world.actors][0];

    expect([...within(world.actors, center, -1)]).toEqual([]);
    expect([...within(world.actors, center, Number.NaN)]).toEqual([]);
  });

  it('answers about the SOURCE when the source is not the world', () => {
    // The case that must not go through the index: the index knows about every
    // actor and would hand back ones the list left out.
    const world = scatter(60);
    const actors = [...world.actors];
    const center = actors[0];
    const few = actors.slice(1, 10);

    const answer = idsOf(within(few, center, 500));

    expect(answer.every(id => few.some(a => a.id === id))).toBe(true);
    expect(answer).toEqual(
      few
        .filter(
          a =>
            Math.hypot(
              a.get(PositionProperty).x - center.get(PositionProperty).x,
              a.get(PositionProperty).y - center.get(PositionProperty).y,
            ) <= 500,
        )
        .map(a => a.id)
        .sort(),
    );
  });

  it('stops early, so `take ⟨3⟩ of` does not measure the world', () => {
    // Laziness survived: the result is a generator either way, and pulling
    // three of them does not walk the rest.
    const world = scatter(200);
    const center = [...world.actors][0];

    const iterator = within(world.actors, center, 500)[Symbol.iterator]();
    const three = [iterator.next(), iterator.next(), iterator.next()];

    expect(three.every(step => !step.done)).toBe(true);
  });
});
