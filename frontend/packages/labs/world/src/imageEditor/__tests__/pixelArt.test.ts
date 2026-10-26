// Finding the pixel grid in a picture of pixel art, which had no tests.
//
// The problem the module solves: an image DEPICTS pixel art at a higher
// resolution — a generator asked for 32×32 hands back 352×352, where one art
// pixel is an 11-pixel block with slightly smudged borders. To edit it as
// pixel art the editor has to find that block size, sample each block once,
// and get the 32×32 back.
//
// That round trip is the module's whole purpose and is the test at the
// bottom of this file. The rest are the claims the detector's own comments
// make, and the reason the module resisted testing for so long is not that
// it is hard — it is pure, and says so — but that nobody wrote a raster.

import {describe, expect, it} from 'vitest';

import {
  assumePixelGrid,
  crispScaleFor,
  detectPixelGrid,
  downsampleToGrid,
  upscaleNearest,
} from '../pixelArt';
import type {Raster, RGBA} from '../tools';

/** A raster of `w`×`h`, each pixel from `color(x, y)`. */
const raster = (
  w: number,
  h: number,
  color: (x: number, y: number) => RGBA,
): Raster => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      data.set(color(x, y), (y * w + x) * 4);
    }
  }
  return {width: w, height: h, data};
};

/** A color that is very different from its neighbors in both directions. */
const checker =
  (block: number) =>
  (x: number, y: number): RGBA => {
    const cx = Math.floor(x / block);
    const cy = Math.floor(y / block);
    return (cx + cy) % 2 === 0 ? [230, 40, 60, 255] : [20, 60, 220, 255];
  };

const colorAt = (r: Raster, x: number, y: number): number[] => {
  const i = (y * r.width + x) * 4;
  return [...r.data.slice(i, i + 4)];
};

describe('detectPixelGrid', () => {
  it('finds the block size of an image drawn in blocks', () => {
    // Eleven, because that is what the module was written for and because it
    // is the size that proves the search is doing something: a grid of 8
    // would also be explained by a grid of 4, so a detector that liked small
    // blocks could pass on one and fail here.
    const grid = detectPixelGrid(raster(88, 88, checker(11)));
    expect(grid).not.toBeNull();
    expect(grid!.sizeX).toBe(11);
    expect(grid!.sizeY).toBe(11);
    expect(grid!.offsetX).toBe(0);
    expect(grid!.confidence).toBeGreaterThan(0.6);
  });

  it('finds a grid that does not start at the image edge', () => {
    // A crop takes the first block's left edge with it, so the first cell is
    // a partial one and every grid line after it is offset.
    const shifted = raster(88, 88, (x, y) => checker(11)(x + 4, y + 4));
    const grid = detectPixelGrid(shifted);
    expect(grid).not.toBeNull();
    expect(grid!.sizeX).toBe(11);
    // The grid lines fall at 7, 18, 29 … so the offset is 7 — but only to
    // within a pixel, and deliberately: an edge within `EDGE_TOLERANCE` of a
    // grid line counts as aligned, because diffusion output smudges block
    // borders. Offsets of 6, 7 and 8 all explain these edges equally well and
    // the search keeps the first it meets. `cellBounds` is what cleans up
    // after that, merging the sliver cell a near-miss leaves at the edge.
    expect(Math.abs(grid!.offsetX - 7)).toBeLessThanOrEqual(1);
  });

  it('refuses an image too small for a grid to mean anything', () => {
    // Under four blocks across there is nothing to be confident about.
    expect(detectPixelGrid(raster(12, 12, checker(4)))).toBeNull();
  });

  it('refuses a smooth image, which has no edges to align to', () => {
    // A gradient: every step is one unit, far below the edge threshold, so
    // the histogram is empty and no grid explains it.
    const smooth = raster(96, 96, (x, y) => [x, y, 128, 255]);
    expect(detectPixelGrid(smooth)).toBeNull();
  });

  it('refuses a plain field, which has no structure at all', () => {
    expect(detectPixelGrid(raster(96, 96, () => [10, 20, 30, 255]))).toBeNull();
  });

  it('refuses stripes, whose two axes disagree about the size', () => {
    // Art pixels are square-ish. Vertical bars every 8 with nothing across
    // give one axis a grid and the other none, which is structure rather
    // than a grid — and the guard is what stops the editor "finding" one in
    // a picket fence.
    const stripes = raster(96, 96, x =>
      Math.floor(x / 8) % 2 === 0 ? [230, 40, 60, 255] : [20, 60, 220, 255],
    );
    expect(detectPixelGrid(stripes)).toBeNull();
  });
});

