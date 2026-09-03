// What the stock rules DO, run rather than read.
//
// Every other test of a rule reads it: `parseRuleMeta` says what a rule
// declares, and the palette says what blocks it grows. Neither notices a rule
// that declares everything correctly and crashes on its first frame — which is
// what Steering did, through two thousand passing tests, until a demo spike ran
// it. These run the real compiled modules (`support/compileStockRules`).
//
// One assertion per rule, chosen to be the thing the rule is FOR. A rule that
// falls, lands, chases, collects, hurts or fires on time is a rule that works;
// the rest of its surface is covered by the metadata tests, which are cheaper
// and do not need a DOM.
//
// THREE OF THEM BUILD A DEMO WORLD (`rules/demos`) rather than a world of their
// own, and that sharing is the point rather than a saving. A demo is a claim
// about what a rule does, recorded once and shown to every learner who opens
// the import dialog; a claim nothing checks is one that goes on being made
// after it stops being true (specs/RULE_DEMOS.md). So the world a recording
// films is the world a test asserts on, and a rule that stops doing the thing
// fails here, on the commit that caused it.

import {beforeAll, describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  PositionProperty,
  Vector,
  WorldBuilder,
  type World,
} from '../../engine';
import {
  DEMO_SIZE,
  RULE_DEMOS,
  stepDemo,
  viewOrigin,
  type RuleDemo,
} from '../demos';
import {KNOWN} from '../demos/record/font';

import {
  ALL_STOCK_SOURCES,
  compileStockRules,
  type RuleModule,
} from './support/compileStockRules';

let modules: Record<string, RuleModule>;

/** A member of a compiled rule — a trait, a property, an event. */
const of = (path: string, name: string) => modules[path][name] as never;
/** A compiled rule itself, for `useRules`. */
const rule = (path: string) => modules[path].default as never;

/** Tick a world for `seconds`, at sixty frames a second. */
const run = (world: World, seconds: number): void => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.tick(1 / 60);
  }
};

const at = (x: number, y: number) => new Vector(x, y);

/**
 * Build a demo world and run it for as long as the demo says.
 *
 * Through `stepDemo` rather than `run`, so a demo that scripts input is driven
 * here exactly as the recorder drives it. A test that ticked without the hands
 * would assert about a world nobody was playing.
 */
const play = (demo: RuleDemo) => {
  const {world, cast} = demo.build(modules);
  for (let tick = 0; tick < Math.round(demo.seconds * 60); tick++) {
    stepDemo(world, demo, tick);
  }
  return {world, cast};
};

/** How far apart two actors ended up. */
const between = (a: unknown, b: unknown): number => {
  const one = (a as {get(p: unknown): Vector}).get(PositionProperty);
  const other = (b as {get(p: unknown): Vector}).get(PositionProperty);
  return Math.hypot(other.x - one.x, other.y - one.y);
};

beforeAll(async () => {
  // Compiled once for the file: this is the expensive part, and it is the same
  // six modules for every test below. Dependency order.
  modules = await compileStockRules(ALL_STOCK_SOURCES);
}, 30000);

describe('Gravity', () => {
  it('falls, lands, and stops', () => {
    const {world, cast} = play(RULE_DEMOS.gravity);
    const ball = cast.ball as {get(p: unknown): Vector};
    const landed = ball.get(PositionProperty).y;

    // Half a second more: it landed rather than passing through.
    run(world, 0.5);

    expect(landed).toBeGreaterThan(20);
    expect(landed).toBeLessThan(120);
    expect(ball.get(PositionProperty).y).toBeCloseTo(landed, 1);
  });
});

describe('Steering', () => {
  it('closes the distance and stops where it was told to', () => {
    // The regression. `distance from ⟨a⟩ to ⟨b⟩` took `actor to chase`, which
    // is stored as a LIST, and its body called `.get` on the array — so a
    // chaser crashed the moment it had something to chase.
    const {cast} = play(RULE_DEMOS.steering);

    const apart = between(cast.hunter, cast.prey);
    expect(apart).toBeLessThan(30);
    // …and it stopped rather than climbing onto it.
    expect(apart).toBeGreaterThan(10);
  });
});

describe('Collection', () => {
  it('takes what it walks into, and the coins leave the world', () => {
    const {world} = play(RULE_DEMOS.collect);

    expect([...world.actors].map(actor => actor.id)).toEqual(['walker']);
  });
});

describe('Health', () => {
  it('takes one hit from a contact, not one per frame', () => {
    // The whole point of mercy time. Touching a spike for half a second is
    // thirty frames, and thirty damage is not what anybody means.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/health')])
      .instantiate();
    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([of('rules/health', 'HasHealthTrait')])
      .set(PositionProperty, at(100, 70))
      .instantiate('player');
    world.addActor(player);
    world.addActor(
      new ActorBuilder({id: 'spike', name: 'spike'})
        .useTraits([of('rules/health', 'DealsDamageTrait')])
        .set(PositionProperty, at(104, 70))
        .instantiate('spike'),
    );

    run(world, 0.4);

    // Half the mercy time: exactly one hit has landed.
    expect(player.get(of('rules/health', 'HealthProperty'))).toBe(2);
  });

  it('heals back up to full and no further', () => {
    // What the ceiling is FOR. Without one a potion is a way to become
    // invincible, and "half health" is not a fact anything could draw.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/health')])
      .instantiate();
    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([of('rules/health', 'HasHealthTrait')])
      .set(of('rules/health', 'HealthProperty'), 1)
      .set(PositionProperty, at(100, 70))
      .instantiate('player');
    world.addActor(player);

    // An actor action: the subject is the receiver, not an argument. `heal` is
    // declared on the trait, so it is something an actor DOES.
    player.act(of('rules/health', 'HealAction'), 10);
    world.tick(1 / 60);

    expect(player.get(of('rules/health', 'HealthProperty'))).toBe(3);
  });

  it('does not heal something already dead', () => {
    // A heal is not a resurrection: `dies` has been said once, and a game that
    // wants somebody back says so itself rather than having a potion mean it.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/health')])
      .instantiate();
    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([of('rules/health', 'HasHealthTrait')])
      .set(of('rules/health', 'HealthProperty'), 0)
      .set(PositionProperty, at(100, 70))
      .instantiate('player');
    world.addActor(player);

    player.act(of('rules/health', 'HealAction'), 5);
    world.tick(1 / 60);

    expect(player.get(of('rules/health', 'HealthProperty'))).toBe(0);
  });

  it('carries a full of its own, which a boss may set higher', () => {
    // Two statements, not one: how much a kind can take, and how much this one
    // has left. Neither is derivable from the other.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/health')])
      .instantiate();
    const boss = new ActorBuilder({id: 'boss', name: 'boss'})
      .useTraits([of('rules/health', 'HasHealthTrait')])
      .set(of('rules/health', 'MostHealthProperty'), 20)
      .set(of('rules/health', 'HealthProperty'), 19)
      .set(PositionProperty, at(100, 70))
      .instantiate('boss');
    world.addActor(boss);

    boss.act(of('rules/health', 'HealAction'), 5);
    world.tick(1 / 60);

    expect(boss.get(of('rules/health', 'HealthProperty'))).toBe(20);
  });

  it('hurts again once the mercy time has passed', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/health')])
      .instantiate();
    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([of('rules/health', 'HasHealthTrait')])
      .set(PositionProperty, at(100, 70))
      .instantiate('player');
    world.addActor(player);
    world.addActor(
      new ActorBuilder({id: 'spike', name: 'spike'})
        .useTraits([of('rules/health', 'DealsDamageTrait')])
        .set(PositionProperty, at(104, 70))
        .instantiate('spike'),
    );

    // Standing in it: three mercy windows, three hits, and then nothing left.
    run(world, 1.6);

    expect(player.get(of('rules/health', 'HealthProperty'))).toBe(0);
  });
});

describe('Attachment', () => {
  /** A rider, a subject, and the world they are in. */
  const attached = (offset?: Vector) => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/motion'), rule('rules/attachment')])
      .instantiate();
    const carrier = new ActorBuilder({id: 'carrier', name: 'carrier'})
      .useTraits([of('rules/motion', 'CanMoveTrait')])
      .set(PositionProperty, at(100, 100))
      .set(of('rules/motion', 'VelocityProperty'), new Vector(1, 0))
      .instantiate('carrier');
    world.addActor(carrier);
    const rider = new ActorBuilder({id: 'rider', name: 'rider'})
      .useTraits([of('rules/attachment', 'AttachedTrait')])
      .set(PositionProperty, at(0, 0))
      .instantiate('rider');
    if (offset) {
      rider.set(of('rules/attachment', 'OffsetProperty'), offset as never);
    }
    world.addActor(rider);
    return {world, carrier, rider};
  };
  const spot = (actor: unknown) =>
    (actor as {get(p: unknown): Vector}).get(PositionProperty);

  it('stays where it was put while it is attached to nobody', () => {
    // The ordinary state of a rider nothing has pointed yet — and the one that
    // would otherwise read every frame from an empty property and park it at
    // the origin, which looks like the rule being broken rather than unused.
    const {world, rider} = attached();

    run(world, 0.5);

    expect(spot(rider).x).toBe(0);
    expect(spot(rider).y).toBe(0);
  });

  it('rides along once it is pointed at something', () => {
    const {world, carrier, rider} = attached();
    rider.set(of('rules/attachment', 'AttachedToProperty'), carrier as never);

    run(world, 0.5);

    // Default offset is a little above: up the level is negative y.
    expect(spot(rider).x).toBe(spot(carrier).x);
    expect(spot(rider).y).toBe(spot(carrier).y - 24);
  });

  it('keeps the offset it carries, not the one it started with', () => {
    const {world, carrier, rider} = attached(new Vector(12, 40));
    rider.set(of('rules/attachment', 'AttachedToProperty'), carrier as never);

    run(world, 0.5);

    expect(spot(rider).x).toBe(spot(carrier).x + 12);
    expect(spot(rider).y).toBe(spot(carrier).y + 40);
  });

  it('moves the rider and never the subject', () => {
    // Which is what lets two actors be attached to each other without either
    // fighting the other: each reads where the other ENDED UP.
    const {world, carrier, rider} = attached();
    rider.set(of('rules/attachment', 'AttachedToProperty'), carrier as never);
    const wentTo = 100 + 0.5 * 100;

    run(world, 0.5);

    expect(spot(carrier).x).toBeCloseTo(wentTo, 0);
  });
});

