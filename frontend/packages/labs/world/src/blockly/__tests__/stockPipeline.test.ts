// The order the shipped rules actually run in, read from the shipped rules.
//
// They used to say it by naming each other: five of the seven steps carried a
// cross-rule anchor, so `before Physics ▸ reposition` was how gravity said "I
// am a force". Each now names a phase instead (engine/core/phases), and this
// is the guard on that conversion — it takes the real `.rule` workspaces, reads
// the phase off each step, and runs them through the real Scheduler.
//
// The expected order is the one the anchors produced. If a phase is misassigned
// — gravity's landing put in `touch`, say — the game still starts and actors
// land a frame late, which is the kind of bug nobody finds by playing.

import {describe, expect, it} from 'vitest';

import {Scheduler} from '../../engine/core/Scheduler';
import type {Step} from '../../engine/core/types';
import {arrowsRule} from '../../rules/stock/arrows';
import {collisionsRule} from '../../rules/stock/collisions';
import {gravityRule} from '../../rules/stock/gravity';
import {inputRule} from '../../rules/stock/input';
import {motionRule} from '../../rules/stock/motion';
import {solidRule} from '../../rules/stock/solid';
import {parseRuleMeta} from '../ruleMeta';

const STOCK: ReadonlyArray<readonly [string, string]> = [
  ['rules/input', inputRule],
  ['rules/arrows', arrowsRule],
  ['rules/gravity', gravityRule],
  ['rules/motion', motionRule],
  ['rules/collisions', collisionsRule],
  ['rules/solid', solidRule],
];

/** Every step the stock library declares, as the Scheduler would see it. */
const stockSteps = (): Step[] =>
  STOCK.flatMap(([path, source]) => {
    const meta = parseRuleMeta(path, source);
    expect(meta, path).toBeDefined();
    return meta!.steps.map(step => ({
      id: step.id,
      ownerId: meta!.id,
      order:
        step.order.kind === 'phase' && step.order.phase
          ? ({kind: 'phase', phase: step.order.phase} as const)
          : ({kind: 'free'} as const),
      run: () => {},
    }));
  });

describe('the pipeline the stock rules describe', () => {
  it('names a phase on every step, and no other rule', () => {
    for (const [path, source] of STOCK) {
      for (const step of parseRuleMeta(path, source)!.steps) {
        expect(step.order.kind, `${path} ▸ ${step.id}`).toBe('phase');
        expect(step.order.anchor, `${path} ▸ ${step.id}`).toBeUndefined();
      }
    }
  });

  it('runs in the order the anchors used to produce', () => {
    expect(new Scheduler(stockSteps()).order().map(step => step.id)).toEqual([
      'keyEvents', // sense   — read the keys
      'control', // decide  — a held key becomes sideways velocity
      'applyVelocity', // push    — gravity adds to velocity
      'reposition', // move    — velocity becomes position
      'find', // touch   — who is against what
      'resolve', // settle  — push solids apart
      'handleCollisions', // react   — land, and raise the falling events
    ]);
  });

  it('holds that order however the rules were loaded', () => {
    // What the anchors could not promise for two steps in the same moment, and
    // what phases promise for every pair in different ones. Reversed here
    // because load order is dependency order, and this is the awkward one.
    const reversed = [...stockSteps()].reverse();

    expect(new Scheduler(reversed).order().map(step => step.id)).toEqual(
      new Scheduler(stockSteps()).order().map(step => step.id),
    );
  });
});
