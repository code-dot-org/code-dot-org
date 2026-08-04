import {describe, expect, it} from 'vitest';

import {WorldBuilder} from '../builders/WorldBuilder';
import {Scheduler} from '../core/Scheduler';
import type {Step, StepFn, StepOrder} from '../core/types';

import {GravityRule} from './fixtures/gravityRule';

const noop: StepFn = () => {};

// A loosely-typed step for constructing ordering graphs the builders can't
// (a cycle, or an anchor that is not present).
type MutableStep = {
  id: string;
  ownerId: string;
  run: StepFn;
  order: StepOrder;
};

describe('Scheduler', () => {
  it('orders the standard rules into a single linear chain', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([GravityRule])
      .instantiate();
    const ids = world.stepOrder().map(s => `${s.ownerId}.${s.id}`);
    expect(ids).toEqual([
      // Appearance is in play whether or not a world says so (WorldBuilder's
      // foundation), and its step is unanchored, so it sorts to the front.
      'animation.advanceAnimation',
      'gravity.applyVelocity',
      'motion.reposition',
      'collision.resolve',
      'gravity.handleCollisions',
    ]);
  });

  it('throws on a cyclic before/after constraint', () => {
    const a: MutableStep = {
      id: 'a',
      ownerId: 'r',
      run: noop,
      order: {kind: 'free'},
    };
    const b: MutableStep = {
      id: 'b',
      ownerId: 'r',
      run: noop,
      order: {kind: 'before', anchor: a as unknown as Step},
    };
    a.order = {kind: 'before', anchor: b as unknown as Step};
    expect(
      () => new Scheduler([a as unknown as Step, b as unknown as Step]),
    ).toThrow(/cycle/i);
  });

  it('throws when a step is ordered against an inactive anchor', () => {
    const absent: Step = {
      id: 'x',
      ownerId: 'other',
      run: noop,
      order: {kind: 'free'},
    };
    const dependent: Step = {
      id: 'a',
      ownerId: 'r',
      run: noop,
      order: {kind: 'after', anchor: absent},
    };
    expect(() => new Scheduler([dependent])).toThrow(/not active/i);
  });

  it('honors first/last against free steps', () => {
    const first: Step = {
      id: 'f',
      ownerId: 'r',
      run: noop,
      order: {kind: 'first'},
    };
    const mid: Step = {id: 'm', ownerId: 'r', run: noop, order: {kind: 'free'}};
    const last: Step = {
      id: 'l',
      ownerId: 'r',
      run: noop,
      order: {kind: 'last'},
    };
    // Pass out of order; the scheduler must reorder to first, mid, last.
    const order = new Scheduler([last, mid, first]).order().map(s => s.id);
    expect(order).toEqual(['f', 'm', 'l']);
  });
});