describe('Collisions, asked of the index rather than walked', () => {
  // The pairing used to be a nested loop: every collider against every other
  // one, every frame, which is a million questions at a thousand actors. It
  // asks the spatial index for the few whose middles are near enough to be able
  // to overlap, and then runs the same test it always ran.
  //
  // THE RISK IS A MISS, not a wrong answer: a broadphase that returns too much
  // is slow and a broadphase that returns too little is a collision that
  // silently stopped happening. So this is checked against an oracle written
  // here — plain box arithmetic over every pair — rather than against the rule
  // it replaced, which would only prove the two agree about what they both got
  // wrong.

  /** Every overlapping pair, worked out the long way. */
  const byHand = (
    boxes: Array<{id: string; x: number; y: number; w: number; h: number}>,
  ) => {
    const touching: Record<string, string[]> = {};
    for (const a of boxes) {
      touching[a.id] = boxes
        .filter(
          b =>
            b.id !== a.id &&
            Math.abs(a.x - b.x) < (a.w + b.w) / 2 &&
            Math.abs(a.y - b.y) < (a.h + b.h) / 2,
        )
        .map(b => b.id)
        .sort();
    }
    return touching;
  };

  it('finds exactly the pairs that overlap, sizes mixed', () => {
    // Mixed sizes on purpose: the query radius is one number shared by
    // everybody — my half-diagonal plus the BIGGEST collider's — so a world
    // where one thing is much larger than the rest is where a radius computed
    // from the wrong box would start missing pairs.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/collisions')])
      .instantiate();
    let seed = 20250901;
    const next = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const boxes = Array.from({length: 120}, (_unused, i) => {
      const wide = i % 17 === 0; // a few giants among the small
      const size = wide ? 140 : 24 + Math.floor(next() * 40);
      return {
        id: `a${i}`,
        x: Math.floor(next() * 400),
        y: Math.floor(next() * 400),
        w: size,
        h: size,
      };
    });
    for (const box of boxes) {
      world.addActor(
        new ActorBuilder({id: box.id, name: 'box'})
          .useTraits([of('rules/collisions', 'CanCollideTrait')])
          .set(PositionProperty, new Vector(box.x, box.y))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(box.w, box.h))
          .instantiate(box.id),
      );
    }

    run(world, 1 / 60);

    const contacts = of('rules/collisions', 'ContactsProperty') as never;
    const got: Record<string, string[]> = {};
    for (const actor of world.actors) {
      got[actor.id] = (actor.get(contacts) as unknown as {id: string}[])
        .map(other => other.id)
        .sort();
    }
    expect(got).toEqual(byHand(boxes));
  });

  it('finds a big thing overlapping a small one from outside its own reach', () => {
    // The pair a radius of "my half-diagonal" alone would miss: the small one
    // asks, and what overlaps it is something whose middle is far away because
    // the thing is enormous.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/collisions')])
      .instantiate();
    const small = world.addActor(
      new ActorBuilder({id: 'small', name: 'small'})
        .useTraits([of('rules/collisions', 'CanCollideTrait')])
        .set(PositionProperty, new Vector(0, 0))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(8, 8))
        .instantiate('small'),
    );
    world.addActor(
      new ActorBuilder({id: 'wall', name: 'wall'})
        .useTraits([of('rules/collisions', 'CanCollideTrait')])
        .set(PositionProperty, new Vector(200, 0))
        .set(of('rules/collisions', 'SizeProperty'), new Vector(500, 40))
        .instantiate('wall'),
    );

    run(world, 1 / 60);

    const contacts = of('rules/collisions', 'ContactsProperty') as never;
    expect(
      (small.get(contacts) as unknown as {id: string}[]).map(a => a.id),
    ).toEqual(['wall']);
  });
});

describe('a ledge, and which way you may pass it', () => {
  // A ONE-WAY PLATFORM, which the catalogue had down as a mechanic still to
  // build and which turns out to be two traits nobody has to add a third to.
  // `is resting on` asks about DIRECTION — coming down onto it, and above its
  // surface last frame — so a body on its way up is not resting on anything and
  // nothing stops it. `Solid` is what stops it, in either direction.
  //
  // Emergent, and therefore worth a test: it is true because of how two rules
  // were written rather than because anything says so, and either of them could
  // stop it being true without meaning to.

  const stage = (also: unknown[]) => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([
        rule('rules/motion'),
        rule('rules/gravity'),
        rule('rules/collisions'),
        rule('rules/solid'),
      ])
      .instantiate();
    world.addActor(
      new ActorBuilder({id: 'ledge', name: 'ledge'})
        .useTraits([
          of('rules/gravity', 'ActsAsGroundTrait'),
          of('rules/collisions', 'CanCollideTrait'),
          ...(also as never[]),
        ])
        .set(PositionProperty, new Vector(100, 100))
        .instantiate('ledge'),
    );
    return world;
  };

  /** A hero at `at`, given `up` of upward speed (negative is up). */
  const hero = (world: World, at: Vector, up: number) =>
    world.addActor(
      new ActorBuilder({id: 'hero', name: 'hero'})
        .useTraits([
          of('rules/gravity', 'AffectedByGravityTrait'),
          of('rules/collisions', 'CanCollideTrait'),
          of('rules/motion', 'CanMoveTrait'),
        ])
        .set(PositionProperty, at)
        .set(of('rules/motion', 'VelocityProperty'), new Vector(0, up))
        .instantiate('hero'),
    );

  it('is landed on from above whether or not it is solid', () => {
    for (const also of [[], [of('rules/solid', 'SolidTrait')]]) {
      const world = stage(also);
      const dropper = hero(world, new Vector(100, 40), 0);

      run(world, 1.2);

      // Resting on its surface: the ledge's middle less both half-heights.
      expect(dropper.get(PositionProperty).y).toBeCloseTo(68, 0);
    }
  });

  it('is passed up through when it only acts as ground', () => {
    const world = stage([]);
    const jumper = hero(world, new Vector(100, 160), -4);

    run(world, 0.5);

    // Above it, and still going: nothing about rising is any of gravity's
    // business, and there is no Solid here to have an opinion.
    expect(jumper.get(PositionProperty).y).toBeLessThan(100);
  });

  it('stops a body rising into it once it is solid too', () => {
    const world = stage([of('rules/solid', 'SolidTrait')]);
    const jumper = hero(world, new Vector(100, 160), -4);

    run(world, 0.5);

    // Put back out of the face it came in through — under it, not through it.
    expect(jumper.get(PositionProperty).y).toBeGreaterThan(100);
  });
});

describe('Path', () => {
  // The claim, and the one Steering cannot make: a step that is not toward the
  // goal, because toward is into a wall.

  /** A world with a wall down the middle and a gap at the bottom. */
  const walled = () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/path'), rule('rules/solid')])
      .instantiate();
    // A column of solid blocks at x=160, from y=0 down to y=160 — so the only
    // way from the left half to the right half is round the bottom of it.
    for (let y = 0; y <= 160; y += 32) {
      world.addActor(
        new ActorBuilder({id: `wall${y}`, name: 'wall'})
          .useTraits([of('rules/solid', 'SolidTrait')])
          .set(PositionProperty, new Vector(160, y))
          .instantiate(`wall${y}`),
      );
    }
    return world;
  };

  /** A guard at `from`, told to find its way to a quarry at `to`. */
  const guard = (world: World, from: Vector, to: Vector) => {
    const quarry = world.addActor(
      new ActorBuilder({id: 'quarry', name: 'quarry'})
        .set(PositionProperty, to)
        .instantiate('quarry'),
    );
    const walker = world.addActor(
      new ActorBuilder({id: 'guard', name: 'guard'})
        .useTraits([of('rules/path', 'FindsAWayTrait')])
        .set(PositionProperty, from)
        .set(of('rules/path', 'GoingToProperty'), [quarry])
        .set(of('rules/path', 'HowFarToLookProperty'), 14)
        .instantiate('guard'),
    );
    return walker;
  };

  it('steps AROUND a wall rather than into it', () => {
    // The guard is left of the wall and the quarry is right of it, both at the
    // same height — so "toward" is due east, straight into it. A way exists
    // round the bottom, and the first step of it is not east.
    const world = walled();
    const walker = guard(world, new Vector(96, 96), new Vector(224, 96));

    run(world, 0.05);

    expect(walker.get(of('rules/path', 'HasAWayProperty') as never)).toBe(true);
    const next = walker.get(
      of('rules/path', 'NextPlaceProperty') as never,
    ) as unknown as Vector;
    // DOWN, not east. East is (128, 96) — one square nearer the quarry and
    // straight at the wall, which is exactly the step Steering would take and
    // the reason this rule exists. Round the bottom starts by going down.
    expect({x: next.x, y: next.y}).toEqual({x: 96, y: 128});
  });

  it('walks the way it worked out, round the wall', () => {
    // The other half. A guard that computes a step and stands still is a guard
    // that does nothing, and "toward" is still east — so the test of the
    // walking is that after a second the guard is BELOW where it started and
    // has not crossed into the wall.
    const world = walled();
    const walker = guard(world, new Vector(96, 96), new Vector(224, 96));

    run(world, 1);

    const at = walker.get(PositionProperty);
    expect(at.y).toBeGreaterThan(100);
    expect(at.x).toBeLessThan(160);
  });

  it('says so when there is no way at all', () => {
    // Walled in on every side: the flood runs out of squares, and a guard that
    // cannot get there should say so rather than stand still and look broken.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/path'), rule('rules/solid')])
      .instantiate();
    for (const [x, y] of [
      [64, 96],
      [128, 96],
      [96, 64],
      [96, 128],
    ]) {
      world.addActor(
        new ActorBuilder({id: `box${x}_${y}`, name: 'box'})
          .useTraits([of('rules/solid', 'SolidTrait')])
          .set(PositionProperty, new Vector(x, y))
          .instantiate(`box${x}_${y}`),
      );
    }
    let saidSo = 0;
    const quarry = world.addActor(
      new ActorBuilder({id: 'quarry', name: 'quarry'})
        .set(PositionProperty, new Vector(320, 96))
        .instantiate('quarry'),
    );
    world.addActor(
      new ActorBuilder({id: 'guard', name: 'guard'})
        .useTraits([of('rules/path', 'FindsAWayTrait')])
        .set(PositionProperty, new Vector(96, 96))
        .set(of('rules/path', 'GoingToProperty'), [quarry])
        .set(of('rules/path', 'HowFarToLookProperty'), 6)
        .on(of('rules/path', 'FindsNoWayEvent'), () => {
          saidSo++;
        })
        .instantiate('guard'),
    );

    run(world, 0.05);

    expect(saidSo).toBe(1);
  });

  it('thinks on its beat rather than every frame', () => {
    // The whole reason it is affordable. One search at the start and one more
    // half a second later, not sixty.
    const world = walled();
    const walker = guard(world, new Vector(96, 96), new Vector(224, 96));

    run(world, 0.9);

    // `thought at` is the clock reading of the last search, so it moves only
    // when one happened: at 0 and again just past 0.5.
    const at = walker.get(
      of('rules/path', 'ThoughtAtProperty') as never,
    ) as unknown as number;
    expect(at).toBeGreaterThan(0.5);
    expect(at).toBeLessThan(0.55);
  });
});

