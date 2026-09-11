import {
  assumePixelGrid,
  crispScaleFor,
  detectPixelGrid,
  downsampleToGrid,
  upscaleNearest,
} from '@cdo/apps/pixelEditor/pixelArt';
import {Raster} from '@cdo/apps/pixelEditor/tools';

type RGB = [number, number, number];

// The caller-supplied fallback for assumePixelGrid (callers pass their
// prompt's block size; the tests just need a fixed value).
const FALLBACK_BLOCK = 16;

// Build a raster depicting logical pixel art: each logical pixel becomes a
// blockSize x blockSize physical block, shifted by the given offset (the
// leading partial block repeats the first row/column, like a crop would).
function blockyRaster(logical: RGB[][], blockSize: number, offset = 0): Raster {
  const lh = logical.length;
  const lw = logical[0].length;
  const width = lw * blockSize + offset;
  const height = lh * blockSize + offset;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ly = Math.min(
        lh - 1,
        Math.floor(Math.max(0, y - offset) / blockSize)
      );
      const lx = Math.min(
        lw - 1,
        Math.floor(Math.max(0, x - offset) / blockSize)
      );
      const [r, g, b] = logical[ly][lx];
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  return {width, height, data};
}

// Three well-separated colors; adjacent palette indices always differ enough
// to register as an edge.
const PALETTE: RGB[] = [
  [200, 40, 40],
  [40, 160, 60],
  [40, 60, 200],
];

// An 8x8 logical pattern where every pair of adjacent pixels (both axes)
// differs: index changes by 1 mod 3 horizontally and 2 mod 3 vertically,
// so every grid line produces a color edge.
function samplePattern(): RGB[][] {
  const rows: RGB[][] = [];
  for (let y = 0; y < 8; y++) {
    const row: RGB[] = [];
    for (let x = 0; x < 8; x++) {
      row.push(PALETTE[(x + y * 2) % 3]);
    }
    rows.push(row);
  }
  return rows;
}

// Build a raster with colorAt(x, y) -> [r, g, b] deciding each pixel.
function rasterFrom(
  width: number,
  height: number,
  colorAt: (x: number, y: number) => RGB
): Raster {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = colorAt(x, y);
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  return {width, height, data};
}

// A smooth 128x128 gradient: no color edge anywhere clears the detector's
// threshold, so there is no grid to find.
function gradientRaster() {
  return rasterFrom(128, 128, (x, y) => [x * 2, y * 2, 128]);
}

