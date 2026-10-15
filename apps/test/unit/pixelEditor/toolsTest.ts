import {
  drawCircle,
  drawRect,
  floodFill,
  Raster,
  RGBA,
  stamp,
  stampLine,
  TRANSPARENT,
} from '@cdo/apps/pixelEditor/tools';

// A blank raster (transparent black), like a fresh ImageData.
function makeRaster(width: number, height: number): Raster {
  return {width, height, data: new Uint8ClampedArray(width * height * 4)};
}

function pixel(raster: Raster, x: number, y: number): number[] {
  const i = (y * raster.width + x) * 4;
  return [
    raster.data[i],
    raster.data[i + 1],
    raster.data[i + 2],
    raster.data[i + 3],
  ];
}

function countOpaque(raster: Raster): number {
  let count = 0;
  for (let i = 3; i < raster.data.length; i += 4) {
    if (raster.data[i] > 0) {
      count++;
    }
  }
  return count;
}

const RED: RGBA = [255, 0, 0, 255];
const BLUE: RGBA = [0, 0, 255, 255];

describe('pixelEditor tools', () => {
  describe('stamp', () => {
    it('paints a size x size square', () => {
      const raster = makeRaster(10, 10);
      stamp(raster, 5, 5, 2, RED);
      expect(countOpaque(raster)).toBe(4);
      expect(pixel(raster, 5, 5)).toEqual(RED);
    });

    it('clips at the raster edges without wrapping', () => {
      const raster = makeRaster(10, 10);
      stamp(raster, 0, 0, 4, RED);
      // Only the in-bounds quadrant of the stamp lands.
      expect(countOpaque(raster)).toBe(9);
      expect(pixel(raster, 9, 9)).toEqual([0, 0, 0, 0]);
    });

    it('erases with a null color', () => {
      const raster = makeRaster(4, 4);
      stamp(raster, 1, 1, 4, RED);
      stamp(raster, 1, 1, 2, null);
      expect(pixel(raster, 1, 1)).toEqual([0, 0, 0, 0]);
      expect(pixel(raster, 3, 3)).toEqual(RED);
    });
  });

  describe('stampLine', () => {
    it('leaves no gaps along a diagonal', () => {
      const raster = makeRaster(12, 12);
      stampLine(raster, 0, 0, 11, 11, 1, RED);
      for (let i = 0; i < 12; i++) {
        expect(pixel(raster, i, i)).toEqual(RED);
      }
    });
  });

  describe('floodFill', () => {
    it('fills a bounded region and stops at borders', () => {
      const raster = makeRaster(8, 8);
      // A vertical red wall at x=4 splits the canvas.
      stampLine(raster, 4, 0, 4, 7, 1, RED);
      floodFill(raster, 1, 1, BLUE);
      expect(pixel(raster, 0, 7)).toEqual(BLUE);
      expect(pixel(raster, 4, 3)).toEqual(RED);
      expect(pixel(raster, 6, 3)).toEqual([0, 0, 0, 0]);
    });

    it('is a no-op when the target already matches', () => {
      const raster = makeRaster(4, 4);
      stamp(raster, 1, 1, 4, BLUE);
      const before = raster.data.slice();
      floodFill(raster, 1, 1, BLUE);
      expect(raster.data).toEqual(before);
    });
  });

  describe('drawRect', () => {
    it('solid rectangles fill the interior with hard corners', () => {
      const raster = makeRaster(10, 10);
      drawRect(raster, 2, 3, 7, 6, 1, RED, true);
      expect(pixel(raster, 2, 3)).toEqual(RED); // corner is hard
      expect(pixel(raster, 7, 6)).toEqual(RED);
      expect(pixel(raster, 4, 4)).toEqual(RED);
      expect(countOpaque(raster)).toBe(6 * 4);
    });

    it('outline rectangles leave the interior empty', () => {
      const raster = makeRaster(10, 10);
      drawRect(raster, 1, 1, 8, 8, 1, RED, false);
      expect(pixel(raster, 1, 1)).toEqual(RED);
      expect(pixel(raster, 8, 1)).toEqual(RED);
      expect(pixel(raster, 4, 1)).toEqual(RED);
      expect(pixel(raster, 4, 4)).toEqual([0, 0, 0, 0]);
    });

    it('normalizes corners given in any order', () => {
      const a = makeRaster(10, 10);
      const b = makeRaster(10, 10);
      drawRect(a, 7, 6, 2, 3, 1, RED, true);
      drawRect(b, 2, 3, 7, 6, 1, RED, true);
      expect(a.data).toEqual(b.data);
    });
  });

  describe('floodFill tolerance', () => {
    // A "solid" region with the tiny per-pixel variation AI output carries.
    function noisyRaster(): Raster {
      const raster = makeRaster(6, 6);
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          const i = (y * 6 + x) * 4;
          raster.data[i] = 100 + ((x + y) % 3); // 100..102
          raster.data[i + 1] = 100;
          raster.data[i + 2] = 100;
          raster.data[i + 3] = 255;
        }
      }
      return raster;
    }

    it('fills across small variations within the tolerance', () => {
      const raster = noisyRaster();
      floodFill(raster, 0, 0, RED, 8);
      expect(countOpaque(raster)).toBe(36);
      expect(pixel(raster, 5, 5)).toEqual(RED);
    });

    it('exact matching (tolerance 0) splinters the same region', () => {
      const raster = noisyRaster();
      floodFill(raster, 0, 0, RED, 0);
      const redPixels = [];
      for (let i = 0; i < raster.data.length; i += 4) {
        if (raster.data[i] === RED[0] && raster.data[i + 1] === RED[1]) {
          redPixels.push(i);
        }
      }
      expect(redPixels.length).toBeLessThan(36);
    });

    it('stops at strong edges despite the tolerance', () => {
      const raster = noisyRaster();
      // A hard vertical wall at x=3.
      stampLine(raster, 3, 0, 3, 5, 1, [0, 0, 0, 255]);
      floodFill(raster, 0, 0, RED, 8);
      expect(pixel(raster, 3, 2)).toEqual([0, 0, 0, 255]);
      expect(pixel(raster, 5, 2)).not.toEqual(RED);
    });

    it('terminates when the fill color matches the region', () => {
      const raster = noisyRaster();
      // A fill color inside the region's own tolerance band: without the
      // visited bitmap, painted pixels keep matching and the walk never ends.
      floodFill(raster, 0, 0, [101, 100, 100, 255], 8);
      expect(pixel(raster, 5, 5)).toEqual([101, 100, 100, 255]);
    });
  });

  describe('transparent color', () => {
    it('stamping transparent clears pixels like the eraser', () => {
      const raster = makeRaster(4, 4);
      stamp(raster, 1, 1, 4, RED);
      stamp(raster, 1, 1, 2, TRANSPARENT);
      expect(pixel(raster, 1, 1)).toEqual([0, 0, 0, 0]);
      expect(pixel(raster, 3, 3)).toEqual(RED);
    });

    it('flood-filling with transparent clears the region', () => {
      const raster = makeRaster(4, 4);
      stamp(raster, 1, 1, 4, RED);
      floodFill(raster, 0, 0, TRANSPARENT);
      expect(countOpaque(raster)).toBe(0);
    });

    it('shapes drawn transparent write transparent pixels', () => {
      const raster = makeRaster(10, 10);
      drawRect(raster, 0, 0, 9, 9, 1, RED, true);
      drawRect(raster, 2, 2, 7, 7, 1, TRANSPARENT, true);
      expect(pixel(raster, 4, 4)).toEqual([0, 0, 0, 0]);
      expect(pixel(raster, 0, 0)).toEqual(RED);
    });
  });

  describe('drawCircle', () => {
    it('solid circles fill the interior', () => {
      const raster = makeRaster(21, 21);
      drawCircle(raster, 10, 10, 5, 1, RED, true);
      expect(pixel(raster, 10, 10)).toEqual(RED);
      expect(pixel(raster, 10, 5)).toEqual(RED);
      expect(pixel(raster, 10, 4)).toEqual([0, 0, 0, 0]);
    });

    it('outline circles leave the interior empty', () => {
      const raster = makeRaster(21, 21);
      drawCircle(raster, 10, 10, 6, 1, RED, false);
      expect(pixel(raster, 10, 10)).toEqual([0, 0, 0, 0]);
      expect(pixel(raster, 10, 4)).toEqual(RED);
      expect(pixel(raster, 16, 10)).toEqual(RED);
    });
  });
});
