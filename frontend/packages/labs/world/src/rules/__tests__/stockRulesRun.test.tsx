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
import {DEMO_SIZE, RULE_DEMOS, viewOrigin, type RuleDemo} from '../demos';

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

/** Build a demo world and run it for as long as the demo says. */
const play = (demo: RuleDemo) => {
  const {world, cast} = demo.build(modules);
  run(world, demo.seconds);
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

describe('every demo world', () => {
  // A demo is a claim shown to every learner who opens the import dialog, so
  // the cheapest useful check is that each one DOES something: the first
  // Collection demo recorded twenty-four identical frames, because a collector
  // that does not also elect `Can Move` never reaches a coin, and nothing said
  // so until the strip was looked at (specs/RULE_DEMOS.md).
  it.each(Object.keys(RULE_DEMOS))('%s changes while it runs', id => {
    const demo = RULE_DEMOS[id];
    const {world} = demo.build(modules);
    // Both axes and the cast: gravity's ball only moves DOWN, and Collection's
    // demonstration is that a coin stops being there at all.
    const where = () =>
      [...world.actors]
        .map(actor => {
          const at = actor.get(PositionProperty);
          return `${actor.id}@${Math.round(at.x)},${Math.round(at.y)}`;
        })
        .join(' ');
    const before = where();

    run(world, demo.seconds);

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
    const {world} = demo.build(modules);

    run(world, demo.seconds);

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
