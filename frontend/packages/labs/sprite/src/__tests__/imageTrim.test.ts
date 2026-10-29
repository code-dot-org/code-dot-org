import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {
  animationNames,
  filterAnimationsToNames,
  findOpaqueBounds,
  getImageThumbnail,
  loadedAnimations,
  trimAnimationListImages,
} from '../imageTrim';
import type {RuntimeAnimationList} from '../types';

// Fixtures name only the props a test reads.
const asList = (list: unknown) => list as RuntimeAnimationList;

// Build RGBA data for a w x h image from a rows array of 0/1 (1 = opaque).
function rgba(rows: number[][]) {
  const h = rows.length;
  const w = rows[0].length;
  const data = new Uint8ClampedArray(w * h * 4);
  rows.forEach((row, y) =>
    row.forEach((on, x) => {
      data[(y * w + x) * 4 + 3] = on ? 255 : 0;
    }),
  );
  return {data, w, h};
}

describe('SpriteLab2 findOpaqueBounds', () => {
  it('finds the tight box around content with transparent borders', () => {
    const {data, w, h} = rgba([
      [0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ]);
    expect(findOpaqueBounds(data, w, h)).toEqual({
      left: 1,
      top: 1,
      right: 3,
      bottom: 2,
    });
  });

  it('returns the full box for full-bleed content', () => {
    const {data, w, h} = rgba([
      [1, 1],
      [1, 1],
    ]);
    expect(findOpaqueBounds(data, w, h)).toEqual({
      left: 0,
      top: 0,
      right: 1,
      bottom: 1,
    });
  });

  it('returns null for a fully transparent image', () => {
    const {data, w, h} = rgba([
      [0, 0],
      [0, 0],
    ]);
    expect(findOpaqueBounds(data, w, h)).toBeNull();
  });

  it('ignores near-invisible pixels below the alpha threshold', () => {
    const {data, w, h} = rgba([
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ]);
    // A faint pixel in the corner shouldn't defeat the trim.
    data[3] = 5; // (0,0) alpha
    expect(findOpaqueBounds(data, w, h)).toEqual({
      left: 1,
      top: 1,
      right: 1,
      bottom: 1,
    });
  });
});

describe('SpriteLab2 loadedAnimations', () => {
  const list = asList({
    orderedKeys: ['a', 'b', 'c'],
    propsByKey: {
      a: {name: 'cat', dataURI: 'data:image/png;base64,AAAA'},
      b: {name: 'dog'},
      c: {name: 'owl', dataURI: 'data:image/png;base64,BBBB'},
    },
  });

  it('keeps only the images whose data has arrived, in order', () => {
    const loaded = loadedAnimations(list);
    expect(loaded.orderedKeys).toEqual(['a', 'c']);
    expect(Object.keys(loaded.propsByKey)).toEqual(['a', 'c']);
    expect(loaded.propsByKey.a).toBe(list.propsByKey.a);
  });

  it('leaves the given list untouched', () => {
    loadedAnimations(list);
    expect(list.orderedKeys).toEqual(['a', 'b', 'c']);
  });

  it('handles an empty list', () => {
    expect(loadedAnimations({orderedKeys: [], propsByKey: {}})).toEqual({
      orderedKeys: [],
      propsByKey: {},
    });
  });
});

describe('SpriteLab2 trimAnimationListImages save-time flag', () => {
  // jsdom's Image never fires load or error, hanging the thumbnail step;
  // an immediate error takes its browser fallback (the source passes
  // through).
  let realImage: typeof Image;
  beforeEach(() => {
    realImage = global.Image;
    global.Image = class {
      onerror: (() => void) | null = null;
      set src(_value: string) {
        setTimeout(() => this.onerror?.(), 0);
      }
    } as unknown as typeof Image;
  });
  afterEach(() => {
    global.Image = realImage;
  });

  it('a trimmed-at-save single passes through untouched', async () => {
    const dataURI = 'data:image/png;base64,already-cropped';
    const list = asList({
      orderedKeys: ['a'],
      propsByKey: {
        a: {name: 'wizard', dataURI, trimmed: true, frameCount: 1},
      },
    });
    const out = await trimAnimationListImages(list);
    expect(out.propsByKey.a.dataURI).toBe(dataURI);
    expect(getImageThumbnail('wizard')).toBe(dataURI);
  });
});

describe('SpriteLab2 filterAnimationsToNames', () => {
  const list = asList({
    orderedKeys: ['a', 'b', 'c', 'd'],
    propsByKey: {
      a: {name: 'wizard', dataURI: 'x'},
      b: {name: 'unused', dataURI: 'x'},
      c: {name: 'forest', dataURI: 'x', categories: ['backgrounds']},
      d: {name: 'stone', dataURI: 'x'},
    },
  });

  it('keeps the named animations, in list order', () => {
    const out = filterAnimationsToNames(list, new Set(['stone', 'wizard']));
    expect(out.orderedKeys).toEqual(['a', 'd']);
  });

  it('scopes backgrounds like any other image', () => {
    expect(filterAnimationsToNames(list, new Set()).orderedKeys).toEqual([]);
    expect(
      filterAnimationsToNames(list, new Set(['forest'])).orderedKeys,
    ).toEqual(['c']);
  });

  it('leaves the given list untouched', () => {
    filterAnimationsToNames(list, new Set(['wizard']));
    expect(list.orderedKeys).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('SpriteLab2 animationNames', () => {
  it('collects every named animation', () => {
    expect([
      ...animationNames(
        asList({
          orderedKeys: ['a', 'b'],
          propsByKey: {a: {name: 'x'}, b: {}},
        }),
      ),
    ]).toEqual(['x']);
  });
});