describe('Spawner', () => {
  // The two facts it has that a timer does not. Both are counted rather than
  // timed, because what is being asserted is the arithmetic and not the clock.

  it('stops after the number it was told to send', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/spawner')])
      .instantiate();
    let sent = 0;
    world.addActor(
      new ActorBuilder({id: 'waves', name: 'waves'})
        .useTraits([of('rules/spawner', 'SendsThingsTrait')])
        .set(of('rules/spawner', 'SecondsApartProperty'), 0.1)
        .set(of('rules/spawner', 'HowManyToSendProperty'), 3)
        .on(of('rules/spawner', 'SendsSomethingEvent'), () => {
          sent++;
        })
        .instantiate('waves'),
    );

    // Long enough for thirty at that gap, which is what makes three an answer
    // about the limit rather than about the length of the run.
    run(world, 3);

    expect(sent).toBe(3);
  });

  it('closes the gap by the factor, and keeps the number where it can be read', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/spawner')])
      .instantiate();
    const waves = world.addActor(
      new ActorBuilder({id: 'waves', name: 'waves'})
        .useTraits([of('rules/spawner', 'SendsThingsTrait')])
        .set(of('rules/spawner', 'SecondsApartProperty'), 1)
        .set(of('rules/spawner', 'CloserEachTimeProperty'), 0.5)
        .instantiate('waves'),
    );

    // Four sent: one on the first frame, then at +1, +0.5 and +0.25 — 1.75s of
    // beats inside a two-second run, and the fifth would fall at 1.875 + a
    // frame. The gap is halved once per send, so four sends leave 1/16.
    run(world, 1.9);

    const gap = of('rules/spawner', 'SecondsApartProperty') as never;
    const count = of('rules/spawner', 'HowManySentProperty') as never;
    expect(waves.get(count)).toBe(4);
    expect(waves.get(gap)).toBeCloseTo(1 / 16, 5);
  });

  it('sends nothing while it is switched off', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/spawner')])
      .instantiate();
    let sent = 0;
    world.addActor(
      new ActorBuilder({id: 'waves', name: 'waves'})
        .useTraits([of('rules/spawner', 'SendsThingsTrait')])
        .set(of('rules/spawner', 'SecondsApartProperty'), 0.1)
        .set(of('rules/spawner', 'SendingProperty'), false)
        .on(of('rules/spawner', 'SendsSomethingEvent'), () => {
          sent++;
        })
        .instantiate('waves'),
    );

    run(world, 1);

    expect(sent).toBe(0);
  });
});

describe('Time', () => {
  it('fires once per period, not once per frame', () => {
    // What a long period is FOR, and the thing that looked broken in the
    // browser: a timer whose schedule never advanced would fire sixty times a
    // second whatever its period said.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/time')])
      .instantiate();
    let fired = 0;
    world.addActor(
      new ActorBuilder({id: 'spawner', name: 'spawner'})
        .useTraits([of('rules/time', 'HasATimerTrait')])
        .set(of('rules/time', 'TimerPeriodProperty'), 1000)
        .on(of('rules/time', 'TimerFiresEvent'), () => {
          fired++;
        })
        .instantiate('spawner'),
    );

    run(world, 2);

    // Once, on the first frame — a fresh timer is due immediately, and then
    // not again for a thousand seconds.
    expect(fired).toBe(1);
  });

  it('keeps its beat', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/time')])
      .instantiate();
    let fired = 0;
    world.addActor(
      new ActorBuilder({id: 'lamp', name: 'lamp'})
        .useTraits([of('rules/time', 'HasATimerTrait')])
        .set(of('rules/time', 'TimerPeriodProperty'), 0.5)
        .on(of('rules/time', 'TimerFiresEvent'), () => {
          fired++;
        })
        .instantiate('lamp'),
    );

    run(world, 2);

    // Four, not five, and the arithmetic is the documentation. A fresh timer
    // is due immediately, so the first firing is on the first FRAME — at
    // 1/60s, not at 0 — and each next one is scheduled a period from THEN
    // rather than from when it was due. So: 0.017, 0.517, 1.017, 1.517, and
    // the fifth would fall at 2.017, just after this run ends.
    expect(fired).toBe(4);
  });

  it('stops after one when it does not repeat', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/time')])
      .instantiate();
    let fired = 0;
    world.addActor(
      new ActorBuilder({id: 'bomb', name: 'bomb'})
        .useTraits([of('rules/time', 'HasATimerTrait')])
        .set(of('rules/time', 'TimerPeriodProperty'), 0.2)
        .set(of('rules/time', 'TimerRepeatsProperty'), false)
        .on(of('rules/time', 'TimerFiresEvent'), () => {
          fired++;
        })
        .instantiate('bomb'),
    );

    run(world, 2);

    expect(fired).toBe(1);
  });
});

describe('Patrol', () => {
  /** A patroller of one kind, on its own in an empty world. */
  const walker = (traits: string[], settings: Record<string, number> = {}) => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/motion'), rule('rules/patrol')])
      .instantiate();
    const actor = new ActorBuilder({id: 'guard', name: 'guard'})
      .useTraits([
        of('rules/motion', 'CanMoveTrait'),
        ...traits.map(name => of('rules/patrol', name)),
      ])
      .set(PositionProperty, at(100, 100))
      .instantiate('guard');
    for (const [name, value] of Object.entries(settings)) {
      actor.set(of('rules/patrol', name), value as never);
    }
    world.addActor(actor);
    return {world, actor};
  };
  const spot = (actor: unknown) =>
    (actor as {get(p: unknown): Vector}).get(PositionProperty);

  it('sets off forwards rather than turning on its first frame', () => {
    // Heading starts at -1 so the frame-one turn makes it +1. Starting at +1
    // would send it backwards immediately, which reads as a rule that cannot
    // count — and is what the first cut of this did.
    const {world, actor} = walker(['PatrolsAcrossTrait']);

    run(world, 0.5);

    expect(spot(actor).x).toBeGreaterThan(100);
  });

  it('comes back, and does not walk away over time', () => {
    // The whole claim, and the bug it was written against. A turn is taken on
    // the first frame at or after it is due, so it is always a fraction late;
    // booking the next one a period from THEN carried that fraction forward
    // and the beat slipped — a measured two pixels a second, which is a
    // platform that leaves its track and an enemy that leaves its beat.
    //
    // Twenty seconds of it, because one round trip cannot tell a fixed offset
    // from a drift and forty round trips can.
    const {world, actor} = walker(['PatrolsAcrossTrait'], {
      AcrossTimeProperty: 0.5,
    });

    run(world, 0.5);
    const far = spot(actor).x;
    run(world, 0.5);
    const afterOne = spot(actor).x;
    run(world, 19);

    expect(far).toBeGreaterThan(120);
    // Two pixels out and two pixels out for ever: the frame it moves on
    // before the first turn lands is an offset, not a slip.
    expect(afterOne).toBeCloseTo(102, 0);
    expect(spot(actor).x).toBeCloseTo(afterOne, 0);
  });

  it('walks the distance its two numbers multiply out to', () => {
    // Speed times time, which is arithmetic a learner can do in their head and
    // change either half of. 0.6 units for 1.5 seconds is ninety pixels.
    const {world, actor} = walker(['PatrolsAcrossTrait']);

    run(world, 1.5);

    expect(spot(actor).x - 100).toBeCloseTo(90, 0);
  });

  it('lifts as readily as it guards', () => {
    // The axis split, and the reason for it: down is not a second half of
    // across, it is a different thing to want. A platform on a track.
    const {world, actor} = walker(['PatrolsDownTrait']);

    run(world, 1.5);

    expect(spot(actor).y - 100).toBeCloseTo(90, 0);
    expect(spot(actor).x).toBe(100);
  });

  it('walks a rectangle when it takes both', () => {
    // The two steps share a moment, so they have to commute — each reads the
    // axis it writes and passes the other through. An actor with both is the
    // proof, and nothing in the rule arranges it.
    const {world, actor} = walker(['PatrolsAcrossTrait', 'PatrolsDownTrait']);

    run(world, 0.7);

    // Same speed and same period on both, so the two distances must be the
    // SAME distance — which is the sharpest way to say that neither step
    // clobbered the axis the other wrote.
    expect(spot(actor).x - 100).toBeGreaterThan(30);
    expect(spot(actor).y - 100).toBe(spot(actor).x - 100);
  });
});

