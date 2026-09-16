jest.mock('@cdo/apps/pixelEditor/pixelArt', () => ({
  ...jest.requireActual('@cdo/apps/pixelEditor/pixelArt'),
  // The 64px fixture decodes to 64x64; factorFor is the real crispScaleFor.
  upscaleImageNearest: jest.fn((source, factorFor) => {
    const factor = factorFor(64, 64);
    return Promise.resolve({dataURI: `${source}@${factor}x`, factor});
  }),
}));

import {
  animationNames,
  filterAnimationsToNames,
  findOpaqueBounds,
  getImageThumbnail,
  loadedAnimations,
  scaleAnimationGeometry,
  trimAnimationListImages,
} from '@cdo/apps/p5lab/spritelab/lab2/imageTrim';
import {upscaleImageNearest} from '@cdo/apps/pixelEditor/pixelArt';

// Build RGBA data for a w x h image from a rows array of 0/1 (1 = opaque).
function rgba(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const data = new Uint8ClampedArray(w * h * 4);
  rows.forEach((row, y) =>
    row.forEach((on, x) => {
      data[(y * w + x) * 4 + 3] = on ? 255 : 0;
    })
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
  const list = {
    orderedKeys: ['a', 'b', 'c'],
    propsByKey: {
      a: {name: 'cat', dataURI: 'data:image/png;base64,AAAA'},
      b: {name: 'dog'},
      c: {name: 'owl', dataURI: 'data:image/png;base64,BBBB'},
    },
  };

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
  let realImage;
  beforeEach(() => {
    realImage = global.Image;
    global.Image = class {
      set src(value) {
        setTimeout(() => this.onerror && this.onerror(), 0);
      }
    };
  });
  afterEach(() => {
    global.Image = realImage;
  });

  it('a trimmed-at-save single passes through untouched', async () => {
    const dataURI = 'data:image/png;base64,already-cropped';
    const list = {
      orderedKeys: ['a'],
      propsByKey: {
        a: {name: 'wizard', dataURI, trimmed: true, frameCount: 1},
      },
    };
    const out = await trimAnimationListImages(list);
    expect(out.propsByKey.a.dataURI).toBe(dataURI);
    expect(getImageThumbnail('wizard')).toBe(dataURI);
  });
});

describe('SpriteLab2 filterAnimationsToNames', () => {
  const list = {
    orderedKeys: ['a', 'b', 'c', 'd'],
    propsByKey: {
      a: {name: 'wizard', dataURI: 'x'},
      b: {name: 'unused', dataURI: 'x'},
      c: {name: 'forest', dataURI: 'x', categories: ['backgrounds']},
      d: {name: 'stone', dataURI: 'x'},
    },
  };

  it('keeps the named animations, in list order', () => {
    const out = filterAnimationsToNames(list, new Set(['stone', 'wizard']));
    expect(out.orderedKeys).toEqual(['a', 'd']);
  });

  it('scopes backgrounds like any other image', () => {
    expect(filterAnimationsToNames(list, new Set()).orderedKeys).toEqual([]);
    expect(
      filterAnimationsToNames(list, new Set(['forest'])).orderedKeys
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
      ...animationNames({
        orderedKeys: ['a', 'b'],
        propsByKey: {a: {name: 'x'}, b: {}},
      }),
    ]).toEqual(['x']);
  });
});

describe('SpriteLab2 scaleAnimationGeometry', () => {
  it('multiplies every recorded dimension and keeps the rest', () => {
    const props = {
      name: 'hero',
      frameSize: {x: 64, y: 48},
      sourceSize: {x: 256, y: 48},
      frameCount: 4,
    };
    expect(scaleAnimationGeometry(props, 8)).toEqual({
      name: 'hero',
      frameSize: {x: 512, y: 384},
      sourceSize: {x: 2048, y: 384},
      frameCount: 4,
    });
  });

  it('leaves props without dimensions alone', () => {
    expect(scaleAnimationGeometry({name: 'bg'}, 5)).toEqual({name: 'bg'});
  });
});

describe('SpriteLab2 trimAnimationListImages native pixel art', () => {
  // A 64px sprite stored at its logical size; crispScaleFor(64, 64) is 8.
  const native = {
    orderedKeys: ['k'],
    propsByKey: {
      k: {
        name: 'hero',
        categories: [],
        dataURI: 'data:native',
        frameSize: {x: 64, y: 64},
        sourceSize: {x: 64, y: 64},
        frameCount: 1,
        pixelGridSize: 1,
        trimmed: true,
      },
    },
  };

  // jsdom's Image never fires load or error (see the save-time flag tests).
  let realImage;
  beforeEach(() => {
    upscaleImageNearest.mockClear();
    realImage = global.Image;
    global.Image = class {
      set src(value) {
        setTimeout(() => this.onerror && this.onerror(), 0);
      }
    };
  });
  afterEach(() => {
    global.Image = realImage;
  });

  it('upscales a grid-1 image for the engine, geometry included', async () => {
    const out = await trimAnimationListImages(native, undefined, {
      forEngine: true,
    });
    expect(upscaleImageNearest).toHaveBeenCalledWith(
      'data:native',
      expect.any(Function)
    );
    expect(out.propsByKey.k.dataURI).toBe('data:native@8x');
    expect(out.propsByKey.k.frameSize).toEqual({x: 512, y: 512});
    expect(out.propsByKey.k.sourceSize).toEqual({x: 512, y: 512});
  });

  it('leaves the thumbnail pass at native size', async () => {
    const out = await trimAnimationListImages(native);
    expect(upscaleImageNearest).not.toHaveBeenCalled();
    expect(out.propsByKey.k.dataURI).toBe('data:native');
    expect(out.propsByKey.k.frameSize).toEqual({x: 64, y: 64});
  });

  it('leaves an asset stored upscaled alone', async () => {
    const stored = {
      orderedKeys: ['k'],
      propsByKey: {
        k: {
          ...native.propsByKey.k,
          pixelGridSize: 8,
          frameSize: {x: 512, y: 512},
        },
      },
    };
    const out = await trimAnimationListImages(stored, undefined, {
      forEngine: true,
    });
    expect(upscaleImageNearest).not.toHaveBeenCalled();
    expect(out.propsByKey.k.dataURI).toBe('data:native');
    expect(out.propsByKey.k.frameSize).toEqual({x: 512, y: 512});
  });
});
