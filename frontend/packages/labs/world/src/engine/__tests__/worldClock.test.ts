// The clock a world is lent, as against the arithmetic it does with it.
//
// `clock.test` covers the splitting; this covers the borrowing — that a world
// with no clock is at a fixed moment, that a lent one is read, and that one
// frame reads ONE moment however long it takes (specs/CLOCK_PLAN.md).

import {describe, expect, it} from 'vitest';

import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {NO_CLOCK} from '../core/clock';

const MOMENT = Date.UTC(2026, 8, 20, 14, 30, 45) / 1000;

const world = () => new WorldBuilder({id: 'w', name: 'W'}).getWorld();

describe('a world nobody lent a clock', () => {
  it('sits at one fixed moment, so a headless run cannot drift', () => {
    const w = world();
    expect(w.now()).toBe(NO_CLOCK);
    w.tick(1 / 60);
    expect(w.now()).toBe(NO_CLOCK);
  });

  it('still answers the parts and the words', () => {
    const w = world();
    expect(w.timePart(w.now(), 'year')).toBe(2000);
    expect(w.timeText(w.now(), 'both')).toBe('2000-01-01 00:00');
  });
});

describe('a world lent one', () => {
  it('reads it before it has ticked at all', () => {
    const w = world().useClock(() => MOMENT);
    expect(w.now()).toBe(MOMENT);
    expect(w.timeText(w.now(), 'date')).toBe('2026-09-20');
  });

  it('reads every part in the zone it was lent', () => {
    const w = world().useClock(() => MOMENT, -300);
    expect(w.timePart(w.now(), 'hour')).toBe(9);
    expect(w.timeZoneOffset()).toBe(-300);
    expect(w.timeText(w.now(), 'clock')).toBe('09:30');
  });

  it('samples ONCE a frame, so a frame cannot straddle a second', () => {
    // A clock that moves on every read is exactly the thing this guards
    // against: two blocks a line apart landing either side of a second, and a
    // project subtracting them seeing time run backwards.
    let reads = 0;
    const w = world().useClock(() => MOMENT + reads++);

    w.tick(1 / 60);
    const first = w.now();
    expect(w.now()).toBe(first);
    expect(w.now()).toBe(first);

    w.tick(1 / 60);
    expect(w.now()).toBeGreaterThan(first);
  });

  it('is read by a step, at the moment the frame is at', () => {
    const seen: number[] = [];
    const rule = new RuleBuilder({id: 'watch', name: 'Watch'});
    rule.addStepIn('read', 'sense', one => void seen.push(one.now()));
    let at = MOMENT;
    const w = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([rule.build()])
      .getWorld()
      .useClock(() => at);

    w.tick(1 / 60);
    at = MOMENT + 60;
    w.tick(1 / 60);

    expect(seen).toEqual([MOMENT, MOMENT + 60]);
  });

  it('moves with the world outside, not with the frames', () => {
    // The whole reason this is a second clock rather than a second reading of
    // `time`. `time` is a sum of deltas — sixty frames make a second of it,
    // however long they really took — and this is what the machine says. A
    // frame that took two minutes of wall time moves them differently.
    let at = MOMENT;
    const w = world().useClock(() => at);

    at = MOMENT + 120;
    w.tick(1 / 60);

    expect(w.time()).toBeCloseTo(1 / 60);
    expect(w.now()).toBe(MOMENT + 120);
  });

  it('is still read while the game is paused', () => {
    // A paused game still ticks — it runs `sense` so clicks still become
    // events (`World.pause`) — so the wall clock is still sampled, which is
    // what a menu showing the time needs.
    let at = MOMENT;
    const w = world().useClock(() => at);
    w.pause();

    at = MOMENT + 300;
    w.tick(1 / 60);

    expect(w.now()).toBe(MOMENT + 300);
  });

  it('answers nonsense with something harmless', () => {
    const w = world().useClock(() => MOMENT);
    expect(w.timePart('not a moment', 'year')).toBe(0);
    expect(w.timePart(w.now(), 'fortnight')).toBe(0);
    expect(w.timeText('not a moment', 'date')).toBe('');
  });
});
