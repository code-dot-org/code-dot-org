// Cutting one generated sprite-sheet image into its frames: the model is
// asked for a row, but may lay the frames out as a grid; the gaps between
// frames are the key colour, transparent once keyed.

export interface FrameBox {
  left: number;
  top: number;
  /** Exclusive. */
  right: number;
  /** Exclusive. */
  bottom: number;
}

interface Span {
  start: number;
  /** Exclusive. */
  end: number;
}

// A gap narrower than this fraction of the expected frame size is inside a
// frame (between a hand and the body, say), not between frames.
const MIN_GAP_FRACTION = 0.12;

// Runs of `on` indexes, bridging gaps shorter than minGap.
function runs(on: boolean[], minGap: number): Span[] {
  const result: Span[] = [];
  let start = -1;
  for (let i = 0; i <= on.length; i++) {
    const lit = i < on.length && on[i];
    if (lit && start < 0) {
      start = i;
    } else if (!lit && start >= 0) {
      const last = result[result.length - 1];
      if (last && start - last.end < minGap) {
        last.end = i;
      } else {
        result.push({start, end: i});
      }
      start = -1;
    }
  }
  return result;
}

function solidRows(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold: number,
  x0: number,
  x1: number
): boolean[] {
  const on = new Array<boolean>(height).fill(false);
  for (let y = 0; y < height; y++) {
    const row = y * width * 4;
    for (let x = x0; x < x1; x++) {
      if (data[row + x * 4 + 3] > alphaThreshold) {
        on[y] = true;
        break;
      }
    }
  }
  return on;
}

function solidColumns(
  data: Uint8ClampedArray,
  width: number,
  alphaThreshold: number,
  y0: number,
  y1: number
): boolean[] {
  const on = new Array<boolean>(width).fill(false);
  for (let y = y0; y < y1; y++) {
    const row = y * width * 4;
    for (let x = 0; x < width; x++) {
      if (!on[x] && data[row + x * 4 + 3] > alphaThreshold) {
        on[x] = true;
      }
    }
  }
  return on;
}

/**
 * The boxes of `expected` frames in a keyed sheet image, reading row by row
 * and left to right: rows are the bands of solid pixels down the image, and
 * frames the runs across each band. When the count does not come to
 * `expected`, the image is cut into an even grid instead — as many rows as
 * were found when that divides `expected`, else a single row.
 */
export function frameBoxes(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  expected: number,
  alphaThreshold: number
): FrameBox[] {
  const rowGap = Math.max(1, Math.floor(height * MIN_GAP_FRACTION * 0.5));
  const bands = runs(
    solidRows(data, width, height, alphaThreshold, 0, width),
    rowGap
  );
  const perRow = Math.max(1, Math.round(expected / Math.max(1, bands.length)));
  const colGap = Math.max(1, Math.floor((width / perRow) * MIN_GAP_FRACTION));
  const boxes: FrameBox[] = [];
  bands.forEach(band => {
    runs(
      solidColumns(data, width, alphaThreshold, band.start, band.end),
      colGap
    ).forEach(span =>
      boxes.push({
        left: span.start,
        right: span.end,
        top: band.start,
        bottom: band.end,
      })
    );
  });
  if (boxes.length === expected) {
    return boxes;
  }
  const rows =
    bands.length > 1 && expected % bands.length === 0 ? bands.length : 1;
  return evenGrid(width, height, rows, expected / rows);
}

/** `rows` × `columns` equal cells, row by row. */
export function evenGrid(
  width: number,
  height: number,
  rows: number,
  columns: number
): FrameBox[] {
  const boxes: FrameBox[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      boxes.push({
        left: Math.floor((c * width) / columns),
        right: Math.floor(((c + 1) * width) / columns),
        top: Math.floor((r * height) / rows),
        bottom: Math.floor(((r + 1) * height) / rows),
      });
    }
  }
  return boxes;
}