describe('Scoring', () => {
  /** A world with the rule in play and a target set. */
  const game = (targetScore = 0) => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/score')])
      .instantiate();
    if (targetScore) {
      world.set(of('rules/score', 'TargetScoreProperty'), targetScore as never);
    }
    return world;
  };
  /**
   * Score some points, and let the world deliver what that raised.
   *
   * The tick is not decoration. An event is QUEUED when it is raised and
   * flushed when the world ticks (engine/core/EventQueue), so a test that
   * scored without ticking would watch a handler that never ran and conclude
   * the rule raises nothing.
   */
  const add = (world: World, points: number) => {
    world.act(of('rules/score', 'AddToTheScoreAction'), points);
    world.tick(1 / 60);
  };
  const scoreOf = (world: World) =>
    world.get(of('rules/score', 'ScoreProperty')) as unknown as number;

  it('adds up, and says so every time', () => {
    const world = game();
    let changes = 0;
    world.on(of('rules/score', 'TheScoreChangesEvent'), () => {
      changes++;
    });

    add(world, 10);
    add(world, 5);

    expect(scoreOf(world)).toBe(15);
    expect(changes).toBe(2);
  });

  it('says the target is reached, once and not again', () => {
    // The whole reason `won` exists. Collecting does not stop when you win, so
    // without it a handler that shows a banner would show it on every coin
    // after the winning one.
    const world = game(30);
    let wins = 0;
    world.on(of('rules/score', 'TheTargetIsReachedEvent'), () => {
      wins++;
    });

    add(world, 10);
    expect(wins).toBe(0);
    add(world, 25);
    expect(wins).toBe(1);
    add(world, 25);
    expect(wins).toBe(1);
  });

  it('never says it with no target, however high the score goes', () => {
    // A game that only wants a number on the screen gets one, and is never
    // told it has won something it never entered.
    const world = game();
    let wins = 0;
    world.on(of('rules/score', 'TheTargetIsReachedEvent'), () => {
      wins++;
    });

    add(world, 1000);

    expect(wins).toBe(0);
    expect(scoreOf(world)).toBe(1000);
  });

  it('tells the actors that elected to hear it, as well as the world', () => {
    // The reason the events are declared twice. A world event registers on the
    // WORLD, and an `.actor` file has no binding for one — so a scoreboard,
    // which is the thing every game wants to do with a score, would have
    // nowhere to write its handler.
    const world = game(20);
    const board = new ActorBuilder({id: 'board', name: 'board'})
      .useTraits([of('rules/score', 'WatchesTheScoreTrait')])
      .instantiate('board');
    let shown = 0;
    let banner = 0;
    board.on(of('rules/score', 'SeesTheScoreChangeEvent'), () => {
      shown++;
    });
    board.on(of('rules/score', 'SeesTheGameWonEvent'), () => {
      banner++;
    });
    world.addActor(board);

    add(world, 10);
    add(world, 10);

    expect(shown).toBe(2);
    expect(banner).toBe(1);
  });

  it('tells nobody who did not ask', () => {
    // `allWithTrait`, not every actor: a level of coins should not each be
    // woken up because the score moved.
    const world = game();
    const coin = new ActorBuilder({id: 'coin', name: 'coin'}).instantiate(
      'coin',
    );
    let heard = 0;
    coin.on(of('rules/score', 'SeesTheScoreChangeEvent'), () => {
      heard++;
    });
    world.addActor(coin);

    add(world, 10);

    expect(heard).toBe(0);
  });

  it('lets a reset be won again', () => {
    // Both halves of the reset, and each alone is a bug: a score that forgot
    // it had won would win twice on one run, and one that remembered could
    // never win a second game.
    const world = game(10);
    let wins = 0;
    world.on(of('rules/score', 'TheTargetIsReachedEvent'), () => {
      wins++;
    });

    add(world, 10);
    world.act(of('rules/score', 'ResetTheScoreAction'));
    world.tick(1 / 60);
    expect(scoreOf(world)).toBe(0);
    add(world, 10);

    expect(wins).toBe(2);
  });

  it('counts down as readily as up', () => {
    // `add` takes what it is given. A penalty is a negative number, not a
    // second block — and the target is a floor to cross, not a total reached,
    // so dropping below it and climbing back does not win twice.
    const world = game(10);
    let wins = 0;
    world.on(of('rules/score', 'TheTargetIsReachedEvent'), () => {
      wins++;
    });

    add(world, 12);
    add(world, -8);
    add(world, 8);

    expect(scoreOf(world)).toBe(12);
    expect(wins).toBe(1);
  });
});

