// Measuring a PNG without decoding it.
//
// The Blockly side has no pixels — its dropdowns are built from the flattened
// project — but it has to know how many cells a spritesheet holds. A PNG says
// its size in its own first bytes, so this reads them.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {STOCK_IMAGES} from '../../appearance/stockImages';
import {pngSize, projectImageSizes} from '../imageSize';

describe('pngSize', () => {
  it('reads the size the library’s own drawings declare', () => {
    // The stock sprites are 32×32 and the strips are six of them in a row
    // (scripts/generate-sprites.mjs) — measured here without a canvas.
    expect(pngSize(STOCK_IMAGES.player)).toEqual({width: 32, height: 32});
    expect(pngSize(STOCK_IMAGES.coinSpin)).toEqual({width: 192, height: 32});
    expect(pngSize(STOCK_IMAGES.playerWalk)).toEqual({width: 128, height: 32});
  });

  it('measures nothing it cannot vouch for', () => {
    expect(pngSize(undefined)).toBeUndefined();
    // An asset served from the backend: a URL, not bytes.
    expect(pngSize('/v3/assets/abc/def.png')).toBeUndefined();
    // The right prefix over something that is not a PNG.
    expect(
      pngSize('data:image/png;base64,bm90IGEgcG5nIGF0IGFsbA=='),
    ).toBeUndefined();
    expect(pngSize('data:image/png;base64,!!!not base64!!!')).toBeUndefined();
  });
});

describe('projectImageSizes', () => {
  it('measures the images a project carries', () => {
    const source: MultiFileSource = {
      files: {
        a: {
          id: 'a',
          name: 'coinSpin.png',
          language: 'png',
          contents: '',
          folderId: 'sprites',
          url: STOCK_IMAGES.coinSpin,
        },
        b: {
          id: 'b',
          name: 'uploaded.png',
          language: 'png',
          contents: '',
          folderId: 'sprites',
          url: '/v3/assets/channel/uploaded.png',
        },
        c: {
          id: 'c',
          name: 'main.world',
          language: 'world',
          contents: '{}',
          folderId: 'worlds',
        },
      },
      folders: {},
      openFiles: [],
    };

    // The uploaded one has no entry rather than a guessed one: a caller that
    // needs a size treats it as a single picture.
    expect(projectImageSizes(source)).toEqual({
      'coinSpin.png': {width: 192, height: 32},
    });
  });

  it('is empty for no project', () => {
    expect(projectImageSizes(undefined)).toEqual({});
  });
});
