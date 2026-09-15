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
  // Block size in physical pixels per axis. May be fractional: models
  // paint uniform grids at pitches like 12.5px, and a half downscale
  // (character-set strips) keeps the pitch fractional.
  sizeX: number;
  sizeY: number;
  // Where the first grid line falls (0 = grid aligned to the image edge).
  offsetX: number;
  offsetY: number;
  // Fraction of sampled block-interior points the grid reproduces (0..1);
  // 0 on assumePixelGrid's caller-supplied fallback.
  confidence: number;
}

const MIN_BLOCK = 4;
const MAX_BLOCK = 64;
// Edges within this many pixels of a grid line still count as on it, and
// points this close to a cell border are exempt from the reconstruction
// check (diffusion output smudges block borders by a pixel or so).
const EDGE_TOLERANCE = 1;

// Sum of per-channel differences at which two pixels count as different:
// adjacent ones when finding edges, a sampled point against its cell
// center when checking reconstruction. High enough to ignore compression
// noise, low enough for palette art.
const EDGE_THRESHOLD = 90;

// A grid is believed when it reproduces all but this fraction of sampled
// points. Measured on model output: noise-level fine detail (specks,
// dither) mismatches a coarse grid by a few percent, while art that truly
// uses a finer grid mismatches it by 15%+.
const MAX_MISMATCH = 0.08;

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

/**
 * The offset aligning the maximum edge mass at a fixed pitch, and the share
 * of all edge mass that offset aligns. A circular-mean phase is cheaper but
 * averages bimodal distributions (art grid plus a painted frame's margins)
 * into an offset matching neither mode; the scan just ignores the smaller
 * mode. The share doubles as the "does this grid explain the edges" measure.
 */
function fitOffset(
  hist: number[],
  size: number
): {offset: number; share: number} {
  // Edge mass folds into quarter-pixel phase buckets; a circular sliding
  // window of ±EDGE_TOLERANCE then scores every offset in one pass over
  // the bins (this runs per judged candidate, per axis).
  const step = 0.25;
  const buckets = Math.max(1, Math.round(size / step));
  const mass = new Array(buckets).fill(0);
  let total = 0;
  for (let m = 0; m < hist.length; m++) {
    if (!hist[m]) {
      continue;
    }
    total += hist[m];
    mass[Math.floor(((m % size) / size) * buckets) % buckets] += hist[m];
  }
  if (!total) {
    return {offset: 0, share: 0};
  }
  const at = (q: number) => mass[((q % buckets) + buckets) % buckets];
  const halfWindow = Math.round(EDGE_TOLERANCE / step);
  let sum = 0;
  for (let d = -halfWindow; d <= halfWindow; d++) {
    sum += at(d);
  }
  let best = 0;
  let bestAligned = -1;
  for (let q = 0; q < buckets; q++) {
    if (sum > bestAligned) {
      bestAligned = sum;
      best = q;
    }
    sum -= at(q - halfWindow);
    sum += at(q + halfWindow + 1);
  }
  return {offset: best * step, share: bestAligned / total};
}

/** The pitch refit by weighted least squares of edge position on lattice
 * index, over the bins the approximate lattice claims. An aligned-mass
 * plateau localizes a pitch only to ~2% on small images; the fit nails it
 * (a 6.23px pitch read as 6.06 walks two blocks off across a 512 frame). */
function fitPitch(hist: number[], size0: number, offset0: number): number {
  const slack = EDGE_TOLERANCE + 0.5;
  let sw = 0;
  let sk = 0;
  let sm = 0;
  let skk = 0;
  let skm = 0;
  for (let m = 0; m < hist.length; m++) {
    if (!hist[m]) {
      continue;
    }
    const rem = (((m - offset0) % size0) + size0) % size0;
    if (rem > slack && rem < size0 - slack) {
      continue;
    }
    const k = Math.round((m - offset0) / size0);
    const w = hist[m];
    sw += w;
    sk += w * k;
    sm += w * m;
    skk += w * k * k;
    skm += w * k * m;
  }
  const denom = sw * skk - sk * sk;
  if (denom <= 0) {
    return size0;
  }
  const fitted = (sw * skm - sk * sm) / denom;
  // A degenerate fit (few claimed bins, collinear noise) can wander; stay
  // inside the plateau the caller found.
  return Math.abs(fitted - size0) <= size0 * 0.05 ? fitted : size0;
}

