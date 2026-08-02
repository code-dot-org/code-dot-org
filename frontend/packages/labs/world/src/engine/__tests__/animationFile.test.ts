import {describe, expect, it} from 'vitest';

import {parseAnimationFile} from '../index';

describe('parseAnimationFile', () => {
  it('parses a well-formed animation file into a defs map', () => {
    const defs = parseAnimationFile({
      type: 'animation',
      animations: {
        walk: {
          // An old file's display name: read and dropped, since an animation is
          // named by the key it is filed under and nothing ever showed this.
          name: 'Walking',
          loop: false,
          frames: [
            {
              sprite: 'hero',
              position: {x: 0, y: 0, width: 16, height: 16},
              delay: 120,
            },
            {sprite: 'hero', offset: {x: 1, y: -2}, scale: 2, delay: 120},
          ],
        },
      },
    });
    expect(Object.keys(defs)).toEqual(['walk']);
    expect('name' in defs.walk).toBe(false);
    expect(defs.walk.loop).toBe(false);
    expect(defs.walk.frames).toHaveLength(2);
    expect(defs.walk.frames[0]).toEqual({
      sprite: 'hero',
      delay: 120,
      position: {x: 0, y: 0, width: 16, height: 16},
      offset: undefined,
      scale: undefined,
    });
    expect(defs.walk.frames[1].offset).toEqual({x: 1, y: -2});
    expect(defs.walk.frames[1].scale).toBe(2);
  });

  it('rejects malformed files with a descriptive error', () => {
    expect(() => parseAnimationFile(null)).toThrow(/expected an object/);
    expect(() => parseAnimationFile({type: 'sprite'})).toThrow(
      /expected type "animation"/,
    );
    expect(() => parseAnimationFile({type: 'animation'})).toThrow(
      /missing "animations"/,
    );
    expect(() =>
      parseAnimationFile({type: 'animation', animations: {a: {frames: []}}}),
    ).toThrow(/"a" needs a non-empty "frames"/);
    expect(() =>
      parseAnimationFile({
        type: 'animation',
        animations: {a: {frames: [{delay: 100}]}},
      }),
    ).toThrow(/"a" frame 0 needs a non-empty "sprite"/);
    expect(() =>
      parseAnimationFile({
        type: 'animation',
        animations: {a: {frames: [{sprite: 's', delay: 'slow'}]}},
      }),
    ).toThrow(/"a" frame 0 "delay" must be a number/);
    expect(() =>
      parseAnimationFile({
        type: 'animation',
        animations: {a: {frameRate: 0, frames: [{sprite: 's'}]}},
      }),
    ).toThrow(/"a" "frameRate" must be a positive number/);
  });

  it('takes an animation timed by its frame rate', () => {
    // A frame need not carry a delay: the rate is the animation's, and saying
    // it once is the point (INTERFACE.md §Animations).
    const defs = parseAnimationFile({
      type: 'animation',
      animations: {
        walk: {
          frameRate: 8,
          frames: [{sprite: 'a.png'}, {sprite: 'b.png', delay: 500}],
        },
      },
    });

    expect(defs.walk.frameRate).toBe(8);
    expect(defs.walk.frames[0].delay).toBeUndefined();
    expect(defs.walk.frames[1].delay).toBe(500);
  });
});
