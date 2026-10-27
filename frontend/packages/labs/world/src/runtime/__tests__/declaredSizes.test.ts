// The window a game is seen through, as its Main Screen says it.
//
// The map editor draws a guide from it, so a reader that quietly returns the
// wrong one puts a dashed rectangle in the wrong place, which does not look
// like a bug in this file.

import {describe, expect, it} from 'vitest';

import {gameViewSize} from '../declaredSizes';
import {VIEWPORT_HEIGHT, VIEWPORT_WIDTH} from '../viewport';

describe('the window a game is seen through', () => {
  const SCREEN = {w: VIEWPORT_WIDTH, h: VIEWPORT_HEIGHT};

  it('is the Main Screen’s size, in the engine’s tiles', () => {
    expect(
      gameViewSize(JSON.stringify({size: {width: 26, height: 16}})),
    ).toEqual({w: 832, h: 512});
  });

  it('is the standard one when the screen says nothing, or there is none', () => {
    expect(gameViewSize(JSON.stringify({type: 'map'}))).toEqual(SCREEN);
    expect(gameViewSize(undefined)).toEqual(SCREEN);
  });
});
