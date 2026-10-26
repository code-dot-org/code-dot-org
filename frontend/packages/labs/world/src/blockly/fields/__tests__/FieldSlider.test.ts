// The step a slider rounds to.
//
// `FieldSlider` itself is SVG and pointer handling, which needs a browser and
// is verified there. `niceStep` is the part with an answer that can be wrong on
// paper: pick it too fine and the block shows 0.043271604938, too coarse and
// the range has fewer positions than the track has pixels.

import {describe, expect, it} from 'vitest';

import {niceStep} from '../FieldSlider';

describe('niceStep', () => {
  it('picks a readable step for the ranges the stock effects declare', () => {
    // The four shapes that actually occur, so a regression here shows up as a
    // value a learner would notice rather than an abstract off-by-one.
    expect(niceStep(0, 0.1)).toBeCloseTo(0.001); // ripple.strength
    expect(niceStep(0, 1)).toBeCloseTo(0.01); // fade.amount, tint colors
    expect(niceStep(0, 12)).toBeCloseTo(0.2); // pulse.speed
    expect(niceStep(2, 128)).toBeCloseTo(2); // pixelate.size
  });

  it('lands on 1, 2 or 5 times a power of ten', () => {
    // Any other step gives values that read as arbitrary — 0.3, 0.6, 0.9 is a
    // sequence; 0.35, 0.7, 1.05 is not.
    for (const max of [0.05, 0.4, 3, 7, 40, 900, 5000]) {
      const step = niceStep(0, max);
      const mantissa = step / Math.pow(10, Math.floor(Math.log10(step)));
      expect([1, 2, 5, 10]).toContain(Math.round(mantissa));
    }
  });

  it('gives about a hundred steps across the range', () => {
    // Finer than a ~54px track can resolve, so rounding never fights the drag;
    // coarse enough that every value it produces is short enough to read.
    for (const [min, max] of [
      [0, 1],
      [0, 0.1],
      [2, 128],
      [-5, 5],
    ]) {
      const count = (max - min) / niceStep(min, max);
      expect(count).toBeGreaterThanOrEqual(50);
      expect(count).toBeLessThanOrEqual(200);
    }
  });

  it('reads a range in either direction, and refuses a degenerate one', () => {
    expect(niceStep(1, 0)).toBeCloseTo(0.01);
    // No span means no step; the caller passes it to `setConstraints`, where 0
    // means "do not round" — the only honest answer for a range of nothing.
    expect(niceStep(5, 5)).toBe(0);
    expect(niceStep(0, Number.POSITIVE_INFINITY)).toBe(0);
  });
});
