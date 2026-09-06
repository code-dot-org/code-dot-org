// Where a traveller stands after a pad has moved it.
//
// A TELEPORT IS A DISCONTINUITY, and one rule in the library resolves overlaps
// by asking where a body came from. Physics writes `position before` down in
// `sense`, before anything moves; the pad sets the traveller down in `push`;
// Solid reads that record in `settle` to decide which face to push a body out
// through. So on the frame it lands, a traveller looks to Solid like something
// that has just travelled in a straight line from the pad it left — and gets
// pushed out along that line, which for the pair in the jetpack level means
// down through the floor it was supposed to arrive on.
//
// Only bodies that come to rest on something show it. A rocket flies past and
// Solid's pass never bites, which is why the same trip looked right for one
// actor and wrong for another.

import {beforeAll, describe, expect, it} from 'vitest';

import {ActorBuilder, WorldBuilder, Vector, type World} from '../../engine';
import {PositionProperty} from '../../engine/rules/spatial';

import {
  ALL_STOCK_SOURCES,
  compileStockRules,
  type RuleModule,
} from './support/compileStockRules';

let modules: Record<string, RuleModule>;
const of = (path: string, name: string) => modules[path][name] as never;
const rule = (path: string) => modules[path].default as never;

const run = (world: World, seconds: number): void => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.tick(1 / 60);
  }
};

beforeAll(async () => {
  modules = await compileStockRules(ALL_STOCK_SOURCES);
}, 30000);

/**
 * A floor with a pad standing on it, a second pad far away with its own floor,
 * and a traveller. The two pads are the same colour, so they are one place.
 */
const stage = (falls: boolean) => {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([
      rule('rules/motion'),
      rule('rules/gravity'),
      rule('rules/collisions'),
      rule('rules/solid'),
      rule('rules/teleport'),
    ])
    .instantiate();

  const floor = (id: string, at: Vector) =>
    world.addActor(
      new ActorBuilder({id, name: id})
        .useTraits([
          of('rules/gravity', 'ActsAsGroundTrait'),
          of('rules/collisions', 'CanCollideTrait'),
          of('rules/solid', 'SolidTrait'),
        ])
        .set(PositionProperty, at)
        .instantiate(id),
    );
  const pad = (id: string, at: Vector) =>
    world.addActor(
      new ActorBuilder({id, name: id})
        .useTraits([
          of('rules/collisions', 'CanCollideTrait'),
          of('rules/teleport', 'IsATeleportPadTrait'),
        ])
        .set(PositionProperty, at)
        .instantiate(id),
    );

  // The near end: a pad sitting on a floor, low and to the right.
  floor('floorNear', new Vector(400, 432));
  const near = pad('padNear', new Vector(400, 400));
  // The far end: a pad one tile above its own floor, high and to the left.
  floor('floorFar', new Vector(100, 132));
  const far = pad('padFar', new Vector(100, 100));

  const traveller = world.addActor(
    new ActorBuilder({id: 'walker', name: 'walker'})
      .useTraits([
        of('rules/motion', 'CanMoveTrait'),
        of('rules/collisions', 'CanCollideTrait'),
        ...(falls ? [of('rules/gravity', 'AffectedByGravityTrait')] : []),
        of('rules/teleport', 'UsesTeleportPadsTrait'),
      ])
      .set(PositionProperty, new Vector(400, 400))
      // The enemy's way through a pad rather than the player's: standing on
      // one is enough. It avoids calling the action, which is the same trip.
      .set(of('rules/teleport', 'TakesAnyPadItTouchesProperty'), true)
      .instantiate('walker'),
  );
  return {world, traveller, near, far};
};

describe('a traveller that comes to rest', () => {
  // KNOWN BROKEN, and `it.fails` rather than a skip so the day it starts
  // working this says so instead of rotting. The obvious fix — having the pad
  // correct the record on arrival — is wrong: Turning reads the same record to
  // know whether a body moved, so a corrected record makes a teleported roller
  // read as stopped and turn round every trip. See the message on this test's
  // commit for the two shapes a real fix could take.
  it.fails('lands on the far pad instead of falling through its floor', () => {
    const {world, traveller, far} = stage(true);
    run(world, 2);

    const at = traveller.get(PositionProperty) as Vector;
    const there = (far as {get(p: unknown): Vector}).get(PositionProperty);

    // Where it was sent, not somewhere along the line from where it left.
    expect(Math.abs(at.x - there.x)).toBeLessThan(4);
    // Resting on the far floor: at the pad or a little above it, never below.
    // As it stands this is 1256 and still falling.
    expect(at.y).toBeLessThanOrEqual(there.y + 4);
    expect(at.y).toBeGreaterThan(there.y - 40);
  });

  it('is the same trip a rocket always made correctly', () => {
    // THE CONTRAST THAT NAMES THE BUG. Solid only pushes a body out of
    // something it is inside, so a traveller that never comes to rest never
    // met the broken pass — the same journey looked right for one actor and
    // wrong for another, which is what pointed at Solid rather than at the
    // arithmetic of the arrival.
    const {world, traveller, far} = stage(false);
    run(world, 2);

    const at = traveller.get(PositionProperty) as Vector;
    const there = (far as {get(p: unknown): Vector}).get(PositionProperty);

    expect(Math.abs(at.x - there.x)).toBeLessThan(4);
    expect(Math.abs(at.y - there.y)).toBeLessThan(4);
  });
});
