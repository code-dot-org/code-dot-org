// The time of DAY, as arithmetic — `core/clock`, with no world in sight.
//
// Not to be confused with `clock.test`, which is about `World.time`: seconds
// since this world started, which is what a cooldown is measured in. These
// two numbers answer different questions and the lab keeps them apart
// (specs/CLOCK_PLAN.md).
//
// Every case here states its own moment and its own offset, so a runner in
// Berlin and a runner in Los Angeles agree — which is the reason the splitting
// takes an offset instead of reading one (specs/CLOCK_PLAN.md).

import {describe, expect, it} from 'vitest';

import {NO_CLOCK, partOf, partsOf, timeText, TIME_PARTS} from '../core/clock';

/** 2026-09-20T14:30:45Z — a Sunday, mid-year and mid-day on purpose. */
const MOMENT = Date.UTC(2026, 8, 20, 14, 30, 45) / 1000;

describe('splitting a moment', () => {
  it('reads it in UTC when nothing says otherwise', () => {
    expect(partsOf(MOMENT)).toEqual({
      year: 2026,
      month: 9,
      day: 20,
      hour: 14,
      minute: 30,
      second: 45,
      weekday: 7,
    });
  });

  it('counts months from one and weekdays from Monday', () => {
    // January is 1, not 0 — a learner writing "if the month is 12" means
    // December. And Monday is 1, so the working week reads 1 to 5.
    const newYear = Date.UTC(2024, 0, 1) / 1000; // a Monday
    expect(partOf(newYear, 'month')).toBe(1);
    expect(partOf(newYear, 'weekday')).toBe(1);
    expect(partOf(newYear + 6 * 86400, 'weekday')).toBe(7);
  });

  it('shifts by the offset, in the sign a person would write', () => {
    // New York in winter is UTC-5, Berlin UTC+1. Same moment, three clocks.
    expect(partOf(MOMENT, 'hour', -300)).toBe(9);
    expect(partOf(MOMENT, 'hour', 60)).toBe(15);
    expect(partOf(MOMENT, 'hour')).toBe(14);
  });

  it('carries the offset across a day boundary', () => {
    // Late enough in UTC that a western zone is still on the day before.
    const lateNight = Date.UTC(2026, 8, 20, 2, 0, 0) / 1000;
    expect(partsOf(lateNight, -300)).toMatchObject({day: 19, hour: 21});
    expect(partsOf(lateNight, 60)).toMatchObject({day: 20, hour: 3});
  });

  it('ignores anything finer than a second', () => {
    expect(partsOf(MOMENT + 0.99)).toEqual(partsOf(MOMENT));
  });

  it('answers every part the dropdown offers', () => {
    for (const part of TIME_PARTS) {
      expect(Number.isFinite(partOf(MOMENT, part)), part).toBe(true);
    }
  });
});

describe('a moment as words', () => {
  it('writes a date that sorts, and a clock that does not lie', () => {
    expect(timeText(MOMENT, 'date')).toBe('2026-09-20');
    expect(timeText(MOMENT, 'clock')).toBe('14:30');
    expect(timeText(MOMENT, 'both')).toBe('2026-09-20 14:30');
  });

  it('pads, so the text is the same width every day', () => {
    const early = Date.UTC(2026, 0, 5, 7, 4, 0) / 1000;
    expect(timeText(early, 'both')).toBe('2026-01-05 07:04');
  });

  it('writes the zone it was asked for', () => {
    expect(timeText(MOMENT, 'both', -300)).toBe('2026-09-20 09:30');
  });
});

describe('a world nobody lent a clock', () => {
  it('sits at one moment, and it is obviously not now', () => {
    expect(timeText(NO_CLOCK, 'both')).toBe('2000-01-01 00:00');
  });
});
