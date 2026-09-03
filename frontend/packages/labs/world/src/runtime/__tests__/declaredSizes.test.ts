// What a `.world` file says about its own size.
//
// The tutor is told these numbers and the map editor draws a guide from them,
// so a reader that quietly returns the wrong one puts a wall half a tile out of
// true in one place and a dashed rectangle in the wrong place in the other.
// Neither looks like a bug in this file.

import {describe, expect, it} from 'vitest';

import {
  agreedViewSize,
  declaredMapSize,
  declaredViewSize,
  mapSizeOf,
  viewSizeOf,
} from '../declaredSizes';
import {VIEWPORT_HEIGHT, VIEWPORT_TILES, VIEWPORT_WIDTH} from '../viewport';

/** A world workspace that sets how big the level is. */
const sized = (columns: number, rows: number) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'My World'},
          next: {
            block: {
              type: 'world_set_map_size',
              inputs: {
                X: {block: {type: 'math_number', fields: {NUM: columns}}},
                Y: {block: {type: 'math_number', fields: {NUM: rows}}},
              },
            },
          },
        },
      ],
    },
  });

const bare = JSON.stringify({
  blocks: {blocks: [{type: 'world_world', fields: {NAME: 'My World'}}]},
});

/** …and one that sets how much of it is on screen. */
const seeing = (columns: number, rows: number) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'My World'},
          next: {
            block: {
              type: 'world_set_view_size',
              inputs: {
                X: {block: {type: 'math_number', fields: {NUM: columns}}},
                Y: {block: {type: 'math_number', fields: {NUM: rows}}},
              },
            },
          },
        },
      ],
    },
  });

describe('declaredMapSize', () => {
  it('reads a size the world sets, however deep the block sits', () => {
    expect(declaredMapSize(sized(20, 12))).toEqual({
      columns: 20,
      rows: 12,
      declared: true,
    });
  });

  it('is undefined when the world sets none', () => {
    expect(declaredMapSize(bare)).toBeUndefined();
  });

  it('is undefined when the size is computed rather than typed', () => {
    // A size that is an expression is a size this cannot state, and saying
    // nothing is better than saying something wrong.
    const computed = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_set_map_size',
            inputs: {
              X: {block: {type: 'math_arithmetic'}},
              Y: {block: {type: 'math_number', fields: {NUM: 10}}},
            },
          },
        ],
      },
    });

    expect(declaredMapSize(computed)).toBeUndefined();
  });

  it('says nothing about a world that does not parse', () => {
    expect(declaredMapSize('not json')).toBeUndefined();
  });

  it('clamps to what the editor would clamp to', () => {
    expect(declaredMapSize(sized(999, 0.4))?.columns).toBe(64);
    expect(declaredMapSize(sized(999, 0.4))?.rows).toBe(1);
  });
});

describe('mapSizeOf', () => {
  it('falls back to one screen, which is what the editor draws', () => {
    expect(mapSizeOf(bare)).toEqual({
      columns: VIEWPORT_TILES,
      rows: VIEWPORT_TILES,
      declared: false,
    });
  });
});

describe('declaredViewSize', () => {
  it('reads the view the world sets', () => {
    expect(declaredViewSize(seeing(26, 16))).toEqual({
      columns: 26,
      rows: 16,
      declared: true,
    });
  });

  it('does not read the map size as the view', () => {
    // The two blocks mean different things, and the reader is one function
    // told which type to look for — so this is the check that it is being told
    // the right one.
    expect(declaredViewSize(sized(20, 12))).toBeUndefined();
    expect(declaredMapSize(seeing(26, 16))).toBeUndefined();
  });

  it('does not read the map size as the view', () => {
    // The two blocks mean different things, and the reader is one function
    // told which type to look for — so this is the check that it is being told
    // the right one.
    expect(declaredViewSize(sized(20, 12))).toBeUndefined();
    expect(declaredMapSize(seeing(26, 16))).toBeUndefined();
  });
});

describe('mapSizeOf', () => {
  it('falls back to one screen, which is what the editor draws', () => {
    expect(mapSizeOf(bare)).toEqual({
      columns: VIEWPORT_TILES,
      rows: VIEWPORT_TILES,
      declared: false,
    });
  });
});

describe('viewSizeOf', () => {
  it('falls back to one screen too, which is what every world had', () => {
    expect(viewSizeOf(bare)).toEqual({
      columns: VIEWPORT_TILES,
      rows: VIEWPORT_TILES,
      declared: false,
    });
  });
});

describe('the window a project agrees on', () => {
  const SCREEN = {w: VIEWPORT_WIDTH, h: VIEWPORT_HEIGHT};

  it('is the one every world that states a view states', () => {
    expect(agreedViewSize([seeing(26, 16), bare, seeing(26, 16)])).toEqual({
      w: 832,
      h: 512,
    });
  });

  it('is the standard one when nobody says', () => {
    expect(agreedViewSize([bare, sized(30, 20)])).toEqual(SCREEN);
  });

  it('is the standard one when the worlds disagree', () => {
    // The guide is a promise about what the player will see. Two worlds with
    // different windows make it a promise about neither, and a dashed
    // rectangle that could mean either is worse than the default.
    expect(agreedViewSize([seeing(26, 16), seeing(20, 20)])).toEqual(SCREEN);
  });

  it('is the standard one for a project with no worlds at all', () => {
    expect(agreedViewSize([])).toEqual(SCREEN);
  });
});