describe('assumePixelGrid', () => {
  it('is the strict answer when there is one', () => {
    const grid = assumePixelGrid(raster(88, 88, checker(11)), 32);
    expect(grid.sizeX).toBe(11);
    expect(grid.confidence).toBeGreaterThan(0.6);
  });

  it('falls back to the size the caller asked for, rather than nothing', () => {
    // The user said this is pixel art; the style choice is the classifier, so
    // there is no answer of "no". A smooth image gets the block size the
    // generation prompt asked for and a confidence of zero saying as much.
    const grid = assumePixelGrid(
      raster(96, 96, (x, y) => [x, y, 128, 255]),
      12,
    );
    expect(grid.sizeX).toBe(12);
    expect(grid.sizeY).toBe(12);
    expect(grid.confidence).toBe(0);
  });

  it('squares up an image only one axis is sure about', () => {
    // Art pixels are square, so the stronger axis lends its size to the
    // other — where `detectPixelGrid` would rather say nothing.
    const stripes = raster(96, 96, x =>
      Math.floor(x / 8) % 2 === 0 ? [230, 40, 60, 255] : [20, 60, 220, 255],
    );
    const grid = assumePixelGrid(stripes, 32);
    expect(grid.sizeX).toBe(grid.sizeY);
    expect(grid.sizeX).not.toBe(32); // it found something, not the fallback
  });
});

describe('upscaleNearest', () => {
  it('turns each pixel into a square of them', () => {
    const one = raster(2, 2, (x, y) => [x * 100, y * 100, 0, 255]);
    const big = upscaleNearest(one, 3);

    expect(big.width).toBe(6);
    expect(big.height).toBe(6);
    // The whole 3×3 block carries its source pixel's color, corner to corner.
    expect(colorAt(big, 0, 0)).toEqual([0, 0, 0, 255]);
    expect(colorAt(big, 2, 2)).toEqual([0, 0, 0, 255]);
    expect(colorAt(big, 3, 0)).toEqual([100, 0, 0, 255]);
    expect(colorAt(big, 5, 5)).toEqual([100, 100, 0, 255]);
  });

  it('is the identity at a factor of one', () => {
    const one = raster(3, 3, (x, y) => [x, y, 0, 255]);
    expect([...upscaleNearest(one, 1).data]).toEqual([...one.data]);
  });
});

describe('downsampleToGrid', () => {
  it('samples the center of each cell, not its border', () => {
    // Borders smudge in generated output, so the center is the one point
    // that is reliably the block's own color. Here the border is painted a
    // color that appears nowhere else: if it were sampled, it would show.
    const block = 10;
    const art = raster(30, 30, (x, y) => {
      const onEdge = x % block === 0 || y % block === 0;
      if (onEdge) {
        return [1, 2, 3, 255];
      }
      return [(Math.floor(x / block) + 1) * 50, 0, 0, 255];
    });
    const small = downsampleToGrid(art, {
      sizeX: block,
      sizeY: block,
      offsetX: 0,
      offsetY: 0,
      confidence: 1,
    });

    expect(small.width).toBe(3);
    expect(small.height).toBe(3);
    expect(colorAt(small, 0, 0)).toEqual([50, 0, 0, 255]);
    expect(colorAt(small, 2, 2)).toEqual([150, 0, 0, 255]);
  });
});

describe('crispScaleFor', () => {
  it('aims at about 640 pixels on the long side', () => {
    expect(crispScaleFor(64, 64)).toBe(8); // 640/64 = 10, capped
    expect(crispScaleFor(128, 128)).toBe(5);
    expect(crispScaleFor(200, 100)).toBe(3); // the LONG side decides
  });

  it('never shrinks, and never blows an asset up past eight', () => {
    expect(crispScaleFor(1000, 1000)).toBe(1);
    expect(crispScaleFor(8, 8)).toBe(8);
  });
});

describe('the round trip', () => {
  it('recovers the art a generated image was depicting', () => {
    // WHAT THE MODULE IS FOR, end to end. Eight-by-eight art, drawn by a
    // generator at eleven pixels a block: detect the block size, sample each
    // block, and the original comes back exactly.
    // Neighbouring art pixels have to differ by more than `EDGE_THRESHOLD`
    // (90, summed across channels) or there is no edge to find — which is the
    // detector's whole premise, and the reason a smooth image gets no grid.
    const logical = raster(8, 8, (x, y) => [
      x % 2 ? 240 : 15,
      y % 2 ? 30 : 210,
      ((x + y) % 4) * 60,
      255,
    ]);
    const depicted = upscaleNearest(logical, 11);

    const grid = detectPixelGrid(depicted);
    expect(grid).not.toBeNull();
    expect(grid!.sizeX).toBe(11);

    const recovered = downsampleToGrid(depicted, grid!);
    expect(recovered.width).toBe(8);
    expect(recovered.height).toBe(8);
    expect([...recovered.data]).toEqual([...logical.data]);
  });
});