describe('Jumping', () => {
  /** A world with a floor, and a jumper standing on it. */
  const standing = (settings: Record<string, number> = {}) => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([
        rule('rules/motion'),
        rule('rules/collisions'),
        rule('rules/gravity'),
        rule('rules/jump'),
      ])
      .instantiate();
    const floor = new ActorBuilder({id: 'floor', name: 'floor'})
      .useTraits([of('rules/gravity', 'ActsAsGroundTrait')])
      .set(PositionProperty, at(100, 120))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(200, 16))
      .instantiate('floor');
    world.addActor(floor);
    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([
        of('rules/gravity', 'AffectedByGravityTrait'),
        of('rules/jump', 'JumpsTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(PositionProperty, at(100, 104))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 16))
      .instantiate('player');
    for (const [name, value] of Object.entries(settings)) {
      player.set(of('rules/jump', name), value as never);
    }
    world.addActor(player);
    // Long enough to land and be counted as standing.
    run(world, 0.2);
    return {world, floor, player};
  };

  const ask = (world: World, player: unknown) =>
    world.act(of('rules/jump', 'MakeJumpAction'), player as never);
  const spent = (player: unknown) =>
    (player as {get(p: unknown): number}).get(
      of('rules/jump', 'JumpsUsedProperty'),
    );
  const height = (player: unknown) =>
    (player as {get(p: unknown): Vector}).get(PositionProperty).y;

  it('leaves the ground when asked, and only once', () => {
    const {world, player} = standing();
    const floorLevel = height(player);

    ask(world, player);
    run(world, 0.25);

    expect(height(player)).toBeLessThan(floorLevel - 20);
    // Asked again in mid-air with nothing left, and refused. This is the whole
    // difference from the jump a learner writes by hand, which works in the
    // air, works twice, and works while falling down a pit.
    const rising = height(player);
    ask(world, player);
    expect(spent(player)).toBe(1);
    ask(world, player);
    expect(height(player)).toBeGreaterThanOrEqual(rising - 1);
  });

  it('clears three tiles on its default, which the starter needs', () => {
    // The number that would fail silently. The starter's level puts a platform
    // three tiles — 96 pixels — above its floor, with a coin above that; a
    // default jump that fell an inch short would land the player under the
    // ledge every single time, with nothing anywhere to say why.
    const {world, player} = standing();
    const floorLevel = height(player);
    let peak = floorLevel;

    ask(world, player);
    for (let tick = 0; tick < 60; tick++) {
      world.tick(1 / 60);
      peak = Math.min(peak, height(player));
    }

    expect(floorLevel - peak).toBeGreaterThan(3 * 32);
  });

  it('comes back down and can go again', () => {
    const {world, player} = standing();
    const floorLevel = height(player);

    ask(world, player);
    run(world, 1.2);

    // Landed: back where it started, and the tally cleared by the ground.
    expect(height(player)).toBeCloseTo(floorLevel, 0);
    expect(spent(player)).toBe(0);
  });

  it('forgives a late press, for as long as the grace lasts', () => {
    // Coyote time, and the reason it exists: walking off a ledge and pressing
    // jump a frame later is the commonest thing a player does that a naive
    // platformer refuses.
    const {world, floor, player} = standing();
    world.removeActor(floor);
    run(world, 0.05);

    ask(world, player);

    expect(spent(player)).toBe(1);
  });

  it('will not forgive a press after it', () => {
    const {world, floor, player} = standing();
    world.removeActor(floor);
    // Three tenths against a grace of one: long gone.
    run(world, 0.3);

    ask(world, player);

    // Already spent by the lapse itself, not by this ask.
    expect(spent(player)).toBe(1);
  });

  it('spends the ground jump when the grace lapses, not an air one', () => {
    // What makes double jump fall out of one number rather than a second rule.
    // Walking off a ledge has to COST the ground jump, or a double jumper who
    // steps off a platform gets two air jumps and floats away.
    const {world, floor, player} = standing({JumpsAllowedProperty: 2});
    world.removeActor(floor);
    run(world, 0.3);

    ask(world, player);
    expect(spent(player)).toBe(2);
    // …and that is the lot.
    ask(world, player);
    expect(spent(player)).toBe(2);
  });

  it('gives a double jumper two from the ground, and no more', () => {
    const {world, player} = standing({JumpsAllowedProperty: 2});

    ask(world, player);
    run(world, 0.15);
    ask(world, player);
    run(world, 0.15);
    ask(world, player);

    expect(spent(player)).toBe(2);
  });

  it('treats an actor spawned in mid-air as standing, for one frame', () => {
    // Not a design, a consequence, and worth pinning as one: gravity decides
    // who is falling in `react`, and this rule's bookkeeping reads that in
    // `sense` on the NEXT frame. So on the very first frame `falling` is still
    // its default of false and the ground jump is available.
    //
    // One sixtieth of a second, against a grace period of a tenth that is
    // deliberate. It is inside the noise the rule already accepts, and the
    // alternative is a "have we ticked yet" flag on every jumper.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([
        rule('rules/motion'),
        rule('rules/collisions'),
        rule('rules/gravity'),
        rule('rules/jump'),
      ])
      .instantiate();
    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([
        of('rules/gravity', 'AffectedByGravityTrait'),
        of('rules/jump', 'JumpsTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(PositionProperty, at(100, 20))
      .instantiate('player');
    world.addActor(player);

    world.tick(1 / 60);
    ask(world, player);
    expect(spent(player)).toBe(1);

    // And from the second frame on it is airborne, as it always was.
    run(world, 0.3);
    expect(spent(player)).toBe(1);
  });
});

describe('every demo world', () => {
  // A demo is a claim shown to every learner who opens the import dialog, so
  // the cheapest useful check is that each one DOES something: the first
  // Collection demo recorded twenty-four identical frames, because a collector
  // that does not also elect `Can Move` never reaches a coin, and nothing said
  // so until the strip was looked at (specs/RULE_DEMOS.md).
  it.each(Object.keys(RULE_DEMOS))('%s changes while it runs', id => {
    const demo = RULE_DEMOS[id];
    const {world} = demo.build(modules);
    // WHAT THE STRIP WOULD SHOW, rather than where the actors are. Position
    // alone was the first version and it was too narrow twice over: gravity's
    // ball only moves down, Collection's demonstration is that a coin stops
    // being there at all — and Writing's actors never move one pixel, because
    // what changes about them is their text. Everything the recorder draws
    // goes in, so a demo that changes anything visible passes and a demo that
    // changes nothing cannot.
    const where = () =>
      [...world.actors]
        .map(actor => {
          const at = actor.get(PositionProperty);
          const look = demo.look(actor.id, actor, world);
          return (
            `${actor.id}@${Math.round(at.x)},${Math.round(at.y)}` +
            `:${look.width}x${look.height}:${look.colour}:${look.text ?? ''}`
          );
        })
        .join(' ');
    const before = where();

    for (let tick = 0; tick < Math.round(demo.seconds * 60); tick++) {
      stepDemo(world, demo, tick);
    }

    const after = where();
    expect(after).not.toEqual(before);
  });

  it.each(Object.keys(RULE_DEMOS))('%s stays inside its frame', id => {
    // Clipped rather than scaled by the recorder, so an actor that wanders out
    // is simply missing from the picture — which is a demo world to fix and
    // not something to find by squinting at a strip.
    //
    // In VIEW space, via the same `viewOrigin` the recorder films through. A
    // camera demo's map is deliberately wider than its frame — that is what
    // there is to see — so "inside the frame" cannot mean "inside the map",
    // and the scenery a camera pans away from is out of shot on purpose.
    const demo = RULE_DEMOS[id];
    const {world} = play(demo);

    const view = viewOrigin(world);
    const subjects = demo.filmed
      ? [...world.actors].filter(actor => demo.filmed!.includes(actor.id))
      : [...world.actors];
    for (const actor of subjects) {
      const at = actor.get(PositionProperty);
      const x = at.x - view.x;
      const y = at.y - view.y;
      expect(x, `${id}: ${actor.id} x`).toBeGreaterThan(-20);
      expect(x, `${id}: ${actor.id} x`).toBeLessThan(DEMO_SIZE.width + 20);
      expect(y, `${id}: ${actor.id} y`).toBeGreaterThan(-20);
      expect(y, `${id}: ${actor.id} y`).toBeLessThan(DEMO_SIZE.height + 20);
    }
  });
});

describe('what the newer demos show', () => {
  it('wrap: the rover comes back round', () => {
    // The rule whose demonstration is unmistakable in motion and invisible in
    // a still. It must actually cross, or the strip is a box walking right.
    const {cast} = play(RULE_DEMOS.wrap);
    const rover = cast.rover as {get(p: unknown): Vector};

    // Started at 30 heading right at 2.4 units — without wrapping it would be
    // far past the frame by now.
    expect(rover.get(PositionProperty).x).toBeLessThan(DEMO_SIZE.width);
  });

  it('solid: the mover stops at the wall', () => {
    const {cast} = play(RULE_DEMOS.solid);
    const mover = cast.mover as {get(p: unknown): Vector};

    // The wall's left face is at 150 − 8; a mover that passed through would be
    // beyond it by the end of the run.
    expect(mover.get(PositionProperty).x).toBeLessThan(145);
    expect(mover.get(PositionProperty).x).toBeGreaterThan(100);
  });

  it('health: the player loses health it can be drawn losing', () => {
    // `look` reads this to size the box, so a demo that took no damage would
    // record a box that never changes.
    const {cast} = play(RULE_DEMOS.health);
    const player = cast.player as {get(p: unknown): number};

    expect(player.get(of('rules/health', 'HealthProperty'))).toBeLessThan(3);
  });

  it('expires: the sparks go out one by one', () => {
    const {world} = play(RULE_DEMOS.expires);

    expect([...world.actors].length).toBeLessThan(5);
  });

  it('writing: one label holds still while the other counts', () => {
    // Half of what the rule does is NOT change, and a strip with only the
    // counter in it would read as a rule about numbers.
    const {cast} = play(RULE_DEMOS.writing);
    const shown = (who: unknown) =>
      (who as {get(p: unknown): string}).get(cast.text as never);

    expect(shown(cast.label)).toBe('SCORE');
    // Six beats at 0.4s, the first on the first frame: 0.017, 0.417 … 2.017,
    // and the seventh would fall at 2.417, just inside a 2.5 second run.
    expect(Number(shown(cast.counter))).toBeGreaterThan(100);
  });

  it('carry: the rider goes with the platform and the bystander does not', () => {
    // Two identical boxes and one trait between them — which is what makes the
    // strip a demonstration rather than a box with a velocity.
    const {cast} = play(RULE_DEMOS.carry);
    const spot = (who: unknown) =>
      (who as {get(p: unknown): Vector}).get(PositionProperty).x;

    // The platform went right; the rider went with it, and the one that does
    // not ride is exactly where it was put.
    expect(spot(cast.platform)).toBeGreaterThan(110);
    expect(spot(cast.rider)).toBeGreaterThan(140);
    expect(spot(cast.bystander)).toBe(30);
  });

  it('goals: the flag wins it and the spike afterwards changes nothing', () => {
    // The rule's one real claim, and the only thing in the strip that is
    // invisible: the frames after the spike look like nothing happening, and
    // that IS the demonstration.
    const {world} = play(RULE_DEMOS.goals);

    expect(world.get(of('rules/goals', 'WonProperty'))).toBe(true);
    expect(world.get(of('rules/goals', 'LostProperty'))).toBe(false);
  });

  it('history: the box ends on the first of its own footprints', () => {
    // Four moves out and four taken back. A box walked home would land near
    // where it started; one PUT back lands exactly on it, and exactly is what
    // this asserts.
    const {world, cast} = play(RULE_DEMOS.history);
    const box = cast.box as {get(p: unknown): Vector};
    const steps = [...world.actors].filter(actor =>
      actor.id.startsWith('step'),
    );

    expect(steps).toHaveLength(4);
    expect(box.get(PositionProperty).x).toBe(steps[0].get(PositionProperty).x);
  });

  it('turns: the slow one moves on half the turns', () => {
    // Two boxes in step read as two boxes with one speed; the third is what
    // says these are turns. It must be BEHIND, and behind by whole strides.
    const {cast} = play(RULE_DEMOS.turns);
    const spot = (who: unknown) =>
      (who as {get(p: unknown): Vector}).get(PositionProperty).x;

    expect(spot(cast.quick)).toBe(spot(cast.player));
    expect(spot(cast.slow)).toBeLessThan(spot(cast.quick));
    expect((spot(cast.quick) - spot(cast.slow)) % 26).toBe(0);
  });

  it('inventory: the key is taken, spent, and gone from the bag', () => {
    // Both halves in one run: a record would show the first and could not show
    // the second, which is the whole reason this rule exists.
    const {world, cast} = play(RULE_DEMOS.inventory);
    const walker = cast.walker as {query(q: unknown, ...a: unknown[]): unknown};

    expect(walker.query(of('rules/inventory', 'HasAQuery'), 'key')).toBe(false);
    // …and the door it was spent on is not in the world any more.
    expect([...world.actors].some(actor => actor.id === 'door')).toBe(false);
  });

  it('grid: the crate is pushed one square and both stop at the wall', () => {
    // Pushing is part of stepping, and the refusal is the rule working: a
    // strip that ended with the player standing on the crate would be a strip
    // of a rule that had run out of frames.
    const {world} = play(RULE_DEMOS.grid);
    const spot = (id: string) =>
      [...world.actors].find(actor => actor.id === id)!.get(PositionProperty).x;

    // The wall never moves, the crate is one square along from where it was,
    // and the player is one square behind the crate.
    expect(spot('wall')).toBe(5 * 32 + 16);
    expect(spot('crate')).toBe(4 * 32 + 16);
    expect(spot('player')).toBe(3 * 32 + 16);
  });

  it('reveals: one line waits its turn and the other is hurried', () => {
    // Both halves in one strip: the letters arriving, and the way past them.
    const {cast} = play(RULE_DEMOS.reveals);
    const shown = (who: unknown) =>
      (who as {get(p: unknown): string}).get(
        of('rules/writing', 'TextProperty'),
      );

    expect(shown(cast.patient)).toBe('HELLO WORLD');
    expect(shown(cast.impatient)).toBe('HELLO WORLD');
    // …and the impatient one got there first, which is the only thing that
    // makes the two rows different. Ten letters at five a second is two
    // seconds; the skip is at one.
    expect(
      (cast.impatient as {get(p: unknown): number}).get(
        of('rules/reveals', 'LettersShownProperty'),
      ),
    ).toBeGreaterThan(
      (cast.patient as {get(p: unknown): number}).get(
        of('rules/reveals', 'LettersShownProperty'),
      ),
    );
  });

  it('conversation: it says three things and then stops', () => {
    // The ending is what makes it a conversation rather than a sign: the
    // cursor is back at nobody talking, and the box is empty.
    const {cast} = play(RULE_DEMOS.conversation);
    const speaker = cast.speaker as {get(p: unknown): unknown};

    expect(speaker.get(of('rules/conversation', 'LineProperty'))).toBe(0);
    expect(speaker.get(of('rules/writing', 'TextProperty'))).toBe('');
  });

  it('progress: the bar fills in steps and stops full', () => {
    const {cast} = play(RULE_DEMOS.progress);
    const bar = cast.bar as {get(p: unknown): number};

    expect(bar.get(cast.fraction as never)).toBe(1);
  });

  it('every demo asks only for letters the font can draw', () => {
    // A character with no glyph draws as a GAP, silently — the strip is still
    // a strip, and the word is missing a letter. This is the only place that
    // notices, because nothing downstream can tell a space from a hole.
    for (const [id, demo] of Object.entries(RULE_DEMOS)) {
      const {world} = demo.build(modules);
      for (const actor of world.actors) {
        const text = demo.look(actor.id, actor, world).text ?? '';
        for (const character of text.toUpperCase()) {
          expect(KNOWN.has(character), `${id}: ${JSON.stringify(text)}`).toBe(
            true,
          );
        }
      }
    }
  });

  it('score: it counts the coins and then says so', () => {
    // Two rules that know nothing about each other, joined by one line in the
    // demo's own handler: Collection says a coin was taken, Scoring says that
    // was the third. What the strip shows is the banner, so what this checks
    // is the flag the banner reads.
    const {world} = play(RULE_DEMOS.score);

    expect(world.get(of('rules/score', 'ScoreProperty'))).toBe(30);
    expect(world.get(of('rules/score', 'WonProperty'))).toBe(true);
  });

  it('jump: it clears the hole, and the second press does nothing', () => {
    // The demo's whole claim. A jumping box shows the first half; what says
    // this is a RULE rather than a line of blocks is the ask that is refused.
    const demo = RULE_DEMOS.jump;
    const {world, cast} = demo.build(modules);
    const player = cast.player as {get(p: unknown): Vector};
    let highest = 128;
    let midAir = 0;
    for (let tick = 0; tick < Math.round(demo.seconds * 60); tick++) {
      stepDemo(world, demo, tick);
      highest = Math.min(highest, player.get(PositionProperty).y);
      // 1.65s: inside the second press, which is in mid-air.
      if (tick === 99) {
        midAir = player.get(PositionProperty).y;
      }
    }

    // Went up, over the hole at 96–128, and came down the far side.
    expect(highest).toBeLessThan(40);
    expect(player.get(PositionProperty).x).toBeGreaterThan(140);
    // Resting on the far floor: its top is at 80, and a 16-pixel box sits
    // with its middle 8 above that.
    expect(player.get(PositionProperty).y).toBeCloseTo(72, 0);
    // The refused press left it on the arc it was already on: at the apex,
    // which a second jump would have thrown it well above.
    expect(midAir).toBeGreaterThan(highest - 1);
  });

  it('bounds: both boxes park in the corners they were heading for', () => {
    // Two, because one box in a corner is a box in a corner. What says the
    // rule stopped them is that the other, going the other way, stopped just
    // as dead at the opposite edge.
    const {world, cast} = play(RULE_DEMOS.bounds);
    const where = (who: unknown) =>
      (who as {get(p: unknown): Vector}).get(PositionProperty);

    // Half a box back from each edge, which is what "stays in the map" means
    // for a thing with a width (`rules/bounds` assumes 32 unmeasured).
    expect(where(cast.falling).x).toBeCloseTo(192 - 16, 0);
    expect(where(cast.falling).y).toBeCloseTo(128 - 16, 0);
    expect(where(cast.rising).x).toBeCloseTo(16, 0);
    expect(where(cast.rising).y).toBeCloseTo(16, 0);

    // …and PARKED rather than passing through: another second changes nothing.
    const settled = `${where(cast.falling).x},${where(cast.rising).y}`;
    run(world, 1);
    expect(`${where(cast.falling).x},${where(cast.rising).y}`).toBe(settled);
  });

  it('time: the marks land evenly, not all at once', () => {
    // The spacing IS the demonstration. A timer that fired every frame would
    // fill the row in the first two frames of the strip, which is exactly the
    // bug the Time tests above were written against.
    const {world} = play(RULE_DEMOS.time);
    const marks = [...world.actors]
      .filter(actor => actor.id.startsWith('beat'))
      .map(actor => actor.get(PositionProperty).x)
      .sort((a, b) => a - b);

    expect(marks.length).toBeGreaterThan(4);
    const gaps = marks.slice(1).map((x, n) => x - marks[n]);
    expect(new Set(gaps).size).toBe(1);
  });

  it('zaps: asked every frame, it answers at its recharge rate', () => {
    // The zapper is asked sixty times a second and answers four, so the balls
    // come out evenly spaced — the recharge time made visible as a distance.
    const {world} = play(RULE_DEMOS.zaps);
    const balls = [...world.actors]
      .filter(actor => actor.id.startsWith('ball'))
      .map(actor => actor.get(PositionProperty).x)
      .sort((a, b) => a - b);

    expect(balls.length).toBeGreaterThan(2);
    const gaps = balls.slice(1).map((x, n) => x - balls[n]);
    // Sixteen frames apart at 120 pixels a second, not the fifteen a quarter
    // of a second looks like: the clock is a running sum of 1/60, and fifteen
    // of those is 0.24999999999999997 — a hair short of the recharge, so the
    // zap lands on the next frame. Evenly, which is what the strip shows and
    // what the rule promises; the exact number is arithmetic, not a rate.
    for (const gap of gaps) {
      expect(gap).toBeCloseTo(32, 0);
    }
  });

  it('arrows: it walks both ways while held, and stops when it is not', () => {
    // The stopping is the half a moving box cannot demonstrate, so it is
    // measured across the gap in the script rather than at the end. The gap
    // runs from 0.7s to 1.0s and nothing is held in it.
    const demo = RULE_DEMOS.arrows;
    const {world, cast} = demo.build(modules);
    const player = cast.player as {get(p: unknown): Vector};
    const seen: Vector[] = [];
    for (let tick = 0; tick < Math.round(demo.seconds * 60); tick++) {
      stepDemo(world, demo, tick);
      if (tick === 44 || tick === 58) {
        seen.push(player.get(PositionProperty));
      }
    }

    // Went right, then stood perfectly still for the rest of the gap.
    expect(seen[0].x).toBeGreaterThan(100);
    expect(seen[1].x).toBe(seen[0].x);
    expect(seen[1].y).toBe(seen[0].y);

    // …and by the end it has been down and then back up and left, which is
    // the pair of traits doing two different things with one keyboard.
    const at = player.get(PositionProperty);
    expect(at.x).toBeLessThan(seen[0].x);
    expect(at.y).toBeLessThan(seen[0].y + 4);
  });

  it('input: a tap is a hop, and holding is no more than a tap', () => {
    // Five presses, one of them held for seven tenths of a second. If holding
    // counted as pressing every frame the hopper would be off the map.
    const {cast} = play(RULE_DEMOS.input);
    const hopper = cast.hopper as {get(p: unknown): Vector};

    expect(hopper.get(PositionProperty).x).toBe(34 + 5 * 26);
  });

  it('drive: it turns rather than sliding, and comes back round', () => {
    // Both keys held from a third of a second in, so the path is an arc. What
    // says "turn" rather than "diagonal" is that the ship ends up heading back
    // toward where it began: a thing that only slid could not.
    const {cast} = play(RULE_DEMOS.drive);
    const ship = cast.ship as {get(p: unknown): Vector};
    const at = ship.get(PositionProperty);

    // Started at (60, 92) facing up, and looped: above where it started, and
    // to the right of it, with the loop's far side already behind it.
    expect(at.y).toBeLessThan(92);
    expect(at.x).toBeGreaterThan(60);
    expect(Math.hypot(at.x - 60, at.y - 92)).toBeLessThan(70);
  });

  it('mouse: a click is a place, and the target answers twice', () => {
    // The bug this caught is worth the test on its own: `setPointer` speaks
    // VIEWPORT pixels, so a demo handing it world coordinates put the pointer
    // ninety pixels adrift and every click missed — silently, with the strip
    // showing a pointer sitting on a target that never responded.
    const {cast} = play(RULE_DEMOS.mouse);
    const clicked = cast.clicked as () => number;
    const target = cast.target as {get(p: unknown): Vector};

    expect(clicked()).toBe(2);
    expect(target.get(PositionProperty).x).toBe(48);
  });

  // The camera family, checked the way the strips read: what a camera rule
  // does is entirely a fact about where the walker sits IN THE FRAME, so each
  // of these measures that and nothing else. The world positions are identical
  // across all four — the same walker crossing the same map.
  const onScreen = (demo: RuleDemo) => {
    const {world, cast} = play(demo);
    const walker = cast.walker as {get(p: unknown): Vector};
    return walker.get(PositionProperty).x - viewOrigin(world).x;
  };
  const middle = DEMO_SIZE.width / 2;

  it('cameraFollow: the walker stays in the middle of the picture', () => {
    // Both halves, because either alone passes for the wrong reason. A camera
    // that never moved would leave the walker drifting out of shot; a camera
    // that moves without FOLLOWING would pan past the walker as readily as
    // past a post.
    const {world, cast} = play(RULE_DEMOS.cameraFollow);
    const walker = cast.walker as {get(p: unknown): Vector};
    const view = viewOrigin(world);

    // The camera left where it started — a twelve-tile map through six tiles.
    expect(view.x).toBeGreaterThan(180);
    // …and the walker is still centred, which is what following MEANS.
    expect(walker.get(PositionProperty).x - view.x).toBeCloseTo(middle, 0);
  });

  it('cameraEase: the walker runs ahead of the view and settles there', () => {
    // The lag IS the demonstration, and it is a steady one: at a twentieth of
    // the gap a frame, a walker moving a hundred pixels a second ends up about
    // thirty ahead of centre and stays there.
    const ahead = onScreen(RULE_DEMOS.cameraEase) - middle;

    expect(ahead).toBeGreaterThan(15);
    expect(ahead).toBeLessThan(60);
  });

  it('cameraDeadzone: the walker rests on the edge of the box it left', () => {
    // Neither centred nor carried along: exactly `slack` off centre, which is
    // the default forty-eight, and travelling with the view from then on.
    const ahead = onScreen(RULE_DEMOS.cameraDeadzone) - middle;

    expect(ahead).toBeCloseTo(48, 0);
  });

  it('cameraConfined: the view stops and the walker walks on', () => {
    // The one demo whose walker is meant to leave the middle for good. The
    // camera runs out of map, so from then on every pixel the walker moves is
    // a pixel further from centre — but still inside the picture, or the strip
    // ends with its subject missing.
    const {world, cast} = play(RULE_DEMOS.cameraConfined);
    const walker = cast.walker as {get(p: unknown): Vector};
    const view = viewOrigin(world);

    // Stopped with the VIEWPORT's right edge on the map's. The viewport is the
    // engine's ten tiles rather than this frame's six, which is the one place
    // these demos have to know the two rectangles differ.
    expect(view.x + middle + 160).toBeCloseTo(12 * 32, 0);
    const past = walker.get(PositionProperty).x - view.x;
    expect(past).toBeGreaterThan(middle + 40);
    expect(past).toBeLessThan(DEMO_SIZE.width);
  });
});

describe('Carrying', () => {
  /**
   * A platform on a beat with somebody standing on it.
   *
   * The rider is given gravity as well, because that is the arrangement the
   * rule exists for: without it a "rider" is an actor floating at a height
   * nothing is holding, and the test would pass on a world that could not
   * happen.
   */
  const lift = (riding: boolean) => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([
        rule('rules/motion'),
        rule('rules/collisions'),
        rule('rules/solid'),
        rule('rules/gravity'),
        rule('rules/patrol'),
        rule('rules/carry'),
      ])
      .instantiate();
    const platform = new ActorBuilder({id: 'platform', name: 'platform'})
      .useTraits([
        of('rules/motion', 'CanMoveTrait'),
        of('rules/collisions', 'CanCollideTrait'),
        of('rules/solid', 'SolidTrait'),
        of('rules/gravity', 'ActsAsGroundTrait'),
        of('rules/patrol', 'PatrolsAcrossTrait'),
        of('rules/carry', 'CarriesTrait'),
      ])
      .set(PositionProperty, at(160, 200))
      .instantiate('platform');
    const rider = new ActorBuilder({id: 'rider', name: 'rider'})
      .useTraits([
        of('rules/motion', 'CanMoveTrait'),
        of('rules/collisions', 'CanCollideTrait'),
        of('rules/gravity', 'AffectedByGravityTrait'),
        ...(riding ? [of('rules/carry', 'RidesTrait')] : []),
      ])
      // Already resting on it: both boxes default to 32 square, so the rider's
      // middle sits 32 above the platform's. Dropping it from higher up would
      // measure the fall as well as the ride — the platform walks on while the
      // rider is in the air, which is correct and is not what this asserts.
      .set(PositionProperty, at(160, 168))
      .instantiate('rider');
    world.addActor(platform);
    world.addActor(rider);
    return {world, platform, rider};
  };
  const spot = (actor: unknown) =>
    (actor as {get(p: unknown): Vector}).get(PositionProperty);

  it('takes the rider with the platform', () => {
    const {world, platform, rider} = lift(true);

    run(world, 1);

    // The platform has walked its beat and the rider went with it. The gap is
    // one frame of the platform's travel — a pixel at this speed — because the
    // carry is measured a frame behind on purpose (see the rule's header). What
    // matters is that it does not GROW: a second of it is still one frame.
    expect(spot(platform).x).toBeGreaterThan(180);
    expect(Math.abs(spot(rider).x - spot(platform).x)).toBeLessThanOrEqual(
      1.01,
    );
  });

  it('does not fall further behind over a longer ride', () => {
    // The failure a one-frame lag would have if it accumulated: five seconds is
    // three turns of the beat, and a rider that lost a pixel a frame would be
    // three hundred behind by the end and off the platform entirely.
    const {world, platform, rider} = lift(true);

    run(world, 5);

    expect(Math.abs(spot(rider).x - spot(platform).x)).toBeLessThanOrEqual(
      1.01,
    );
  });

  it('leaves it behind without the trait, which is the bug it fixes', () => {
    const {world, platform, rider} = lift(false);

    run(world, 1);

    expect(spot(platform).x).toBeGreaterThan(180);
    expect(spot(rider).x).toBeCloseTo(160, 0);
  });

  it('reports no movement on its first frame', () => {
    // A carrier that has never measured has nowhere it "was", and the naive
    // answer — subtracting a zero it was never at — throws every rider the
    // whole distance from the origin on frame one.
    const {world, rider} = lift(true);

    world.tick(1 / 60);

    expect(spot(rider).x).toBeCloseTo(160, 0);
  });
});

describe('Goals', () => {
  /** A world with an ending, and a banner listening for one. */
  const game = () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/goals')])
      .instantiate();
    const heard: string[] = [];
    const banner = new ActorBuilder({id: 'banner', name: 'banner'})
      .useTraits([of('rules/goals', 'WatchesTheEndingTrait')])
      .instantiate('banner');
    banner.on(of('rules/goals', 'SeesTheGameWonEvent'), () => {
      heard.push('won');
    });
    banner.on(of('rules/goals', 'SeesTheGameLostEvent'), () => {
      heard.push('lost');
    });
    banner.on(of('rules/goals', 'SeesANewGameEvent'), () => {
      heard.push('again');
    });
    world.addActor(banner);
    /**
     * Perform one of the rule's world actions, and let the frame deliver what
     * it raised — an event goes on a queue the tick drains.
     */
    const say = (name: string) => {
      world.act(of('rules/goals', name));
      world.tick(1 / 60);
    };
    const flag = (name: string) =>
      world.get(of('rules/goals', name)) as unknown as boolean;
    return {world, heard, say, flag};
  };

  it('remembers which ending happened, and tells the actors watching', () => {
    const {heard, say, flag} = game();

    say('WinTheGameAction');

    expect(flag('WonProperty')).toBe(true);
    expect(flag('LostProperty')).toBe(false);
    expect(heard).toEqual(['won']);
  });

  it('lets the first ending stand', () => {
    // The thing every project got slightly wrong on its own: a player who
    // reaches the flag as the last spike touches them sees ONE ending, and
    // which one is decided by which happened first.
    const {heard, say, flag} = game();

    say('WinTheGameAction');
    say('LoseTheGameAction');
    say('WinTheGameAction');

    expect(flag('LostProperty')).toBe(false);
    expect(heard).toEqual(['won']);
  });

  it('goes back to neither, and says so', () => {
    // Both flags, and the event where a project puts the level back — this
    // rule has never seen the level and cannot rebuild it.
    const {heard, say, flag} = game();

    say('LoseTheGameAction');
    say('StartAgainAction');

    expect(flag('WonProperty')).toBe(false);
    expect(flag('LostProperty')).toBe(false);
    expect(heard).toEqual(['lost', 'again']);

    // …and a game that has started again can end again, which is the half a
    // reset that only cleared `won` would have got wrong.
    say('WinTheGameAction');

    expect(heard).toEqual(['lost', 'again', 'won']);
  });
});

