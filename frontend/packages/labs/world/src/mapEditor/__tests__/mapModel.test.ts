// How big a map is, and what it reads as when it does not say.
//
// A map used to be exactly the viewport — ten tiles each way, because that was
// the only size anything had. It carries its own now, which makes two things
// worth pinning: an old `.map` still opens at the size it was written for, and
// a number that came out of a text field cannot make a grid the canvas will
// hang on.

import {describe, expect, it} from 'vitest';

import {TILE_SIZE, VIEWPORT_TILES} from '../../runtime/viewport';
import {
  clampTiles,
  extentOf,
  MAX_MAP_TILES,
  MIN_MAP_TILES,
  parseMap,
  type MapDoc,
} from '../mapModel';

const doc = (map: Partial<MapDoc>): string =>
  JSON.stringify({type: 'map', ...map});

describe('parseMap', () => {
  it('reads the size a map states', () => {
    const map = parseMap(doc({size: {width: 20, height: 12}, actors: []}));

    expect(map.size).toEqual({width: 20, height: 12});
  });

  it('gives a map that says nothing the size every map used to be', () => {
    // The compatibility case, and the one that matters most: every `.map`
    // written before this field existed has to open unchanged.
    const map = parseMap(doc({actors: []}));

    expect(map.size).toEqual({
      width: VIEWPORT_TILES,
      height: VIEWPORT_TILES,
    });
  });

  it('gives an empty or unparseable document that size too', () => {
    expect(parseMap('').size.width).toBe(VIEWPORT_TILES);
    expect(parseMap('{oh no').size.height).toBe(VIEWPORT_TILES);
  });

  it('does not take a size the canvas could not draw', () => {
    // A hand-edited file, or a pasted number. `NaN` tiles is a grid loop that
    // never terminates, and 100000 is one that takes the tab with it.
    expect(parseMap(doc({size: {width: 0, height: -4}})).size).toEqual({
      width: MIN_MAP_TILES,
      height: MIN_MAP_TILES,
    });
    expect(parseMap(doc({size: {width: 1e6, height: 1e6}})).size).toEqual({
      width: MAX_MAP_TILES,
      height: MAX_MAP_TILES,
    });
    expect(
      parseMap('{"type":"map","size":{"width":"wide","height":8}}').size,
    ).toEqual({width: VIEWPORT_TILES, height: 8});
  });

  it('keeps the size through a round trip', () => {
    // What the editor does on every commit: stringify, and parse back when the
    // file is reopened.
    const map = parseMap(doc({size: {width: 3, height: 25}, actors: []}));

    expect(parseMap(JSON.stringify(map)).size).toEqual({width: 3, height: 25});
  });
});

describe('clampTiles', () => {
  it('is undefined for what is not a number yet', () => {
    // An emptied field mid-edit. Distinct from a bad number, because the caller
    // leaves the map alone rather than resizing it to 1.
    expect(clampTiles('')).toBeUndefined();
    expect(clampTiles('   ')).toBeUndefined();
    expect(clampTiles('abc')).toBeUndefined();
  });

  it('is a whole number in range', () => {
    expect(clampTiles('12')).toBe(12);
    expect(clampTiles(7.9)).toBe(7);
    expect(clampTiles(0)).toBe(MIN_MAP_TILES);
    expect(clampTiles(MAX_MAP_TILES + 1)).toBe(MAX_MAP_TILES);
  });
});

describe('extentOf', () => {
  it('is the tile count times the tile size, in world pixels', () => {
    // What the camera fits and the canvas draws the border at.
    const map = parseMap(doc({size: {width: 20, height: 12}}));

    expect(extentOf(map)).toEqual({
      w: 20 * TILE_SIZE,
      h: 12 * TILE_SIZE,
    });
  });

  it('is the viewport for a map that never said otherwise', () => {
    expect(extentOf(parseMap(''))).toEqual({
      w: VIEWPORT_TILES * TILE_SIZE,
      h: VIEWPORT_TILES * TILE_SIZE,
    });
  });
});
