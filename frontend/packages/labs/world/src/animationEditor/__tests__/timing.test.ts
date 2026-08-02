// How fast an animation runs, and what changing that does to its frames.

import {describe, expect, it} from 'vitest';

import {delayOf, retimed, shownRate, uniformDelay} from '../timing';

describe('delayOf', () => {
  it('takes the frame’s own delay first', () => {
    expect(delayOf({frameRate: 10, frames: []}, {delay: 500})).toBe(500);
  });

  it('falls back to the animation’s rate', () => {
    expect(delayOf({frameRate: 8, frames: []}, {})).toBe(125);
  });

  it('falls back again when nothing says', () => {
    expect(delayOf({frames: []}, {})).toBe(100);
    // A rate of zero is not a rate.
    expect(delayOf({frameRate: 0, frames: []}, {})).toBe(100);
  });
});

describe('uniformDelay', () => {
  it('is the delay they all share', () => {
    expect(uniformDelay([{delay: 83}, {delay: 83}])).toBe(83);
  });

  it('is nothing when they disagree, or when any inherits', () => {
    expect(uniformDelay([{delay: 83}, {delay: 500}])).toBeUndefined();
    expect(uniformDelay([{}, {delay: 83}])).toBeUndefined();
    expect(uniformDelay([])).toBeUndefined();
  });
});

describe('shownRate', () => {
  it('is the animation’s own rate', () => {
    expect(shownRate({frameRate: 12, frames: [{delay: 500}]})).toBe(12);
  });

  it('reads the rate off frames that were written one by one', () => {
    // An animation of six 83ms frames is a 12fps animation that never said so.
    expect(shownRate({frames: [{delay: 125}, {delay: 125}]})).toBe(8);
  });

  it('is nothing when the frames do not agree on one', () => {
    expect(shownRate({frames: [{delay: 100}, {delay: 500}]})).toBeUndefined();
  });
});

describe('retimed', () => {
  it('puts the rate on the animation', () => {
    expect(retimed({frames: [{delay: 100}]}, 8).frameRate).toBe(8);
  });

  it('lets frames that were only keeping the old rate follow the new one', () => {
    const before = {frameRate: 12, frames: [{delay: 83}, {delay: 83}]};

    const after = retimed(before, 8);

    expect(after.frames.every(frame => frame.delay === undefined)).toBe(true);
    expect(delayOf(after, after.frames[0])).toBe(125);
  });

  it('clears an old file’s uniform delays too', () => {
    // No frameRate anywhere — the case every animation written before this
    // existed is in, and the one where the field would otherwise do nothing.
    const after = retimed({frames: [{delay: 160}, {delay: 160}]}, 10);

    expect(after.frames.map(frame => frame.delay)).toEqual([
      undefined,
      undefined,
    ]);
  });

  it('keeps a frame that was deliberately different', () => {
    const after = retimed(
      {frameRate: 12, frames: [{delay: 83}, {delay: 1000}, {}]},
      6,
    );

    expect(after.frames.map(frame => frame.delay)).toEqual([
      undefined,
      1000,
      undefined,
    ]);
  });

  it('leaves frames alone when there was no rate to be in step with', () => {
    const after = retimed({frames: [{delay: 100}, {delay: 500}]}, 10);

    expect(after.frames.map(frame => frame.delay)).toEqual([100, 500]);
  });
});