describe('History', () => {
  /** A crate on a board, and a tape that may or may not be watching it. */
  const board = (remembering: boolean) => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/history')])
      .instantiate();
    const crate = new ActorBuilder({id: 'crate', name: 'crate'})
      .useTraits(
        remembering ? [of('rules/history', 'RemembersWhereItWasTrait')] : [],
      )
      .set(PositionProperty, at(64, 64))
      .instantiate('crate');
    const putBack: number[] = [];
    crate.on(of('rules/history', 'IsPutBackEvent'), () => {
      putBack.push(spot().x);
    });
    world.addActor(crate);

    /** A world action, and the tick that delivers what it raised. */
    const say = (name: string) => {
      world.act(of('rules/history', name));
      world.tick(1 / 60);
    };
    const spot = () =>
      (crate as unknown as {get(p: unknown): Vector}).get(PositionProperty);
    /** Move the crate the way a game would: one square across. */
    const step = () => {
      (crate as unknown as {set(p: unknown, v: Vector): void}).set(
        PositionProperty,
        at(spot().x + 32, 64),
      );
    };
    const remembered = () =>
      world.get(
        of('rules/history', 'MovesRememberedProperty'),
      ) as unknown as number;
    const tape = () =>
      (crate as unknown as {get(p: unknown): Vector[]}).get(
        of('rules/history', 'WhereItWasProperty'),
      );
    return {world, say, spot, step, remembered, tape, putBack};
  };

  it('puts a crate back where it was, and says which crate moved', () => {
    const {say, spot, step, remembered, putBack} = board(true);

    say('RememberThisMoveAction');
    step();
    expect(spot().x).toBe(96);

    say('TakeBackAMoveAction');

    expect(spot().x).toBe(64);
    expect(remembered()).toBe(0);
    // The event carries the actor and is raised after it has moved: a handler
    // that flashes a crate should see it where it now is.
    expect(putBack).toEqual([64]);
  });

  it('goes back as far as the game has been played', () => {
    // The tape was eight properties deep, because a rule's state was a fixed
    // set of named slots and there was no list of places to keep. It is one
    // list now, so ten moves go back ten and the eleventh undo is not an error
    // — it is a player pressing undo at the start of a level.
    const {say, spot, step, remembered} = board(true);

    for (let move = 0; move < 10; move++) {
      say('RememberThisMoveAction');
      step();
    }
    expect(spot().x).toBe(64 + 10 * 32);
    expect(remembered()).toBe(10);

    for (let back = 0; back < 11; back++) {
      say('TakeBackAMoveAction');
    }

    expect(spot().x).toBe(64);
    expect(remembered()).toBe(0);
  });

  it('keeps every place on one tape, oldest first', () => {
    // What eight named slots were: one property, in the order the moves
    // happened, and readable by anything that wants to draw where a crate has
    // been.
    const {say, step, tape} = board(true);

    for (let move = 0; move < 3; move++) {
      say('RememberThisMoveAction');
      step();
    }

    expect(tape().map(place => place.x)).toEqual([64, 96, 128]);
  });

  it('leaves alone what did not ask to be remembered', () => {
    // A wall does not elect the trait, and undo must not move it — which is
    // also what stops a project paying for every actor on the board.
    const {say, spot, step, remembered} = board(false);

    say('RememberThisMoveAction');
    step();
    say('TakeBackAMoveAction');

    expect(spot().x).toBe(96);
    // The tape still counted the move: what a move IS belongs to the project,
    // and an empty board is a board with nothing to put back.
    expect(remembered()).toBe(0);
  });

  it('throws the tape away when a level is built again', () => {
    // The count AND the places, which the eight slots never had to do: a slot
    // nobody reads is harmless, and a list nobody empties is a level's worth of
    // places kept for a level that is gone.
    const {say, spot, step, remembered, tape} = board(true);

    say('RememberThisMoveAction');
    step();
    say('ForgetEverythingAction');
    say('TakeBackAMoveAction');

    expect(remembered()).toBe(0);
    expect(tape()).toEqual([]);
    expect(spot().x).toBe(96);
  });
});