/**
 * Candidate pitches along one axis, coarsest first: local maxima of phase
 * coherence, each refined by aligned mass and a least-squares fit (models
 * paint uniform grids at fractional pitches, and alignment peaks are far
 * narrower than coherence peaks). No selection happens here — only the
 * caller's reconstruction check can tell which pitch the picture uses.
 */
function candidatePitches(hist: number[]): number[] {
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
    return [];
  }
  const length = hist.length;

  const edgeSums = (size: number): {sin: number; cos: number} => {
    let sin = 0;
    let cos = 0;
    for (let e = 0; e < edgePositions.length; e++) {
      const a = (2 * Math.PI * edgePositions[e]) / size;
      sin += edgeWeights[e] * Math.sin(a);
      cos += edgeWeights[e] * Math.cos(a);
    }
    return {sin, cos};
  };

  // Circular-mean phase: fine for refining a unimodal peak (fitOffset's
  // mass scan guards the final, possibly bimodal decision). Near-zero
  // wraps clamp to 0.
  const phaseOf = (sums: {sin: number; cos: number}, size: number): number => {
    if (sums.sin === 0 && sums.cos === 0) {
      return 0;
    }
    const offset =
      ((((Math.atan2(sums.sin, sums.cos) / (2 * Math.PI)) * size) % size) +
        size) %
      size;
    return offset < 0.02 || offset > size - 0.02 ? 0 : offset;
  };

  const alignedMass = (size: number): number => {
    const offset = phaseOf(edgeSums(size), size);
    let aligned = 0;
    for (let e = 0; e < edgePositions.length; e++) {
      const rem = (((edgePositions[e] - offset) % size) + size) % size;
      if (rem <= EDGE_TOLERANCE || rem >= size - EDGE_TOLERANCE) {
        aligned += edgeWeights[e];
      }
    }
    return aligned;
  };

  // Coarse coherence scan at coherence's own peak width (~size^2 / 2L).
  const sizes: number[] = [];
  const strengths: number[] = [];
  for (
    let size = MIN_BLOCK;
    size <= MAX_BLOCK;
    size += Math.max(0.02, (size * size) / (2 * length))
  ) {
    const sums = edgeSums(size);
    sizes.push(size);
    strengths.push(Math.hypot(sums.sin, sums.cos) / total);
  }

  // Refine the strongest local maxima (plateau edges count); the cap bounds
  // the work on gridless images, whose noise yields many equal wiggles.
  // Strengths compare in 0.05-wide buckets, coarser size first within one:
  // subharmonics of a lattice score near-equal coherence, and the true
  // (coarser) pitch must survive the cap, not lose it to float jitter.
  const MAX_BASINS = 8;
  const maxima: number[] = [];
  for (let i = 0; i < sizes.length; i++) {
    if (
      (i > 0 && strengths[i] < strengths[i - 1]) ||
      (i < sizes.length - 1 && strengths[i] < strengths[i + 1])
    ) {
      continue;
    }
    maxima.push(i);
  }
  const bucket = (i: number) => Math.round(strengths[i] * 20);
  maxima.sort((a, b) => bucket(b) - bucket(a) || sizes[b] - sizes[a]);

  const pitches: number[] = [];
  for (const i of maxima.slice(0, MAX_BASINS)) {
    const halfWindow = Math.max(0.02, (sizes[i] * sizes[i]) / (2 * length));
    const fineStep = Math.max(
      0.002,
      (EDGE_TOLERANCE * sizes[i]) / (2 * length)
    );
    // Aligned mass is flat across a plateau on small images (the tolerance
    // covers every lattice line for a whole range of periods); the pitch is
    // the plateau's midpoint, not its first point, which undershoots.
    let bestMass = -1;
    let plateauLo = sizes[i];
    let plateauHi = sizes[i];
    for (
      let size = Math.max(MIN_BLOCK, sizes[i] - halfWindow);
      size <= Math.min(MAX_BLOCK, sizes[i] + halfWindow);
      size += fineStep
    ) {
      const mass = alignedMass(size);
      if (mass > bestMass) {
        bestMass = mass;
        plateauLo = size;
        plateauHi = size;
      } else if (mass === bestMass) {
        plateauHi = size;
      }
    }
    // The plateau is wider than the least-squares fit's capture range, so
    // seed the fit from both ends and the middle (deduped: the plateau is
    // often a single point) and keep the self-consistent pitch.
    const fitFrom = (seed: number): number => {
      let p = seed;
      for (let pass = 0; pass < 3; pass++) {
        p = fitPitch(hist, p, phaseOf(edgeSums(p), p));
      }
      return p;
    };
    const mid = (plateauLo + plateauHi) / 2;
    let bestSize = mid;
    let bestFitMass = -1;
    for (const seed of new Set([plateauLo, mid, plateauHi])) {
      const p = fitFrom(seed);
      const mass = alignedMass(p);
      if (mass > bestFitMass) {
        bestFitMass = mass;
        bestSize = p;
      }
    }
    // True integer grids are common (crisp-upscaled storage, painted art);
    // snap when the rounding keeps the far lattice line inside the edge
    // tolerance. Drift accumulates per block: 0.04px off is 2.6px across
    // 64 blocks, so the snap window scales with the block count.
    const snapped = Math.round(bestSize);
    if (Math.abs(bestSize - snapped) * (length / bestSize) <= EDGE_TOLERANCE) {
      pitches.push(snapped);
    } else {
      pitches.push(bestSize);
    }
  }

  pitches.sort((a, b) => b - a);
  // Only literal duplicates drop; near-duplicates are kept for the caller's
  // judge — two basins' estimates of one pitch differ, and only
  // reconstruction can tell which is right.
  return pitches.filter((p, i) => i === 0 || pitches[i - 1] - p > 0.001);
}

