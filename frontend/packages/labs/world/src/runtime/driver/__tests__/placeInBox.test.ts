// Where a picture goes in a box (specs/ACTORS_AS_DATA_PLAN.md, step 4).

import {describe, expect, it} from 'vitest';

import {placeInBox} from '../paintDrawing';

describe('a picture in a box', () => {
  it('is as large as fits, keeping its shape, centered', () => {
    // A 20 by 10 picture in a 40 by 40 box: twice as large, and centered
    // up and down.
    expect(placeInBox({width: 20, height: 10}, 0, 0, 40, 40, false)).toEqual([
      0, 10, 40, 20,
    ]);
    // …and a tall one in a wide box is centered across, from where the box
    // is.
    expect(placeInBox({width: 10, height: 20}, 5, 5, 40, 20, false)).toEqual([
      20, 5, 10, 20,
    ]);
  });

  it('fills the box when stretched, or when its size is not known', () => {
    expect(placeInBox({width: 20, height: 10}, 1, 2, 40, 40, true)).toEqual([
      1, 2, 40, 40,
    ]);
    expect(placeInBox({width: 0, height: 0}, 1, 2, 40, 40, false)).toEqual([
      1, 2, 40, 40,
    ]);
  });
});
