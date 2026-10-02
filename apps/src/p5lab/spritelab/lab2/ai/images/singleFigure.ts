// The image model sometimes answers a request for one character with a
// sheet of it: two copies side by side, or a grid of poses. This finds the
// cells of such a sheet in keyed (transparent-background) pixels, and
// keeps one.

export interface FigureCell {
  left: number;
  top: number;
  right: number;
  bottom: number;
  /** Opaque pixels inside the cell. */
  pixels: number;
}

// A gap is this many consecutive near-empty rows or columns.
const GAP_MIN_PX = 8;
// A row or column with no more opaque pixels than this is empty: a stray
// speck does not join two figures.
const EMPTY_MAX_PX = 2;
// A cell this small next to the largest is debris, not another figure.
const FIGURE_MIN_SHARE = 0.2;

// Spans of occupied lines between gaps, over [first, last].
function spans(counts: number[]): Array<[number, number]> {
  const occupied = counts.map(c => c > EMPTY_MAX_PX);
  const first = occupied.indexOf(true);
  const last = occupied.lastIndexOf(true);
  if (first < 0) {
    return [];
  }
  const result: Array<[number, number]> = [];
  let start = first;
  let empty = 0;
  for (let i = first; i <= last; i++) {
    if (occupied[i]) {
      if (empty >= GAP_MIN_PX) {
        result.push([start, i - empty - 1]);
        start = i;
      }
      empty = 0;
    } else {
      empty++;
    }
  }
  result.push([start, last]);
  return result;
}

/**
 * The figures in RGBA pixels, as the cells of a sheet split along
 * near-empty rows and columns; one cell means one figure. Cells with
 * little in them next to the largest are left out.
 */
export function findFigureCells(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold: number
): FigureCell[] {
  const columns = new Array<number>(width).fill(0);
  const rows = new Array<number>(height).fill(0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > alphaThreshold) {
        columns[x]++;
        rows[y]++;
      }
    }
  }
  const cells: FigureCell[] = [];
  for (const [top, bottom] of spans(rows)) {
    for (const [left, right] of spans(columns)) {
      let pixels = 0;
      for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
          if (data[(y * width + x) * 4 + 3] > alphaThreshold) {
            pixels++;
          }
        }
      }
      cells.push({left, top, right, bottom, pixels});
    }
  }
  const largest = Math.max(0, ...cells.map(c => c.pixels));
  return cells.filter(c => c.pixels >= largest * FIGURE_MIN_SHARE);
}

/** Clear every pixel outside the cell with the most in it, in place. */
export function keepLargestFigure(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  cells: FigureCell[]
): FigureCell | undefined {
  const keep = cells.reduce<FigureCell | undefined>(
    (best, cell) => (!best || cell.pixels > best.pixels ? cell : best),
    undefined
  );
  if (!keep) {
    return undefined;
  }
  for (let y = 0; y < height; y++) {
    const inside = y >= keep.top && y <= keep.bottom;
    for (let x = 0; x < width; x++) {
      if (!inside || x < keep.left || x > keep.right) {
        data[(y * width + x) * 4 + 3] = 0;
      }
    }
  }
  return keep;
}
