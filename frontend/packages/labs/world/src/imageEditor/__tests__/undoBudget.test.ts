// How deep the undo stack goes, which is a question about size.
//
// It lived inside `PixelEditor` as four lines in the middle of a snapshot,
// where the only way to find out what it did was to draw thirty times.

import {describe, expect, it} from 'vitest';

import {
  MAX_UNDO_DEPTH,
  MIN_UNDO_DEPTH,
  UNDO_BYTE_BUDGET,
  undoDepthFor,
} from '../undoBudget';

/** The bytes a stack of that depth would hold, for a picture this size. */
const held = (w: number, h: number) => undoDepthFor(w, h) * w * h * 4;

describe('undoDepthFor', () => {
  it('keeps the full history for the sprites this lab is made of', () => {
    // A 32×32 is four kilobytes a step: four thousand would fit in the
    // budget, so the depth cap is what decides and a learner drawing a coin
    // has every step of it.
    expect(undoDepthFor(32, 32)).toBe(MAX_UNDO_DEPTH);
    expect(undoDepthFor(320, 320)).toBe(MAX_UNDO_DEPTH);
  });

  it('keeps fewer steps of a picture too big for thirty', () => {
    // 1024×1024 is four megabytes a step: four fit, and a fifth would not.
    expect(undoDepthFor(1024, 1024)).toBe(4);
    // 512×512 is one megabyte: sixteen fit, which is under the cap.
    expect(undoDepthFor(512, 512)).toBe(16);
  });

  it('never keeps fewer than a history is worth', () => {
    // A 4K backdrop is 33MB a step — the budget alone would say zero, which
    // is not an undo stack. The floor is what makes the feature exist at all
    // for a picture this big; it costs 133MB, and that is the trade.
    expect(undoDepthFor(4096, 2160)).toBe(MIN_UNDO_DEPTH);
    expect(undoDepthFor(20000, 20000)).toBe(MIN_UNDO_DEPTH);
  });

  it('stays inside the budget wherever the budget is what decides', () => {
    // Between the two clamps, which is the range the arithmetic is for.
    for (const [w, h] of [
      [512, 512],
      [640, 480],
      [800, 600],
      [1024, 768],
    ]) {
      expect(held(w, h), `${w}x${h}`).toBeLessThanOrEqual(UNDO_BYTE_BUDGET);
    }
  });

  it('never grows as the picture does', () => {
    // Monotonic, which is the property that makes it a budget rather than a
    // formula that happens to give sensible answers at the sizes tried.
    let previous = Infinity;
    for (let side = 32; side <= 4096; side *= 2) {
      const depth = undoDepthFor(side, side);
      expect(depth, `${side}px`).toBeLessThanOrEqual(previous);
      previous = depth;
    }
  });
});
