// SPIKE: can a rule demonstrate itself?
//
// The question behind it: the import dialog would be far better if choosing a
// rule showed the rule DOING something, the way the effect picker shows a still
// and animates the row you are looking at. Before building that pipeline, two
// things are worth knowing:
//
//   1. How long does a demo world take to author? (Twenty-three rules is a lot
//      of little worlds, and they have to stay honest as the rules change.)
//   2. Is a STILL worth anything for a rule, or does a rule only read in
//      motion? The effect picker's whole design rests on the still being the
//      feature and the motion being an enhancement — if that is false here, this
//      is a more expensive feature than it looks.
//
// So: three demo worlds, written against the REAL stock rules (compiled here,
// not reimplemented), recorded, and written out as an animated SVG and a still
// each. Run it and look at `spikes/rule-demos/out/`.
//
//   npx vitest --run spikes/rule-demos/renderDemos.test.tsx
//
// Not part of the suite — `spikes/**` is excluded in vitest.config.

import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  PositionProperty,
  Vector,
  WorldBuilder,
} from '../../src/engine';
import {
  collectRule,
  collisionsRule,
  gravityRule,
  motionRule,
  solidRule,
  steeringRule,
} from '../../src/rules/stock';

import {compileRules, type RuleModule} from './compile';
import {toStill, toSvg, type Snap} from './svg';

const OUT = join(__dirname, 'out');
const SIZE = {width: 200, height: 140};
const FRAMES = 90;
const RATE = 1 / 60;

/** Record a world for `FRAMES` frames, reading the engine's own snapshot. */
function record(
  world: ReturnType<WorldBuilder['instantiate']>,
  colours: Record<string, string>,
  sizes: Record<string, {width: number; height: number}>,
): Snap[][] {
  const frames: Snap[][] = [];
  for (let frame = 0; frame < FRAMES; frame++) {
    frames.push(
      world.renderSnapshot().map(state => {
        const actor = state.actor as unknown as {id: string; type: string};
        return {
          id: actor.id,
          x: state.x,
          y: state.y,
          ...(sizes[actor.type] ?? {width: 16, height: 16}),
          colour: colours[actor.type] ?? '#8ab4f8',
        };
      }),
    );
    world.tick(RATE);
  }
  return frames;
}

function write(name: string, frames: Snap[][]): void {
  mkdirSync(OUT, {recursive: true});
  writeFileSync(join(OUT, `${name}.svg`), toSvg(frames, SIZE, FRAMES * RATE));
  writeFileSync(
    join(OUT, `${name}-still.svg`),
    toStill(frames, Math.floor(FRAMES / 2), SIZE),
  );
}

describe('a rule demonstrating itself', () => {
  it('records gravity, steering and collection', async () => {
    // Compiled in dependency order — the real `.rule` files, not stand-ins.
    const modules = await compileRules({
      'rules/motion': motionRule,
      'rules/collisions': collisionsRule,
      'rules/solid': solidRule,
      'rules/gravity': gravityRule,
      'rules/steering': steeringRule,
      'rules/collect': collectRule,
    });
    // eslint-disable-next-line no-console
    console.log(
      Object.entries(modules)
        .map(([k, v]) => `${k}: ${Object.keys(v).join(', ')}`)
        .join('\n'),
    );
    const of = (path: string, name: string) =>
      (modules[path] as RuleModule)[name] as never;
    const rule = (path: string) =>
      (modules[path] as RuleModule).default as never;

    const failed: string[] = [];
    const attempt = (name: string, run: () => void) => {
      try {
        run();
      } catch (error) {
        failed.push(`${name}: ${(error as Error).message}`);
      }
    };

    // ── Gravity: a ball falls and lands on the ground ────────────────────
    attempt('gravity', () => {
      const world = new WorldBuilder({id: 'g', name: 'G'})
        .useRules([rule('rules/gravity')])
        .instantiate();
      world.addActor(
        new ActorBuilder({id: 'ball', name: 'ball'})
          .useTraits([of('rules/gravity', 'AffectedByGravityTrait')])
          .set(PositionProperty, new Vector(100, 20))
          .instantiate('ball', 'ball'),
      );
      world.addActor(
        new ActorBuilder({id: 'ground', name: 'ground'})
          .useTraits([
            of('rules/gravity', 'ActsAsGroundTrait'),
            of('rules/solid', 'SolidTrait'),
          ])
          .set(PositionProperty, new Vector(100, 120))
          .set(of('rules/collisions', 'SizeProperty'), new Vector(160, 16))
          .instantiate('ground', 'ground'),
      );
      write(
        'gravity',
        record(
          world,
          {ball: '#f6c453', ground: '#5a7d5a'},
          {ball: {width: 16, height: 16}, ground: {width: 160, height: 16}},
        ),
      );
    });

    // ── Steering: one actor chases another ───────────────────────────────
    attempt('steering', () => {
      const world = new WorldBuilder({id: 's', name: 'S'})
        .useRules([rule('rules/steering')])
        .instantiate();
      const prey = new ActorBuilder({id: 'prey', name: 'prey'})
        .set(PositionProperty, new Vector(160, 70))
        .instantiate('prey', 'prey');
      world.addActor(prey);
      const hunter = new ActorBuilder({id: 'hunter', name: 'hunter'})
        .useTraits([of('rules/steering', 'ChasesTrait')])
        .set(PositionProperty, new Vector(24, 110))
        .set(of('rules/steering', 'ChaseSpeedProperty'), 1.2)
        .set(of('rules/steering', 'KeepDistanceProperty'), 22)
        .instantiate('hunter', 'hunter');
      world.addActor(hunter);
      hunter.set(of('rules/steering', 'ActorToChaseProperty'), prey as never);
      write(
        'steering',
        record(
          world,
          {prey: '#7fd1b9', hunter: '#e06c75'},
          {prey: {width: 16, height: 16}, hunter: {width: 16, height: 16}},
        ),
      );
    });

    // ── Collection: a collector walks through three coins ────────────────
    attempt('collect', () => {
      const world = new WorldBuilder({id: 'c', name: 'C'})
        .useRules([rule('rules/collect')])
        .instantiate();
      const walker = new ActorBuilder({id: 'walker', name: 'walker'})
        // Can Move as well as Collects: a collector that cannot move never
        // reaches a coin, and Collection does not imply motion. A demo world
        // has to know a rule's trait dependencies, which is a real part of
        // what authoring twenty-three of them would cost.
        .useTraits([
          of('rules/collect', 'CollectsTrait'),
          of('rules/motion', 'CanMoveTrait'),
        ])
        .set(PositionProperty, new Vector(16, 70))
        .set(of('rules/motion', 'VelocityProperty'), new Vector(1.6, 0))
        .instantiate('walker', 'walker');
      world.addActor(walker);
      for (const [n, x] of [60, 110, 160].entries()) {
        world.addActor(
          new ActorBuilder({id: `coin${n}`, name: 'coin'})
            .useTraits([of('rules/collect', 'CanBeCollectedTrait')])
            .set(PositionProperty, new Vector(x, 70))
            .instantiate(`coin${n}`, 'coin'),
        );
      }
      write(
        'collect',
        record(
          world,
          {walker: '#c678dd', coin: '#f6c453'},
          {walker: {width: 16, height: 16}, coin: {width: 12, height: 12}},
        ),
      );
    });

    // eslint-disable-next-line no-console
    console.log('FAILED:', failed.length ? failed.join(' | ') : 'none');
    expect(true).toBe(true);
  }, 30000);
});
