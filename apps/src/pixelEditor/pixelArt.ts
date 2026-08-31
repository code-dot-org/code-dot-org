/**
 * Pixel-art grid utilities: detect the logical pixel grid of an image that
 * DEPICTS pixel art at a higher resolution (e.g. AI output where one art
 * pixel is an ~11px block), downsample to true logical resolution, and
 * upscale nearest-neighbor for crisp storage/display.
 *
 * Detection and resampling are pure raster functions (unit-testable); the
 * blob helpers at the bottom are canvas-based conveniences for callers.
 */

import {Raster} from './tools';

export interface PixelGrid {
  // Block size in physical pixels per axis.
  sizeX: number;
  sizeY: number;
  // Where the first grid line falls (0 = grid aligned to the image edge).
  offsetX: number;
  offsetY: number;
  // Lift over chance of the edge alignment (0..1): how much better the grid
  // explains the color edges than a random grid of the same size would.
  confidence: number;
}

const MIN_BLOCK = 4;
const MAX_BLOCK = 64;
// Confidence is LIFT over chance, not raw alignment: with +/-1px tolerance a
// 4px grid matches 75% of positions by pure chance (raw alignment scores
// near 0.75 on anything), while a real 11px grid at 0.92 raw is (0.92 -
// 0.27) / (1 - 0.27) = 0.89 lift. Raw alignment lets degenerate small
// blocks win on real model output; lift doesn't.
const MIN_CONFIDENCE = 0.6;
// Edges within this many pixels of a grid line count as aligned (diffusion
// output smudges block borders by a pixel or so).
const EDGE_TOLERANCE = 1;

// Sum of per-channel differences at which two adjacent pixels count as an
// edge. High enough to ignore compression noise, low enough for palette art.
const EDGE_THRESHOLD = 90;

// Detection doesn't need every scanline: block edges span the whole image,
// so sampling every 4th line keeps the histogram's shape at a quarter of the
// work. Images too small to yield MIN_SAMPLED_LINES at that stride scan
// every line.
const SCANLINE_STRIDE = 4;
const MIN_SAMPLED_LINES = 32;

/**
 * Histogram of color-edge positions along one axis: result[i] counts how many
 * sampled lines have a strong color change between position i-1 and i.
 * Hot path: runs over megapixel images between click and modal open; kept
 * allocation-free.
 */
function edgeHistogram(raster: Raster, axis: 'x' | 'y'): number[] {
  const {width, height, data} = raster;
  const hist = new Array(axis === 'x' ? width : height).fill(0);
  const cross = axis === 'x' ? height : width;
  const step =
    cross >= MIN_SAMPLED_LINES * SCANLINE_STRIDE ? SCANLINE_STRIDE : 1;
  if (axis === 'x') {
    for (let y = 0; y < height; y += step) {
      let j = y * width * 4;
      for (let x = 1; x < width; x++) {
        const i = j + 4;
        const diff =
          Math.abs(data[i] - data[j]) +
          Math.abs(data[i + 1] - data[j + 1]) +
          Math.abs(data[i + 2] - data[j + 2]) +
          Math.abs(data[i + 3] - data[j + 3]);
        if (diff > EDGE_THRESHOLD) {
          hist[x]++;
        }
        j = i;
      }
    }
  } else {
    const stride = width * 4;
    for (let x = 0; x < width; x += step) {
      let j = x * 4;
      for (let y = 1; y < height; y++) {
        const i = j + stride;
        const diff =
          Math.abs(data[i] - data[j]) +
          Math.abs(data[i + 1] - data[j + 1]) +
          Math.abs(data[i + 2] - data[j + 2]) +
          Math.abs(data[i + 3] - data[j + 3]);
        if (diff > EDGE_THRESHOLD) {
          hist[y]++;
        }
        j = i;
      }
    }
  }
  return hist;
}

/** Best (size, offset) explaining an edge histogram, or null when the best
 * candidate doesn't clear the confidence bar. */
