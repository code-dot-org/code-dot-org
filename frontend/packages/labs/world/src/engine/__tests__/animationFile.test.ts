import {describe, expect, it} from 'vitest';

import {parseAnimationFile} from '../index';

describe('parseAnimationFile', () => {
  it('parses a well-formed animation file into a defs map', () => {
    const defs = parseAnimationFile({
      type: 'animation',
      animations: {
        walk: {
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
    expect(defs.walk.name).toBe('Walking');
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
        animations: {a: {frames: [{sprite: 's'}]}},
      }),
    ).toThrow(/"a" frame 0 needs a numeric "delay"/);
  });
});
