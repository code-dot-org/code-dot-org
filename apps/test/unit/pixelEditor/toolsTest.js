import {
  drawCircle,
  floodFill,
  stamp,
  stampLine,
} from '@cdo/apps/pixelEditor/tools';

// A blank raster (transparent black), like a fresh ImageData.
function makeRaster(width, height) {
  return {width, height, data: new Uint8ClampedArray(width * height * 4)};
}

function pixel(raster, x, y) {
  const i = (y * raster.width + x) * 4;
  return [
    raster.data[i],
    raster.data[i + 1],
    raster.data[i + 2],
    raster.data[i + 3],
  ];
}

function countOpaque(raster) {
  let count = 0;
  for (let i = 3; i < raster.data.length; i += 4) {
    if (raster.data[i] > 0) {
      count++;
    }
  }
  return count;
}

const RED = [255, 0, 0, 255];
const BLUE = [0, 0, 255, 255];

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
