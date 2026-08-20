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

import {beforeAll, describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  PositionProperty,
  Vector,
  WorldBuilder,
  type World,
} from '../../engine';
import {
  collectRule,
  collisionsRule,
  gravityRule,
  healthRule,
  motionRule,
  solidRule,
  steeringRule,
  timeRule,
} from '../stock';

import {compileStockRules, type RuleModule} from './support/compileStockRules';

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

beforeAll(async () => {
  // Compiled once for the file: this is the expensive part, and it is the same
  // six modules for every test below. Dependency order.
  modules = await compileStockRules({
    'rules/motion': motionRule,
    'rules/collisions': collisionsRule,
    'rules/solid': solidRule,
    'rules/gravity': gravityRule,
    'rules/steering': steeringRule,
    'rules/collect': collectRule,
    'rules/health': healthRule,
    'rules/time': timeRule,
  });
}, 30000);

describe('Gravity', () => {
  it('falls, lands, and stops', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/gravity')])
      .instantiate();
    const ball = new ActorBuilder({id: 'ball', name: 'ball'})
      .useTraits([of('rules/gravity', 'AffectedByGravityTrait')])
      .set(PositionProperty, at(100, 20))
      .instantiate('ball');
    world.addActor(ball);
    world.addActor(
      new ActorBuilder({id: 'ground', name: 'ground'})
        .useTraits([
          of('rules/gravity', 'ActsAsGroundTrait'),
          of('rules/solid', 'SolidTrait'),
        ])
        .set(PositionProperty, at(100, 120))
        .set(of('rules/collisions', 'SizeProperty'), at(160, 16))
        .instantiate('ground'),
    );

    run(world, 1.5);
    const landed = ball.get(PositionProperty).y;
    run(world, 0.5);

    expect(landed).toBeGreaterThan(20);
    expect(landed).toBeLessThan(120);
    // Still there half a second later: it landed rather than passing through.
    expect(ball.get(PositionProperty).y).toBeCloseTo(landed, 1);
  });
});

describe('Steering', () => {
  it('closes the distance and stops where it was told to', () => {
    // The regression. `distance from ⟨a⟩ to ⟨b⟩` took `actor to chase`, which
    // is stored as a LIST, and its body called `.get` on the array — so a
    // chaser crashed the moment it had something to chase.
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/steering')])
      .instantiate();
    const prey = new ActorBuilder({id: 'prey', name: 'prey'})
      .set(PositionProperty, at(160, 70))
      .instantiate('prey');
    world.addActor(prey);
    const hunter = new ActorBuilder({id: 'hunter', name: 'hunter'})
      .useTraits([of('rules/steering', 'ChasesTrait')])
      .set(PositionProperty, at(20, 70))
      .set(of('rules/steering', 'KeepDistanceProperty'), 20)
      .instantiate('hunter');
    world.addActor(hunter);
    hunter.set(of('rules/steering', 'ActorToChaseProperty'), prey as never);

    run(world, 2);

    const apart = Math.hypot(
      prey.get(PositionProperty).x - hunter.get(PositionProperty).x,
      prey.get(PositionProperty).y - hunter.get(PositionProperty).y,
    );
    expect(apart).toBeLessThan(30);
    // …and it stopped rather than climbing onto it.
    expect(apart).toBeGreaterThan(10);
  });
});

describe('Collection', () => {
  it('takes what it walks into, and the coin leaves the world', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule('rules/collect')])
      .instantiate();
    world.addActor(
      new ActorBuilder({id: 'walker', name: 'walker'})
        // Can Move as well: Collection does not imply motion, and a collector
        // that cannot move never reaches a coin.
        .useTraits([
          of('rules/collect', 'CollectsTrait'),
          of('rules/motion', 'CanMoveTrait'),
        ])
        .set(PositionProperty, at(20, 70))
        .set(of('rules/motion', 'VelocityProperty'), at(1.6, 0))
        .instantiate('walker'),
    );
    world.addActor(
      new ActorBuilder({id: 'coin', name: 'coin'})
        .useTraits([of('rules/collect', 'CanBeCollectedTrait')])
        .set(PositionProperty, at(100, 70))
        .instantiate('coin'),
    );

    run(world, 1.5);

    expect([...world.actors].map(actor => actor.id)).not.toContain('coin');
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