describe('pixelArt', () => {
  it('detects an aligned block grid', () => {
    const raster = blockyRaster(samplePattern(), 12);
    const grid = detectPixelGrid(raster);
    expect(grid).not.toBeNull();
    expect(grid!.sizeX).toBe(12);
    expect(grid!.sizeY).toBe(12);
    expect(grid!.offsetX).toBe(0);
    expect(grid!.offsetY).toBe(0);
  });

  it('detects an offset grid', () => {
    const raster = blockyRaster(samplePattern(), 10, 4);
    const grid = detectPixelGrid(raster);
    expect(grid).not.toBeNull();
    expect(grid!.sizeX).toBe(10);
    expect(grid!.sizeY).toBe(10);
    // Edge tolerance allows the offset to land within a pixel of the truth.
    expect(Math.abs(grid!.offsetX - 4)).toBeLessThanOrEqual(1);
  });

  it('prefers the coarsest grid that explains the edges', () => {
    // 16px blocks also align to an 8px grid; detection should report 16.
    const raster = blockyRaster(samplePattern(), 16);
    const grid = detectPixelGrid(raster);
    expect(grid!.sizeX).toBe(16);
  });

  it('returns null for smooth gradients', () => {
    expect(detectPixelGrid(gradientRaster())).toBeNull();
  });

  it('detects a fractional pitch and downsamples on it', () => {
    // 6.25px: a model's 12.5px grid after the character strip's half
    // downscale. Integer sizes accumulate the remainder as drift and never
    // align, so this exercises the fractional fallback.
    const pitch = 6.25;
    const raster = rasterFrom(256, 256, (x, y) => {
      const lx = Math.floor(x / pitch);
      const ly = Math.floor(y / pitch);
      return PALETTE[(lx + ly * 2) % 3];
    });
    const grid = detectPixelGrid(raster);
    expect(grid).not.toBeNull();
    expect(grid!.sizeX).toBeCloseTo(pitch, 1);
    expect(grid!.sizeY).toBeCloseTo(pitch, 1);
    expect(grid!.confidence).toBeGreaterThanOrEqual(0.6);
    const logical = downsampleToGrid(raster, grid!);
    expect(logical.width).toBe(41); // ceil(256 / 6.25)
    expect(logical.height).toBe(41);
    // Cell centers land inside the source blocks, so values round-trip.
    for (const [cx, cy] of [
      [5, 7],
      [20, 20],
      [33, 12],
    ]) {
      const i = (cy * logical.width + cx) * 4;
      expect([
        logical.data[i],
        logical.data[i + 1],
        logical.data[i + 2],
      ]).toEqual(PALETTE[(cx + cy * 2) % 3]);
    }
  });

  it('reports a fractional pitch, not its half-pitch subharmonic', () => {
    // Every edge of a 10.3px lattice also lies on a 5.15px lattice, and a
    // scan stepping too coarsely at larger sizes lands nearer the half than
    // the truth. Real case: backgrounds painted at ~10.24px (100 logical in
    // a 1K output) detected as 200x200.
    const pitch = 10.3;
    const raster = rasterFrom(512, 512, (x, y) => {
      const lx = Math.floor(x / pitch);
      const ly = Math.floor(y / pitch);
      return PALETTE[(lx + ly * 2) % 3];
    });
    const grid = detectPixelGrid(raster);
    expect(grid).not.toBeNull();
    expect(grid!.sizeX).toBeCloseTo(pitch, 1);
    expect(grid!.sizeY).toBeCloseTo(pitch, 1);
    expect(downsampleToGrid(raster, grid!).width).toBe(50); // ceil(512 / 10.3)
  });

  it('downsamples to the logical resolution and round-trips values', () => {
    const logical = samplePattern();
    const raster = blockyRaster(logical, 12);
    const grid = detectPixelGrid(raster);
    const small = downsampleToGrid(raster, grid!);
    expect(small.width).toBe(8);
    expect(small.height).toBe(8);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const i = (y * 8 + x) * 4;
        expect([small.data[i], small.data[i + 1], small.data[i + 2]]).toEqual(
          logical[y][x]
        );
      }
    }
  });

  it('handles offset grids when downsampling (partial edge cells)', () => {
    const raster = blockyRaster(samplePattern(), 10, 4);
    const grid = detectPixelGrid(raster);
    const small = downsampleToGrid(raster, grid!);
    // 8 full blocks + the leading partial cell from the offset.
    expect(small.width).toBe(9);
    expect(small.height).toBe(9);
  });

  it('upscales nearest-neighbor with hard edges', () => {
    const raster = blockyRaster(samplePattern(), 1);
    const big = upscaleNearest(raster, 4);
    expect(big.width).toBe(32);
    const i = (0 * 32 + 3) * 4; // still inside the first logical pixel
    expect(big.data[i]).toBe(raster.data[0]);
  });

  describe('assumePixelGrid (user chose pixel style, so always find a grid)', () => {
    it('matches the strict detector on clean grids', () => {
      const raster = blockyRaster(samplePattern(), 12);
      const grid = assumePixelGrid(raster, FALLBACK_BLOCK);
      expect(grid.sizeX).toBe(12);
      expect(grid.sizeY).toBe(12);
    });

    it('applies the stronger axis to both when one axis is noisy', () => {
      // Clean 10px columns, but every row differs (no vertical grid at all):
      // like model output whose rows drift off-grid.
      const raster = rasterFrom(
        120,
        120,
        (x, y) => PALETTE[(Math.floor(x / 10) + y * 2) % 3]
      );
      const grid = assumePixelGrid(raster, FALLBACK_BLOCK);
      expect(grid.sizeX).toBe(10);
      expect(grid.sizeY).toBe(10);
    });

    it('falls back to the caller-supplied block size on gridless images', () => {
      const grid = assumePixelGrid(gradientRaster(), FALLBACK_BLOCK);
      expect(grid.sizeX).toBe(FALLBACK_BLOCK);
      expect(grid.sizeY).toBe(FALLBACK_BLOCK);
      // A gradient yields no edges at all, so there is nothing to score.
      expect(grid.confidence).toBe(0);
    });
  });

  it('caps the crisp storage scale', () => {
    // crispScaleFor = clamp(floor(640 / longSide), 1, 8).
    expect(crispScaleFor(8, 8)).toBe(8);
    expect(crispScaleFor(64, 64)).toBe(8);
    expect(crispScaleFor(93, 93)).toBe(6);
    expect(crispScaleFor(640, 640)).toBe(1);
  });
});