describe('Turns', () => {
  /** A board with two takers on it: one every turn, one as told. */
  const game = (perMove: number) => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/turns')])
      .instantiate();
    const acted: string[] = [];
    const passed: number[] = [];
    const taker = (name: string, every: number) => {
      const actor = new ActorBuilder({id: name, name})
        .useTraits([of('rules/turns', 'TakesATurnTrait')])
        .set(of('rules/turns', 'TurnsPerMoveProperty'), every)
        .instantiate(name);
      actor.on(of('rules/turns', 'TakesItsTurnEvent'), () => {
        acted.push(name);
      });
      world.addActor(actor);
      return actor;
    };
    world.on(of('rules/turns', 'ATurnPassesEvent'), () => {
      passed.push(turns());
    });
    const turns = () =>
      world.get(of('rules/turns', 'TurnsTakenProperty')) as unknown as number;
    taker('quick', 1);
    taker('slow', perMove);
    /** End a turn, and let the frame deliver what it raised. */
    const endTurn = () => {
      world.act(of('rules/turns', 'EndTheTurnAction'));
      world.tick(1 / 60);
    };
    return {world, acted, passed, turns, endTurn};
  };

  it('tells everything that takes turns, once each turn', () => {
    // The claim the lesson is about: an actor acts once per turn, however the
    // turn was decided and whatever else is on the board.
    const {acted, turns, endTurn} = game(1);

    endTurn();
    endTurn();
    endTurn();

    expect(turns()).toBe(3);
    expect(acted.filter(name => name === 'quick')).toHaveLength(3);
    expect(acted.filter(name => name === 'slow')).toHaveLength(3);
  });

  it('lets a slow one miss turns', () => {
    // How a board game says slow: a snail is not an enemy at half speed, it is
    // an enemy that misses turns.
    const {acted, endTurn} = game(2);

    for (let turn = 0; turn < 4; turn++) {
      endTurn();
    }

    expect(acted.filter(name => name === 'quick')).toHaveLength(4);
    expect(acted.filter(name => name === 'slow')).toHaveLength(2);
  });

  it('freezes one that moves every no turns', () => {
    const {acted, endTurn} = game(0);

    endTurn();
    endTurn();

    expect(acted).toEqual(['quick', 'quick']);
  });

  it('says a turn has passed once everybody has been told', () => {
    // Raised last and carrying the new count, so a project keeping its own
    // books sees the turn already dealt out.
    const {passed, endTurn} = game(1);

    endTurn();
    endTurn();

    expect(passed).toEqual([1, 2]);
  });

  it('answers every so many turns', () => {
    const {world, endTurn} = game(1);
    const every = (many: number) =>
      world.query(of('rules/turns', 'EveryTurnsQuery'), many) as boolean;

    endTurn();
    endTurn();
    endTurn();

    expect(every(3)).toBe(true);
    expect(every(2)).toBe(false);
    expect(every(1)).toBe(true);
  });
});