function detectAxis(
  hist: number[]
): {size: number; offset: number; score: number} | null {
  const best = detectAxisLenient(hist);
  return best && best.score >= MIN_CONFIDENCE ? best : null;
}

/** Best (size, offset) for a fixed edge list, ungated by confidence. */
function bestGridForEdges(
  edgePositions: number[],
  edgeWeights: number[],
  total: number
): {size: number; offset: number; score: number} | null {
  let best: {size: number; offset: number; score: number} | null = null;
  for (let size = MIN_BLOCK; size <= MAX_BLOCK; size++) {
    for (let offset = 0; offset < size; offset++) {
      let aligned = 0;
      for (let e = 0; e < edgePositions.length; e++) {
        const rem = (((edgePositions[e] - offset) % size) + size) % size;
        if (rem <= EDGE_TOLERANCE || rem >= size - EDGE_TOLERANCE) {
          aligned += edgeWeights[e];
        }
      }
      const raw = aligned / total;
      // Lift over chance: how much better than a random grid of this size.
      const chance = Math.min(1, (2 * EDGE_TOLERANCE + 1) / size);
      const score = chance >= 1 ? 0 : (raw - chance) / (1 - chance);
      // Prefer LARGER sizes among ties: a perfect 16px grid also aligns
      // perfectly to 8px (16-multiples are 8-multiples), and the coarser
      // grid's lift is higher anyway. Exact ties only: flat art regions let
      // a 2x harmonic score within a whisker of the true grid, and taking
      // the harmonic on one axis fails the squareness check.
      if (!best || score > best.score) {
        best = {size, offset, score};
      } else if (score >= best.score && size > best.size) {
        best = {size, offset, score};
      }
    }
  }
  return best;
}

/** Ungated per-axis result (size/offset/score), for lenient callers.
 * Histograms are mostly zeros; iterate just the edges through the
 * size x offset scan. */
function detectAxisLenient(
  hist: number[]
): {size: number; offset: number; score: number} | null {
  const edgePositions: number[] = [];
  const edgeWeights: number[] = [];
  let total = 0;
  for (let m = 0; m < hist.length; m++) {
    if (hist[m]) {
      edgePositions.push(m);
      edgeWeights.push(hist[m]);
      total += hist[m];
    }
  }
  if (total === 0) {
    return null;
  }
  return bestGridForEdges(edgePositions, edgeWeights, total);
}

/** Offset that aligns the most edge weight for a FIXED block size. */
function bestOffsetForSize(hist: number[], size: number): number {
  let bestOffset = 0;
  let bestAligned = -1;
  for (let offset = 0; offset < size; offset++) {
    let aligned = 0;
    for (let m = 0; m < hist.length; m++) {
      if (!hist[m]) {
        continue;
      }
      const rem = (((m - offset) % size) + size) % size;
      if (rem <= EDGE_TOLERANCE || rem >= size - EDGE_TOLERANCE) {
        aligned += hist[m];
      }
    }
    if (aligned > bestAligned) {
      bestAligned = aligned;
      bestOffset = offset;
    }
  }
  return bestOffset;
}

/**
 * Best-attempt grid for an image the USER declared to be pixel art: the
 * strict detector when it succeeds; otherwise the stronger single axis's
 * block size applied to both (art pixels are square), with each axis's
 * offset fitted to that size; otherwise the caller's fallbackBlockSize
 * (typically what the generation prompt asked for). Never returns null —
 * the style choice is the classifier.
 */
export function assumePixelGrid(
  raster: Raster,
  fallbackBlockSize: number
): PixelGrid {
  const strict = detectPixelGrid(raster);
  if (strict) {
    return strict;
  }
  const histX = edgeHistogram(raster, 'x');
  const histY = edgeHistogram(raster, 'y');
  const bestX = detectAxisLenient(histX);
  const bestY = detectAxisLenient(histY);
  const stronger =
    bestX && bestY
      ? bestX.score >= bestY.score
        ? bestX
        : bestY
      : bestX || bestY;
  const size =
    stronger && stronger.score >= MIN_CONFIDENCE
      ? stronger.size
      : fallbackBlockSize;
  return {
    sizeX: size,
    sizeY: size,
    offsetX: bestOffsetForSize(histX, size),
    offsetY: bestOffsetForSize(histY, size),
    confidence: stronger ? Math.min(stronger.score, 1) : 0,
  };
}

