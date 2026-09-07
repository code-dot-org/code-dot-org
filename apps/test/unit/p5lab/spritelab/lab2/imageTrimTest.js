import {
  boundedGet,
  boundedSet,
  findOpaqueBounds,
  loadedAnimations,
} from '@cdo/apps/p5lab/spritelab/lab2/imageTrim';

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

describe('SpriteLab2 bounded trim caches', () => {
  it('evicts the oldest entry past the limit', () => {
    const map = new Map();
    boundedSet(map, 'a', 1, 2);
    boundedSet(map, 'b', 2, 2);
    boundedSet(map, 'c', 3, 2);
    expect([...map.keys()]).toEqual(['b', 'c']);
  });

  it('a read refreshes recency, protecting the entry from eviction', () => {
    const map = new Map();
    boundedSet(map, 'a', 1, 2);
    boundedSet(map, 'b', 2, 2);
    expect(boundedGet(map, 'a')).toBe(1);
    boundedSet(map, 'c', 3, 2);
    expect([...map.keys()]).toEqual(['a', 'c']);
  });

  it('misses return undefined without disturbing the map', () => {
    const map = new Map();
    boundedSet(map, 'a', 1, 2);
    expect(boundedGet(map, 'missing')).toBeUndefined();
    expect([...map.keys()]).toEqual(['a']);
  });
});

describe('SpriteLab2 boundedSet overwrite', () => {
  it('overwriting an existing key at the limit evicts nothing', () => {
    const map = new Map();
    boundedSet(map, 'a', 1, 2);
    boundedSet(map, 'b', 2, 2);
    boundedSet(map, 'a', 9, 2);
    expect([...map.entries()]).toEqual([
      ['a', 9],
      ['b', 2],
    ]);
  });
});
