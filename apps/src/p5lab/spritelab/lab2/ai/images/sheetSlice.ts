// Cutting one generated sprite-sheet image into its frames: the model draws
// the frames of a pose side by side in a row, and the gaps between them are
// the key colour, transparent once keyed.

export interface ColumnSpan {
  left: number;
  /** Exclusive. */
  right: number;
}

// A gap narrower than this fraction of the expected frame width is inside a
// frame (between a hand and the body, say), not between frames.
const MIN_GAP_FRACTION = 0.12;

/**
 * The x-ranges of `expected` frames laid out in a row, found from where the
 * keyed image has solid pixels. When the solid runs do not come to that count
 * the row is cut into equal columns instead.
 */
export function columnSpans(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  expected: number,
  alphaThreshold: number
): ColumnSpan[] {
  const solid = new Array<boolean>(width).fill(false);
  for (let y = 0; y < height; y++) {
    const row = y * width * 4;
    for (let x = 0; x < width; x++) {
      if (!solid[x] && data[row + x * 4 + 3] > alphaThreshold) {
        solid[x] = true;
      }
    }
  }
  const minGap = Math.max(1, Math.floor((width / expected) * MIN_GAP_FRACTION));
  const runs: ColumnSpan[] = [];
  let start = -1;
  for (let x = 0; x <= width; x++) {
    const on = x < width && solid[x];
    if (on && start < 0) {
      start = x;
    } else if (!on && start >= 0) {
      const last = runs[runs.length - 1];
      if (last && start - last.right < minGap) {
        last.right = x;
      } else {
        runs.push({left: start, right: x});
      }
      start = -1;
    }
  }
  if (runs.length === expected) {
    return runs;
  }
  return equalColumns(width, expected);
}

export function equalColumns(width: number, count: number): ColumnSpan[] {
  return Array.from({length: count}, (_, i) => ({
    left: Math.floor((i * width) / count),
    right: Math.floor(((i + 1) * width) / count),
  }));
}
