// Fitting a picture to a tile.
//
// The one number behind everything in `specs/ACTOR_SIZE.md`, and the reason
// the change is safe: it is exactly 1 for everything the library ships, so a
// project made of stock parts cannot tell this was done.

import {describe, expect, it} from 'vitest';

import {TILE_SIZE, fitToTile} from '../viewport';

describe('fitting a picture to a tile', () => {
  it('leaves everything the library ships exactly alone', () => {
    // Every stock sprite is 32 by 32 and the tile is 32, so nothing moves.
    expect(fitToTile(TILE_SIZE, TILE_SIZE)).toBe(1);
  });

  it('shrinks a big picture until its longest side is one tile', () => {
    expect(fitToTile(256, 256)).toBe(TILE_SIZE / 256);
    expect(256 * fitToTile(256, 256)).toBe(TILE_SIZE);
  });

  it('keeps the shape, measuring by the longest side', () => {
    // A 256 by 128 picture is a tile across and half a tile down, which is the
    // shape it is — not a square.
    const fit = fitToTile(256, 128);

    expect(256 * fit).toBe(TILE_SIZE);
    expect(128 * fit).toBe(TILE_SIZE / 2);
  });

  it('measures a tall picture by its height', () => {
    const fit = fitToTile(128, 256);

    expect(256 * fit).toBe(TILE_SIZE);
    expect(128 * fit).toBe(TILE_SIZE / 2);
  });

  it('does not blow a small picture up', () => {
    // A 16-pixel sprite was drawn small on purpose, and filling a tile with it
    // would be this change inventing a size nobody asked for.
    expect(fitToTile(16, 16)).toBe(1);
    expect(fitToTile(8, 4)).toBe(1);
  });

  it('answers 1 for a picture nobody measured', () => {
    // Zero is what an unmeasured picture reports, and the only honest answer
    // to "how much smaller than a tile is nothing".
    expect(fitToTile(0, 0)).toBe(1);
  });
});