/**
 * Fraction of probed points the grid fails to reproduce. Cells are walked
 * like downsampling would; in each, four interior probes (a quarter-cell
 * out from the center on each axis) are compared against the center pixel,
 * the one downsampling to this grid would keep. Probes sit a quarter cell
 * from the borders, clear of border smudge — and never ON the center,
 * which a fixed test lattice can hit for pitches sharing its stride,
 * passing any such grid by comparing points to themselves. Probe pairs
 * that are fully transparent along with their center are not counted (a
 * sprite's empty margins say nothing about its grid). Subsampled: at most
 * PROBE_CELLS_PER_AXIS² cells judge any image size.
 */
const PROBE_CELLS_PER_AXIS = 64;

function gridMismatch(
  raster: Raster,
  grid: {sizeX: number; sizeY: number; offsetX: number; offsetY: number}
): number {
  const {width, height, data} = raster;
  const cellsX = Math.max(1, Math.floor((width - grid.offsetX) / grid.sizeX));
  const cellsY = Math.max(1, Math.floor((height - grid.offsetY) / grid.sizeY));
  const stepX = Math.max(1, Math.round(cellsX / PROBE_CELLS_PER_AXIS));
  const stepY = Math.max(1, Math.round(cellsY / PROBE_CELLS_PER_AXIS));
  // Two probe distances per axis: content whose own period equals a single
  // probe distance would alias and read as uniform.
  const probeDistances = (size: number): number[] => {
    // The border PIXEL blends (EDGE_TOLERANCE exempts it from edge
    // alignment for the same reason), and the rounded center can sit half a
    // pixel high — so the farthest probe keeps two whole pixels of
    // clearance, leaving the blend pixel unread.
    const maxD = Math.max(1, Math.floor(size / 2) - 2);
    const near = Math.min(maxD, Math.max(1, Math.round(size / 4)));
    const far = Math.min(near + 1, maxD);
    return far > near ? [near, far] : [near];
  };
  const dxs = probeDistances(grid.sizeX);
  const dys = probeDistances(grid.sizeY);
  let tested = 0;
  let missed = 0;
  for (let cj = 0; cj < cellsY; cj += stepY) {
    const cy = Math.min(
      height - 1,
      Math.round(grid.offsetY + (cj + 0.5) * grid.sizeY)
    );
    for (let ci = 0; ci < cellsX; ci += stepX) {
      const cx = Math.min(
        width - 1,
        Math.round(grid.offsetX + (ci + 0.5) * grid.sizeX)
      );
      const c = (cy * width + cx) * 4;
      const probes: number[][] = [];
      for (const dx of dxs) {
        probes.push([cx - dx, cy], [cx + dx, cy]);
      }
      for (const dy of dys) {
        probes.push([cx, cy - dy], [cx, cy + dy]);
      }
      for (const [px, py] of probes) {
        if (px < 0 || py < 0 || px >= width || py >= height) {
          continue;
        }
        const i = (py * width + px) * 4;
        if (data[i + 3] < 8 && data[c + 3] < 8) {
          continue;
        }
        tested++;
        const diff =
          Math.abs(data[i] - data[c]) +
          Math.abs(data[i + 1] - data[c + 1]) +
          Math.abs(data[i + 2] - data[c + 2]) +
          Math.abs(data[i + 3] - data[c + 3]);
        if (diff > EDGE_THRESHOLD) {
          missed++;
        }
      }
    }
  }
  return tested ? missed / tested : 1;
}

