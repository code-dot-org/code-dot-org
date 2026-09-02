// `world.actorsNear` — the grid of buckets, and the answers it has to match.
//
// The index is an optimisation, so the test that matters is that it is
// INVISIBLE: for any point and any radius it returns exactly what measuring
// every actor would have returned. A bucketed query fails at the seams — an
// actor a hair over a bucket edge, a radius that spans three columns, a
// negative coordinate whose floor rounds the wrong way — so the check is
// randomised against the brute-force answer rather than hand-picked.

import {describe, expect, it} from 'vitest';

import {
  Actor,
  ActorBuilder,
  PositionProperty,
  PositionalTrait,
  Vector,
  World,
} from '../index';
import {SpatialRule} from '../rules/spatial';

/** A world holding `count` actors at pseudo-random places, and their positions. */
const scatter = (count: number, spread = 600) => {
  const world = new World({id: 'w', name: 'W', rules: [SpatialRule]});
  // A fixed sequence rather than Math.random: a failure has to be repeatable.
  let seed = 12345;
  const next = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let i = 0; i < count; i++) {
    world.addActor(
      new ActorBuilder({id: `a${i}`, name: 'a'})
        .useTraits([PositionalTrait])
        .set(
          PositionProperty,
          new Vector((next() - 0.3) * spread, (next() - 0.3) * spread),
        )
        .instantiate(`a${i}`),
    );
  }
  return world;
};

/** What measuring every actor would say. */
const byHand = (world: World, x: number, y: number, radius: number) =>
  [...world.actors]
    .filter(actor => {
      const at = actor.get(PositionProperty);
      return Math.hypot(at.x - x, at.y - y) <= radius;
    })
    .map(actor => actor.id)
    .sort();

describe('the actors near a place', () => {
  it('is exactly what measuring all of them would say', () => {
    const world = scatter(200);
    let seed = 999;
    const next = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };

    for (let trial = 0; trial < 200; trial++) {
      const x = (next() - 0.3) * 600;
      const y = (next() - 0.3) * 600;
      // Radii either side of the bucket size, since the seams are where a grid
      // gets it wrong: under one bucket, about one, and several.
      const radius = next() * 200;
      const indexed = world
        .actorsNear({x, y}, radius)
        .map(actor => actor.id)
        .sort();
      expect(indexed, `at ${x},${y} within ${radius}`).toEqual(
        byHand(world, x, y, radius),
      );
    }
  });

  it('finds nothing for a radius that is not a distance', () => {
    // An empty socket reads as 0 and an unfinished one as NaN; neither is an
    // error to raise at a learner mid-game (`spatial.within` says the same).
    const world = scatter(20);
    expect(world.actorsNear({x: 0, y: 0}, -1)).toEqual([]);
    expect(world.actorsNear({x: 0, y: 0}, Number.NaN)).toEqual([]);
  });

  it('includes an actor standing exactly on the point', () => {
    // Unlike `within`, which leaves out what it measures FROM — there is no
    // actor here to leave out, and a search asking "is this square taken"
    // wants to be told about the thing standing on it.
    const world = new World({id: 'w', name: 'W', rules: [SpatialRule]});
    world.addActor(
      new ActorBuilder({id: 'here', name: 'here'})
        .useTraits([PositionalTrait])
        .set(PositionProperty, new Vector(40, 40))
        .instantiate('here'),
    );
    expect(world.actorsNear({x: 40, y: 40}, 0).map(a => a.id)).toEqual([
      'here',
    ]);
  });

  it('looks at a handful of actors rather than all of them', () => {
    // The whole point, and it cannot be shown with a clock without making a
    // flaky test. Count the POSITION READS instead, which is exactly how many
    // actors the query touched: a scan reads every one of them, and the index
    // reads only what the buckets covering the circle hold.
    const world = scatter(400, 2000);
    const actor = Actor.prototype as unknown as {
      get: (property: unknown) => unknown;
    };
    const real = actor.get;
    let reads = 0;

    world.actorsNear({x: 0, y: 0}, 10); // build the index, so this counts a QUERY
    actor.get = function (this: unknown, property: unknown) {
      if (property === PositionProperty) {
        reads++;
      }
      return real.call(this, property);
    };
    try {
      world.actorsNear({x: 500, y: 500}, 20);
    } finally {
      actor.get = real;
    }

    // A radius of 20 spans at most two buckets each way in a world 2000 across
    // holding 400 actors — a handful, against the 400 a scan would read.
    expect(reads).toBeGreaterThan(0);
    expect(reads).toBeLessThan(40);
  });
});
