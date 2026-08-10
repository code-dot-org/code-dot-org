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
      'notice_contacts', // react   — turn the contact set into its edges
    ]);
  });

  it('holds every step in its phase however the rules were loaded', () => {
    // What phases promise, and the whole of it: a step runs in its moment, and
    // the moments run in order. WITHIN a moment nothing is promised — steps
    // there are unordered by design and must commute (engine/core/phases).
    //
    // This test used to compare the flat list, which was a stronger claim than
    // the model makes. It held only while every phase had at most one step; the
    // moment `react` gained a second, reversing the load order swapped the two,
    // because a phase keeps the order its steps arrived in. The flat list was
    // never the guarantee — it was a coincidence that read like one.
    const phaseOf = (steps: Step[]) =>
      new Scheduler(steps)
        .order()
        .map(step => (step.order.kind === 'phase' ? step.order.phase : 'free'));

    const reversed = [...stockSteps()].reverse();

    expect(phaseOf(reversed)).toEqual(phaseOf(stockSteps()));
  });

  it('puts both `react` steps after everything that moves anything', () => {
    // The pair in one moment has to commute, and does: NEITHER writes what the
    // other reads. Gravity lands actors and sets `falling`; the contact edges
    // compare `contacts` (written back in `touch`) against `contacts before`.
    // Beyond that each only QUEUES an event, and `World.tick` flushes the queue
    // after every step, so no handler's effects land between them.
    //
    // What their order does decide is which of two unrelated events a project
    // hears first — and that is genuinely undecided. A game must not depend on
    // it, which is what being in one moment means.
    const order = new Scheduler(stockSteps()).order().map(step => step.id);

    for (const id of ['handleCollisions', 'notice_contacts']) {
      expect(order.indexOf(id), id).toBeGreaterThan(order.indexOf('resolve'));
    }
  });
});