/** Shared front half of detection: histograms and the merged candidate
 * pool, coarsest first (art pixels are square, so one pitch serves both
 * axes; offsets stay per-axis). Near-duplicates are kept: two axes often
 * estimate the same physical pitch differently, and only the judge can
 * tell which estimate is right. */
function gridCandidates(raster: Raster): {
  histX: number[];
  histY: number[];
  pool: number[];
} {
  const histX = edgeHistogram(raster, 'x');
  const histY = edgeHistogram(raster, 'y');
  const merged = [...candidatePitches(histX), ...candidatePitches(histY)];
  merged.sort((a, b) => b - a);
  const pool = merged.filter((p, i) => i === 0 || merged[i - 1] - p > 0.001);
  return {histX, histY, pool};
}

// Candidates within this ratio are estimates of the same physical pitch
// (the two axes, neighboring coherence basins); further apart they are
// different pitches, octaves apart.
const SAME_PITCH_RATIO = 1.15;

// A believed grid must also explain the color edges: this share of an
// axis's edge mass on the lattice. Reconstruction alone under-weights
// sparse structured damage — a near-flat image resamples coarsely with few
// probe misses while its curved outlines sit entirely off-lattice.
const EDGE_EXPLAINED_MIN = 0.5;

interface ClusterVerdict {
  grid: PixelGrid;
  mismatch: number;
  // Share of each axis's edge mass the grid's lattice aligns.
  shareX: number;
  shareY: number;
}

/**
 * One verdict per pitch cluster, coarsest first. Within a cluster the
 * member that reconstructs best speaks for it: the judge's tolerance
 * cannot separate a pitch from one a few percent off, so ordering by size
 * inside a cluster would crown the sloppiest estimate. Cluster membership
 * compares against the cluster's coarsest member — chaining neighbor
 * ratios would let a ladder of noise candidates merge an octave.
 */
function clusterVerdicts(
  raster: Raster,
  histX: number[],
  histY: number[],
  pool: number[]
): ClusterVerdict[] {
  const verdicts: ClusterVerdict[] = [];
  let i = 0;
  while (i < pool.length) {
    let j = i + 1;
    while (j < pool.length && pool[i] / pool[j] < SAME_PITCH_RATIO) {
      j++;
    }
    let best: ClusterVerdict | null = null;
    for (let k = i; k < j; k++) {
      const size = pool[k];
      const x = fitOffset(histX, size);
      const y = fitOffset(histY, size);
      const grid = {
        sizeX: size,
        sizeY: size,
        offsetX: x.offset,
        offsetY: y.offset,
        confidence: 0,
      };
      const mismatch = gridMismatch(raster, grid);
      if (!best || mismatch < best.mismatch) {
        best = {grid, mismatch, shareX: x.share, shareY: y.share};
      }
    }
    if (best) {
      verdicts.push({
        ...best,
        grid: {...best.grid, confidence: 1 - best.mismatch},
      });
    }
    i = j;
  }
  return verdicts;
}

/**
 * Detect the logical pixel grid of a raster depicting pixel art. Returns
 * null when no candidate grid reproduces the image (smooth art, photos,
 * tiny images).
 *
 * The judge is reconstruction, not edge alignment: the COARSEST cluster
 * whose grid reproduces (nearly) every probed point wins, which is what a
 * resolution claim means — resampling at it changes almost nothing.
 * Judging by alignment alone falls into the octave trap (a half-pitch
 * lattice contains every line of the true one, so any sliver of fine
 * detail tips the choice); the edge-share gate covers reconstruction's own
 * blind spot on both axes (see EDGE_EXPLAINED_MIN).
 */
