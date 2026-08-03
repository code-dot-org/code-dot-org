// Naming one cell of a spritesheet from a block.
//
// The field stores an index (`coinSpin.png#3`) and the RECTANGLE is worked out
// here, in the editor — the engine is never told about grids. So what is tested
// is the resolution: the right rectangle, and no rectangle at all when the
// editor cannot honestly produce one.

import {beforeEach, describe, expect, it} from 'vitest';

import {projectSpriteOptions} from '../projectModules';
import {
  cellCount,
  parseSpriteRef,
  setProjectGrids,
  spriteCell,
} from '../spriteCells';

const SHEET = {type: 'sheet', cell: {width: 32, height: 32}} as const;

beforeEach(() => {
  setProjectGrids(
    {'coinSpin.png': SHEET},
    {
      'coinSpin.png': {width: 192, height: 32},
      'player.png': {width: 32, height: 32},
    },
  );
});

describe('parseSpriteRef', () => {
  it('splits an image from its cell', () => {
    expect(parseSpriteRef('coinSpin.png#3')).toEqual({
      sprite: 'coinSpin.png',
      cell: 3,
    });
    expect(parseSpriteRef('player.png')).toEqual({sprite: 'player.png'});
  });

  it('treats nonsense after the hash as part of no cell', () => {
    expect(parseSpriteRef('player.png#')).toEqual({sprite: 'player.png#'});
    expect(parseSpriteRef('player.png#x')).toEqual({sprite: 'player.png#x'});
    expect(parseSpriteRef('player.png#-1')).toEqual({sprite: 'player.png#-1'});
  });
});

describe('spriteCell', () => {
  it('resolves an index to the rectangle in reading order', () => {
    expect(spriteCell('coinSpin.png#0')).toEqual({
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    });
    expect(spriteCell('coinSpin.png#3')).toEqual({
      x: 96,
      y: 0,
      width: 32,
      height: 32,
    });
  });

  it('is nothing for a whole image', () => {
    expect(spriteCell('player.png')).toBeUndefined();
  });

  it('is nothing when the cell cannot be worked out', () => {
    // Past the end of a grid that has changed since, and an image the editor
    // never measured (one served from the assets backend).
    expect(spriteCell('coinSpin.png#99')).toBeUndefined();
    expect(spriteCell('uploaded.png#1')).toBeUndefined();
  });

  it('follows padding and gap', () => {
    setProjectGrids(
      {
        'padded.png': {
          type: 'sheet',
          cell: {width: 32, height: 32},
          padding: 2,
          gap: 4,
        },
      },
      {'padded.png': {width: 72, height: 36}},
    );

    expect(spriteCell('padded.png#1')).toEqual({
      x: 38,
      y: 2,
      width: 32,
      height: 32,
    });
  });
});

describe('cellCount', () => {
  it('counts a sheet, and nothing else', () => {
    expect(cellCount('coinSpin.png')).toBe(6);
    expect(cellCount('player.png')).toBe(0);
    expect(cellCount('uploaded.png')).toBe(0);
  });
});

describe('the set-sprite dropdown', () => {
  it('offers a spritesheet a cell at a time, and a picture once', () => {
    const options = projectSpriteOptions({}, [
      'coinSpin.png',
      'player.png',
      'uploaded.png',
    ]);

    expect(options).toEqual([
      ['coinSpin 1', 'coinSpin.png#0'],
      ['coinSpin 2', 'coinSpin.png#1'],
      ['coinSpin 3', 'coinSpin.png#2'],
      ['coinSpin 4', 'coinSpin.png#3'],
      ['coinSpin 5', 'coinSpin.png#4'],
      ['coinSpin 6', 'coinSpin.png#5'],
      ['player', 'player.png'],
      // Unmeasured: offered whole rather than guessed at.
      ['uploaded', 'uploaded.png'],
    ]);
  });
});