/**
 * Detect the logical pixel grid of a raster depicting pixel art. Returns
 * null when no convincing grid exists (smooth art, photos, tiny images).
 */
export function detectPixelGrid(raster: Raster): PixelGrid | null {
  if (raster.width < MIN_BLOCK * 4 || raster.height < MIN_BLOCK * 4) {
    return null;
  }
  const bestX = detectAxis(edgeHistogram(raster, 'x'));
  const bestY = detectAxis(edgeHistogram(raster, 'y'));
  if (!bestX || !bestY) {
    return null;
  }
  // Art pixels are square-ish; wildly different axis sizes mean we latched
  // onto structure, not a grid.
  if (
    Math.max(bestX.size, bestY.size) >
    Math.min(bestX.size, bestY.size) * 1.5
  ) {
    return null;
  }
  return {
    sizeX: bestX.size,
    sizeY: bestY.size,
    offsetX: bestX.offset,
    offsetY: bestY.offset,
    confidence: Math.min(bestX.score, bestY.score),
  };
}

/** Cell boundaries along one axis for a grid (offset partial cell included). */
function cellBounds(length: number, size: number, offset: number): number[] {
  const bounds = [0];
  for (let b = offset > 0 ? offset : size; b < length; b += size) {
    bounds.push(b);
  }
  bounds.push(length);
  // Detection tolerates ±EDGE_TOLERANCE on the offset, which can leave
  // sliver cells up to twice that at the edges; merge those into their
  // neighbor (real partial cells from a crop are bigger and survive).
  const maxSliver = 2 * EDGE_TOLERANCE;
  if (
    bounds.length > 2 &&
    bounds[bounds.length - 1] - bounds[bounds.length - 2] <= maxSliver
  ) {
    bounds.splice(bounds.length - 2, 1);
  }
  if (bounds.length > 2 && bounds[1] - bounds[0] <= maxSliver) {
    bounds.splice(1, 1);
  }
  return bounds;
}

/**
 * Downsample a raster to its logical pixel-art resolution by sampling each
 * grid cell's center (the most representative point; block borders smudge).
 */
export function downsampleToGrid(raster: Raster, grid: PixelGrid): Raster {
  const bx = cellBounds(raster.width, grid.sizeX, grid.offsetX);
  const by = cellBounds(raster.height, grid.sizeY, grid.offsetY);
  const outW = bx.length - 1;
  const outH = by.length - 1;
  const out = new Uint8ClampedArray(outW * outH * 4);
  for (let cy = 0; cy < outH; cy++) {
    const sy = Math.min(
      raster.height - 1,
      Math.floor((by[cy] + by[cy + 1]) / 2)
    );
    for (let cx = 0; cx < outW; cx++) {
      const sx = Math.min(
        raster.width - 1,
        Math.floor((bx[cx] + bx[cx + 1]) / 2)
      );
      const si = (sy * raster.width + sx) * 4;
      const di = (cy * outW + cx) * 4;
      out[di] = raster.data[si];
      out[di + 1] = raster.data[si + 1];
      out[di + 2] = raster.data[si + 2];
      out[di + 3] = raster.data[si + 3];
    }
  }
  return {width: outW, height: outH, data: out};
}