export function detectPixelGrid(raster: Raster): PixelGrid | null {
  if (raster.width < MIN_BLOCK * 4 || raster.height < MIN_BLOCK * 4) {
    return null;
  }
  const {histX, histY, pool} = gridCandidates(raster);
  for (const v of clusterVerdicts(raster, histX, histY, pool)) {
    if (
      v.mismatch <= MAX_MISMATCH &&
      Math.min(v.shareX, v.shareY) >= EDGE_EXPLAINED_MIN
    ) {
      return v.grid;
    }
  }
  return null;
}

// assumePixelGrid accepts a grid the strict bar refuses: imperfect model
// output (rows drifting a few px off-grid) still normalizes, with minor
// smearing along the drifted rows, rather than being left un-normalized.
// Past this much damage the "grid" isn't one, and the prompt's block size
// is the better guess.
const LENIENT_MISMATCH = 0.25;

/**
 * Best-attempt grid for an image the USER declared to be pixel art: the
 * strict detector's answer when one candidate reproduces the image;
 * otherwise the coarsest candidate that reproduces most of it (drifted
 * output normalizes with minor smearing); otherwise the caller's
 * fallbackBlockSize (typically what the generation prompt asked for).
 * Coarsest-first both times — ranking by least mismatch instead would
 * always favor finer grids, whose cell centers sit nearer every sampled
 * point no matter what the art does. Never returns null — the style
 * choice is the classifier.
 */
export function assumePixelGrid(
  raster: Raster,
  fallbackBlockSize: number
): PixelGrid {
  const {histX, histY, pool} = gridCandidates(raster);
  const verdicts = clusterVerdicts(raster, histX, histY, pool);
  // Strict bar across all clusters first: a coarse cluster that merely
  // survives the lenient bar must not mask a finer grid the image truly
  // uses (large flat regions reconstruct fine at any coarseness). The
  // lenient pass asks one structured axis of the edge-share gate, not two:
  // its job is salvaging output with one good axis and one drifted one.
  for (const v of verdicts) {
    if (
      v.mismatch <= MAX_MISMATCH &&
      Math.min(v.shareX, v.shareY) >= EDGE_EXPLAINED_MIN
    ) {
      return v.grid;
    }
  }
  for (const v of verdicts) {
    if (
      v.mismatch <= LENIENT_MISMATCH &&
      Math.max(v.shareX, v.shareY) >= EDGE_EXPLAINED_MIN
    ) {
      return v.grid;
    }
  }
  return {
    sizeX: fallbackBlockSize,
    sizeY: fallbackBlockSize,
    offsetX: fitOffset(histX, fallbackBlockSize).offset,
    offsetY: fitOffset(histY, fallbackBlockSize).offset,
    confidence: 0,
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
 * The detected physical px per art pixel of an image — its first frame when
 * frameSize is given — or null when no convincing grid exists. May be
 * fractional (see PixelGrid.sizeX), and is harmonized with the cell count
 * downsampling would produce, so rounding a stored dimension divided by
 * this value gives the paint editor's actual grid. Detection only, pixels
 * untouched: reports the grid a non-normalized image (a pixel-style
 * character sheet, or one saved before normalization) would be treated as.
 */
export async function detectImageGridSize(
  source: string,
  frameSize?: {x: number; y: number}
): Promise<number | null> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    // Same-origin today; without this, a CDN-served source would taint the
    // canvas and fail silently.
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('image failed to load'));
    el.src = source;
  });
  const width = frameSize?.x ?? img.naturalWidth;
  const height = frameSize?.y ?? img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', {willReadFrequently: true});
  if (!ctx) {
    return null;
  }
  ctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);
  const grid = detectPixelGrid(rasterFromCanvas(canvas));
  if (!grid) {
    return null;
  }
  const cols = cellBounds(width, grid.sizeX, grid.offsetX).length - 1;
  const rows = cellBounds(height, grid.sizeY, grid.offsetY).length - 1;
  return (width / cols + height / rows) / 2;
}

/**
 * Normalize a blob the user declared to be pixel art: find its grid (best
 * attempt — the style choice is the classifier, so this never bails),
 * downsample to logical resolution, and re-upscale nearest-neighbor to a
 * crisp, uniform, edge-aligned image. squareGrid pins the offsets to the
 * frame, so a square input yields a square logical output (an offset grid
 * would add a partial edge cell).
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
    // One shared pitch per grid, so pinning is offsets only.
    grid = {...grid, offsetX: 0, offsetY: 0};
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
