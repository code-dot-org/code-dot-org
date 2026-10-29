// The Main Screen's background as the screen's own calls (`screenBackground`,
// specs/ONE_WORLD_PLAN.md).

import {describe, expect, it} from 'vitest';

import {screenBackgroundCalls, screenBackgroundOf} from '../screenBackground';

describe('screenBackgroundCalls', () => {
  it('sets the picture, then how it tiles and where it sits', () => {
    expect(
      screenBackgroundCalls({
        sprite: 'sky.png',
        repeat: true,
        offset: {x: 4, y: 0},
      }),
    ).toBe(
      'world.setScreenBackground("sky.png");\n' +
        'world.setScreenBackgroundRepeat(true);\n' +
        'world.setScreenBackgroundOffset(new WorldLab.Vector(4, 0));\n',
    );
  });

  it('says nothing for a screen with no background', () => {
    expect(screenBackgroundCalls(undefined)).toBe('');
    expect(screenBackgroundCalls({})).toBe('');
  });
});

describe('screenBackgroundOf', () => {
  it('is the screen’s `background`, and nothing for one that says none', () => {
    expect(
      screenBackgroundOf(JSON.stringify({background: {sprite: 'a.png'}})),
    ).toEqual({sprite: 'a.png'});
    expect(screenBackgroundOf(JSON.stringify({layers: []}))).toBeUndefined();
    expect(screenBackgroundOf('not json')).toBeUndefined();
  });
});