describe('Inventory', () => {
  /** A player with a bag, and things of two kinds to put in it. */
  const bag = () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/collect'), rule('rules/inventory')])
      .instantiate();
    const player = new ActorBuilder({id: 'player', name: 'player'})
      .useTraits([of('rules/inventory', 'CarriesTrait')])
      .instantiate('player');
    const used: string[] = [];
    player.on(
      of('rules/inventory', 'UsesAThingEvent'),
      (_world: unknown, _actor: unknown, item: unknown) => {
        used.push((item as {id: string}).id);
      },
    );
    world.addActor(player);

    /** A thing of a KIND, which is what the bag sorts by. */
    const thing = (id: string, kind: string) => {
      const made = new ActorBuilder({id, name: id})
        .useTraits([of('rules/inventory', 'CanBeCarriedTrait')])
        .instantiate(id, kind);
      world.addActor(made);
      return made;
    };
    /** Perform one of the trait's actions on the player, and drain the queue. */
    const say = (name: string, ...args: unknown[]) => {
      (player as unknown as {act(action: never, ...rest: unknown[]): void}).act(
        of('rules/inventory', name),
        ...args,
      );
      world.tick(1 / 60);
    };
    const ask = (name: string, kind: string) =>
      (
        player as unknown as {query(q: never, ...rest: unknown[]): unknown}
      ).query(of('rules/inventory', name), kind);
    /** What is in the bag, of a kind — what `how many ⟨Key⟩ in ⟨…⟩` counts. */
    const held = (kind: string) =>
      (
        (player as unknown as {get(p: unknown): unknown}).get(
          of('rules/inventory', 'ThingsProperty'),
        ) as Array<{type: string}>
      ).filter(item => item.type === kind).length;
    return {world, player, thing, say, ask, held, used};
  };

  it('holds what it is given, sorted by the kind it is', () => {
    const {thing, say, ask, held} = bag();

    say('TakesAction', thing('key1', 'actors/key'));
    say('TakesAction', thing('apple', 'actors/food'));

    expect(ask('HasAQuery', 'actors/key')).toBe(true);
    expect(ask('HasAQuery', 'actors/rope')).toBe(false);
    expect(held('actors/food')).toBe(1);
  });

  it('spends one, and only one, and says which', () => {
    // The whole difference from Collection: a bag that can go down. Two keys
    // in, one spent, one left — and what the event carries is the key itself
    // rather than a word for it, which is what a handler showing it needs.
    const {thing, say, ask, held, used} = bag();
    say('TakesAction', thing('key1', 'actors/key'));
    say('TakesAction', thing('key2', 'actors/key'));

    say('SpendsAAction', 'actors/key');

    expect(held('actors/key')).toBe(1);
    expect(ask('HasAQuery', 'actors/key')).toBe(true);
    // The OLDEST, which is what "a key" means when the bag holds two.
    expect(used).toEqual(['key1']);
  });

  it('spends nothing it has not got, and says nothing either', () => {
    // A second locked door with no second key: the ask is what a project does
    // about it, and this doing nothing quietly is what makes the ask optional
    // rather than compulsory.
    const {thing, say, ask, held, used} = bag();
    say('TakesAction', thing('key1', 'actors/key'));
    say('SpendsAAction', 'actors/key');

    say('SpendsAAction', 'actors/key');

    expect(ask('HasAQuery', 'actors/key')).toBe(false);
    expect(held('actors/key')).toBe(0);
    expect(used).toEqual(['key1']);
  });

  it('will not carry a thing that cannot be carried', () => {
    // The trait is the whole of what makes something bag-able; without it, a
    // project putting anything at all in one would be keeping the world in a
    // pocket.
    const {world, say, held} = bag();
    const rock = new ActorBuilder({id: 'rock', name: 'rock'}).instantiate(
      'rock',
      'actors/rock',
    );
    world.addActor(rock);

    say('TakesAction', rock);

    expect(held('actors/rock')).toBe(0);
  });
});

describe('Jetpack', () => {
  /** A world with a floor, and an actor with a jetpack standing on it. */
  const grounded = (settings: Record<string, number> = {}) => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([
        rule('rules/motion'),
        rule('rules/collisions'),
        rule('rules/gravity'),
        rule('rules/jetpack'),
      ])
      .instantiate();
    const floor = new ActorBuilder({id: 'floor', name: 'floor'})
      .useTraits([of('rules/gravity', 'ActsAsGroundTrait')])
      .set(PositionProperty, at(100, 120))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(200, 16))
      .instantiate('floor');
    world.addActor(floor);
    const pilot = new ActorBuilder({id: 'pilot', name: 'pilot'})
      .useTraits([
        of('rules/gravity', 'AffectedByGravityTrait'),
        of('rules/jetpack', 'FliesWithAJetpackTrait'),
        of('rules/motion', 'CanMoveTrait'),
      ])
      .set(PositionProperty, at(100, 104))
      .set(of('rules/collisions', 'SizeProperty'), new Vector(16, 16))
      .instantiate('pilot');
    for (const [name, value] of Object.entries(settings)) {
      pilot.set(of('rules/jetpack', name), value as never);
    }
    world.addActor(pilot);
    // Long enough to land and be counted as standing.
    run(world, 0.2);
    return {world, floor, pilot};
  };

  /** Switch on, hold for a while, switch off — the two moments a key gives. */
  const flyFor = (world: World, pilot: unknown, seconds: number) => {
    world.act(of('rules/jetpack', 'StartFlyingAction'), pilot as never);
    run(world, seconds);
    world.act(of('rules/jetpack', 'StopFlyingAction'), pilot as never);
  };

  const read = (pilot: unknown, name: string) =>
    (pilot as {get(p: unknown): number}).get(of('rules/jetpack', name));
  const height = (pilot: unknown) =>
    (pilot as {get(p: unknown): Vector}).get(PositionProperty).y;

  it('climbs while it is on, and keeps climbing for a moment after', () => {
    // The whole difference from a jump. Thrust is an ACCELERATION, so the rise
    // continues past the release — a rule that set the speed directly would
    // stop dead in the frame the key came up.
    const {world, pilot} = grounded();
    const floorLevel = height(pilot);

    flyFor(world, pilot, 0.5);
    const released = height(pilot);
    run(world, 0.1);

    expect(released).toBeLessThan(floorLevel - 30);
    expect(height(pilot)).toBeLessThan(released);
  });

  it('does not rise on the first frame, because gravity is still winning', () => {
    // The lag that makes it read as weight. On frame one the thrust has added
    // 18/60 of a unit and gravity has taken 9/60 back, so the actor is barely
    // moving — it is not at the top of the screen, which is what setting the
    // speed would have done.
    const {world, pilot} = grounded();
    const floorLevel = height(pilot);

    flyFor(world, pilot, 1 / 60);

    expect(floorLevel - height(pilot)).toBeLessThan(2);
  });

  it('holds its top speed however long it is left on', () => {
    // Uncapped, a fifth of a second of thrust already outruns a sixteen-tile
    // room. The cap is what leaves the player time to aim.
    const {world, pilot} = grounded();

    world.act(of('rules/jetpack', 'StartFlyingAction'), pilot as never);
    run(world, 0.5);
    const before = height(pilot);
    run(world, 1 / 60);

    // Three units a second is 300 pixels a second, so five pixels a frame.
    expect(before - height(pilot)).toBeLessThanOrEqual(5.01);
  });

  it('caps the climb without capping the fall', () => {
    // A jetpack that also limited the fall would be a parachute. Falling is
    // Gravity's business, and the cap is written against the sign so that it
    // cannot touch it — which is invisible in a position and plain in a speed.
    const {world, pilot} = grounded();
    const speed = () =>
      (pilot as {get(p: unknown): Vector}).get(
        of('rules/motion', 'VelocityProperty'),
      ).y;

    flyFor(world, pilot, 1);
    expect(speed()).toBeGreaterThanOrEqual(-3.01);
    // Falling now, and past the cap: gravity takes about two thirds of a
    // second to undo the climb and the same again to beat it.
    run(world, 0.8);

    expect(speed()).toBeGreaterThan(3.5);
  });

  it('burns fuel by the second, not by the frame', () => {
    const {world, pilot} = grounded();

    flyFor(world, pilot, 1);

    // A quarter tank a second, so three quarters left after one.
    expect(read(pilot, 'FuelProperty')).toBeCloseTo(75, 1);
  });

  it('will not switch on with an empty tank', () => {
    // The state a fallback jump exists for, and the reason `start` refuses
    // rather than arming: the press that could not fly is free for the jump
    // to answer.
    const {world, pilot} = grounded({FuelProperty: 0});
    const floorLevel = height(pilot);

    flyFor(world, pilot, 0.5);

    expect(height(pilot)).toBeCloseTo(floorLevel, 1);
    expect(
      (pilot as {get(p: unknown): boolean}).get(
        of('rules/jetpack', 'FlyingProperty'),
      ),
    ).toBe(false);
  });

  it('says when the flying starts, stops and runs dry — each once', () => {
    // Three moments, and the reason they are moments: an animation started on
    // every frame of thrust would restart sixty times a second.
    const {world, pilot} = grounded({
      FuelProperty: 25,
      FuelPerSecondProperty: 25,
    });
    const said: string[] = [];
    for (const [event, name] of [
      ['StartsFlyingEvent', 'start'],
      ['StopsFlyingEvent', 'stop'],
      ['RunsOutOfFuelEvent', 'dry'],
    ] as const) {
      // ON THE ACTOR: these are the trait's, so they are about whoever elected
      // it rather than about the world.
      (pilot as {on(e: unknown, f: () => void): void}).on(
        of('rules/jetpack', event),
        () => said.push(name),
      );
    }

    // A second of flight empties a quarter tank, and the empty tank switches
    // the jetpack off itself — nothing outside says stop.
    world.act(of('rules/jetpack', 'StartFlyingAction'), pilot as never);
    run(world, 1.2);

    expect(said).toEqual(['start', 'dry', 'stop']);
  });

  it('says it stopped when it is switched off, with fuel to spare', () => {
    const {world, pilot} = grounded();
    let stops = 0;
    (pilot as {on(e: unknown, f: () => void): void}).on(
      of('rules/jetpack', 'StopsFlyingEvent'),
      () => {
        stops++;
      },
    );

    world.act(of('rules/jetpack', 'StartFlyingAction'), pilot as never);
    run(world, 0.2);
    expect(stops).toBe(0);
    world.act(of('rules/jetpack', 'StopFlyingAction'), pilot as never);
    // …and again, which a key released twice would do.
    world.act(of('rules/jetpack', 'StopFlyingAction'), pilot as never);
    // An event is queued and delivered after the steps, so it takes a frame
    // to arrive however early it was raised (`EventQueue`).
    run(world, 1 / 60);

    expect(stops).toBe(1);
    expect(read(pilot, 'FuelProperty')).toBeGreaterThan(0);
  });

  it('fills a tank without overfilling it', () => {
    // What a pickup does, and the clamp is the part that is easy to leave out.
    const {world, pilot} = grounded({FuelProperty: 80});

    world.act(of('rules/jetpack', 'GiveFuelAction'), pilot as never, 50);

    expect(read(pilot, 'FuelProperty')).toBe(100);
  });
});
