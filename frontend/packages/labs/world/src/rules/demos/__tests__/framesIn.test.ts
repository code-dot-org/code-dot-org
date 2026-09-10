// How many cells a strip holds, which two ends have to agree about.
//
// The recorder writes the frames; the dialog animates them with
// `steps(frames)`. Being one out does not drop a cell — it divides the strip
// into the wrong number of pieces, so every cell after the first is drawn part
// way between two of them and the contents slide sideways as it plays. Five
// demos shipped like that, and every one of them was a demo whose length was
// not a whole number of twelfths.

import {existsSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

import {ACTOR_DEMOS, actorDemoFrames} from '../../../actors/demos';
import {RULE_DEMOS, demoFrames} from '../index';
import {DEMO_FPS, DEMO_SIZE, framesIn} from '../types';

/** The recorder's own arithmetic, restated so this compares rather than echoes. */
const kept = (seconds: number): number => {
  const ticks = Math.round(seconds * 60);
  const every = Math.round(60 / DEMO_FPS);
  let frames = 0;
  for (let tick = 0; tick < ticks; tick++) {
    if (tick % every === 0) {
      frames += 1;
    }
  }
  return frames;
};

describe('framesIn', () => {
  it('counts what the recorder keeps, not what the seconds multiply to', () => {
    // 2.2 seconds is 132 ticks and 27 kept frames; the multiplication says 26.
    expect(framesIn(2.2)).toBe(27);
    expect(Math.round(2.2 * DEMO_FPS)).toBe(26);
  });

  it('agrees with the recorder for every length a demo uses', () => {
    const lengths = [
      ...Object.values(RULE_DEMOS).map(demo => demo.seconds),
      ...Object.values(ACTOR_DEMOS).map(demo => demo.seconds),
    ];

    for (const seconds of lengths) {
      expect(framesIn(seconds), `${seconds}s`).toBe(kept(seconds));
    }
  });

  it('tells the dialog what each rule demo really holds', () => {
    for (const id of Object.keys(RULE_DEMOS)) {
      expect(demoFrames(id), id).toBe(kept(RULE_DEMOS[id].seconds));
    }
  });

  it('tells the actor picker the same', () => {
    for (const id of Object.keys(ACTOR_DEMOS)) {
      expect(actorDemoFrames(id), id).toBe(kept(ACTOR_DEMOS[id].seconds));
    }
  });
});

describe('the strips on disk', () => {
  // Only where they are: `public/demos` is gitignored and written by
  // `yarn build:demos`, so a fresh checkout has none and this has nothing to
  // say. Where they exist it is the whole claim end to end — the PNG is as
  // wide as the number the CSS is given, times one frame.
  const strip = (path: string): number | undefined => {
    if (!existsSync(path)) {
      return undefined;
    }
    // PNG: the IHDR's width is four bytes at offset 16.
    return readFileSync(path).readUInt32BE(16);
  };

  it('are as wide as the frame count says', () => {
    let checked = 0;
    for (const id of Object.keys(RULE_DEMOS)) {
      const width = strip(`public/demos/${id}.png`);
      if (width === undefined) {
        continue;
      }
      checked += 1;
      expect(width / DEMO_SIZE.width, id).toBe(demoFrames(id));
    }
    // Said out loud so a run that checked nothing does not read as a pass.
    expect(checked === 0 || checked === Object.keys(RULE_DEMOS).length).toBe(
      true,
    );
  });
});