/** Nearest-neighbor integer upscale. */
export function upscaleNearest(raster: Raster, factor: number): Raster {
  const outW = raster.width * factor;
  const outH = raster.height * factor;
  const out = new Uint8ClampedArray(outW * outH * 4);
  for (let y = 0; y < outH; y++) {
    const sy = Math.floor(y / factor);
    for (let x = 0; x < outW; x++) {
      const sx = Math.floor(x / factor);
      const si = (sy * raster.width + sx) * 4;
      const di = (y * outW + x) * 4;
      out[di] = raster.data[si];
      out[di + 1] = raster.data[si + 1];
      out[di + 2] = raster.data[si + 2];
      out[di + 3] = raster.data[si + 3];
    }
  }
  return {width: outW, height: outH, data: out};
}

// Storage upscale: aim for roughly CRISP_TARGET_PX on the long side (sharp
// at playspace sizes without engine smoothing changes), capped at
// MAX_CRISP_SCALE so assets stay reasonable.
const CRISP_TARGET_PX = 640;
const MAX_CRISP_SCALE = 8;

/** The integer factor logical pixel art is upscaled by for storage. */
export function crispScaleFor(logicalW: number, logicalH: number): number {
  return Math.max(
    1,
    Math.min(
      MAX_CRISP_SCALE,
      Math.floor(CRISP_TARGET_PX / Math.max(logicalW, logicalH))
    )
  );
}

// --- Canvas/blob conveniences (browser only) ---

function rasterFromCanvas(canvas: HTMLCanvasElement): Raster {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('no 2d context');
  }
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function canvasFromRaster(raster: Raster): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = raster.width;
  canvas.height = raster.height;
  const ctx = canvas.getContext('2d');
  ctx?.putImageData(
    new ImageData(
      new Uint8ClampedArray(raster.data),
      raster.width,
      raster.height
    ),
    0,
    0
  );
  return canvas;
}

/**
 * Normalize a blob the user declared to be pixel art: find its grid (best
 * attempt — the style choice is the classifier, so this never bails),
 * downsample to logical resolution, and re-upscale nearest-neighbor to a
 * crisp, uniform, edge-aligned image. Imperfect model output (e.g. rows
 * drifting off-grid) normalizes with minor smearing along the drifted rows
 * rather than being left un-normalized.
 *
 * squareGrid pins the detected grid to the frame with one cell size on both
 * axes, so a square input yields a square logical output (a grid detected
 * at an offset would otherwise add a partial edge cell on that axis). For
 * imagery that must stay square and full-frame — a stage background — the
 * slight sampling misalignment beats losing the grid.
 */
export async function normalizePixelArtBlob(
  blob: Blob,
  fallbackBlockSize: number,
  {squareGrid = false} = {}
): Promise<{blob: Blob; logicalWidth: number; logicalHeight: number} | null> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  // willReadFrequently keeps the canvas CPU-side: we immediately read every
  // pixel back, and readback from a GPU-backed canvas stalls.
  canvas.getContext('2d', {willReadFrequently: true})?.drawImage(bitmap, 0, 0);
  bitmap.close();
  const raster = rasterFromCanvas(canvas);
  let grid = assumePixelGrid(raster, fallbackBlockSize);
  if (squareGrid) {
    // Pinning to one size only makes sense when the axes roughly agree; a
    // size matching neither axis samples out of phase across the frame,
    // scrambling blocks — worse than leaving the image un-normalized.
    if (Math.abs(grid.sizeX - grid.sizeY) > 1) {
      return null;
    }
    const size = Math.round((grid.sizeX + grid.sizeY) / 2);
    grid = {
      sizeX: size,
      sizeY: size,
      offsetX: 0,
      offsetY: 0,
      confidence: grid.confidence,
    };
  }
  const logical = downsampleToGrid(raster, grid);
  const crisp = upscaleNearest(
    logical,
    crispScaleFor(logical.width, logical.height)
  );
  const outBlob = await new Promise<Blob | null>(resolve =>
    canvasFromRaster(crisp).toBlob(resolve, 'image/png')
  );
  return outBlob
    ? {
        blob: outBlob,
        logicalWidth: logical.width,
        logicalHeight: logical.height,
      }
    : null;
}
