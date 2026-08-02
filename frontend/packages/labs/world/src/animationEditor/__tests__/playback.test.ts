// The preview's playhead.
//
// Time in, frame out. The edges are the whole of it: the boundary between two
// frames, a time past the end, a delay of zero, and what comes "before" the
// first frame of something that loops.

import {describe, expect, it} from 'vitest';

import {frameAt, previousFrame, startOf, totalTime} from '../playback';

/** Three frames of 100ms — 0..99 is the first, 100..199 the second. */
const frames = [100, 100, 100];

describe('totalTime', () => {
  it('adds the delays up', () => {
    expect(totalTime(frames)).toBe(300);
  });

  it('is nothing for no frames', () => {
    expect(totalTime([])).toBe(0);
  });
});

describe('frameAt', () => {
  it('holds each frame for its own delay', () => {
    expect(frameAt(frames, 0)).toBe(0);
    expect(frameAt(frames, 99)).toBe(0);
    // The boundary belongs to the frame that starts there.
    expect(frameAt(frames, 100)).toBe(1);
    expect(frameAt(frames, 250)).toBe(2);
  });

  it('follows an uneven timing', () => {
    const uneven = [50, 500, 50];
    expect(frameAt(uneven, 49)).toBe(0);
    expect(frameAt(uneven, 51)).toBe(1);
    expect(frameAt(uneven, 549)).toBe(1);
    expect(frameAt(uneven, 551)).toBe(2);
  });

  it('clamps at both ends', () => {
    expect(frameAt(frames, -5)).toBe(0);
    expect(frameAt(frames, 10_000)).toBe(2);
  });
});

describe('startOf', () => {
  it('says when a frame begins', () => {
    expect(startOf(frames, 0)).toBe(0);
    expect(startOf(frames, 2)).toBe(200);
  });

  it('round-trips with frameAt — resuming lands on the frame resumed from', () => {
    for (let index = 0; index < frames.length; index++) {
      expect(frameAt(frames, startOf(frames, index))).toBe(index);
    }
  });

  it('treats a nonsense index as the start', () => {
    expect(startOf(frames, -1)).toBe(0);
  });
});

describe('previousFrame', () => {
  it('is the one before', () => {
    expect(previousFrame(frames.length, 2, true)).toBe(1);
  });

  it('wraps to the last frame when the animation loops', () => {
    // The pair that has to line up, and the pair nothing else shows together.
    expect(previousFrame(frames.length, 0, true)).toBe(2);
  });

  it('is nothing before the first frame of one that does not', () => {
    expect(previousFrame(frames.length, 0, false)).toBe(-1);
  });

  it('is nothing when there is only one frame, or none', () => {
    expect(previousFrame(1, 0, true)).toBe(-1);
    expect(previousFrame(0, 0, true)).toBe(-1);
  });
});
