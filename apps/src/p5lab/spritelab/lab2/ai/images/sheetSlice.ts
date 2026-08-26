// Cutting one generated sprite-sheet image into its frames. The model is
// asked for a row but lays the frames out as it pleases — a row, a grid,
// rows that touch — so the frames are found as blobs of solid pixels and read
// in row-major order, whatever the layout.

export interface FrameBox {
  left: number;
  top: number;
  /** Exclusive. */
  right: number;
  /** Exclusive. */
  bottom: number;
}

// A blob smaller than this fraction of the largest is a fragment (a hat tip,
// a hand) and joins the frame it overlaps, never a frame of its own.
const FRAGMENT_FRACTION = 0.05;

// Fragments join the nearest frame within this fraction of the image height.
const JOIN_GAP_FRACTION = 0.08;

// How far from an exact multiple of the frame shape a blob may be and still
// count as that many frames: 2.4 frames wide is two frames touching, not
// three.
const PIECE_ROUNDING = 0.5;

// A cut between touching frames is looked for this far either side of where
// an even division would put it, as a fraction of a piece.
const CUT_SEARCH_FRACTION = 0.25;

// A cycle up to this many times longer than asked for is kept whole; a
// longer one is thinned to the asked-for count.
const KEPT_CYCLE_FACTOR = 2;

const boxWidth = (box: FrameBox) => box.right - box.left;
const boxHeight = (box: FrameBox) => box.bottom - box.top;
const boxArea = (box: FrameBox) => boxWidth(box) * boxHeight(box);

/**
 * The boxes of the frames in a keyed sheet image, row by row and left to
 * right: as many as the model drew, which need not be `expected`, the count
 * asked for. `frameAspect` is the shape of one frame of this character
 * (width over height, from its plate): a blob twice that wide holds two
 * frames touching, one twice that tall two frames stacked, and each is cut
 * apart at its sparsest lines. When fewer than two frames can be told apart
 * the image is cut into an even grid of `expected`: a single row when it is
 * wide, else as square a grid as fits.
 */
export function frameBoxes(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  expected: number,
  alphaThreshold: number,
  frameAspect: number
): FrameBox[] {
  let boxes = joinFragments(
    components(data, width, height, alphaThreshold),
    height
  );
  boxes = boxes.flatMap(box =>
    splitByShape(box, frameAspect, data, width, alphaThreshold)
  );
  if (boxes.length < 2) {
    return fallbackGrid(width, height, expected);
  }
  // The model draws the cycle it likes — twelve frames when asked for eight,
  // six when asked for six — and every frame it drew is a frame of the pose,
  // so all are kept. Only a run far longer than asked for is thinned to the
  // frames spread evenly through it, in case it was not one cycle.
  const ordered = rowMajor(boxes);
  if (ordered.length <= expected * KEPT_CYCLE_FACTOR) {
    return ordered;
  }
  return Array.from(
    {length: expected},
    (_, i) => ordered[Math.floor((i * ordered.length) / expected)]
  );
}

/** Bounding boxes of the 4-connected blobs of solid pixels. */
function components(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold: number
): FrameBox[] {
  const seen = new Uint8Array(width * height);
  const boxes: FrameBox[] = [];
  const stack: number[] = [];
  for (let start = 0; start < width * height; start++) {
    if (seen[start] || data[start * 4 + 3] <= alphaThreshold) {
      continue;
    }
    const box = {left: width, top: height, right: 0, bottom: 0};
    stack.push(start);
    seen[start] = 1;
    while (stack.length) {
      const i = stack.pop()!;
      const x = i % width;
      const y = (i - x) / width;
      box.left = Math.min(box.left, x);
      box.right = Math.max(box.right, x + 1);
      box.top = Math.min(box.top, y);
      box.bottom = Math.max(box.bottom, y + 1);
      const neighbours = [
        x > 0 ? i - 1 : -1,
        x < width - 1 ? i + 1 : -1,
        y > 0 ? i - width : -1,
        y < height - 1 ? i + width : -1,
      ];
      for (const n of neighbours) {
        if (n >= 0 && !seen[n] && data[n * 4 + 3] > alphaThreshold) {
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    boxes.push(box);
  }
  return boxes;
}

function union(a: FrameBox, b: FrameBox): FrameBox {
  return {
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  };
}

// Fragments join the frame they sit over or under; a fragment near nothing
// is dropped (a stray speck).
function joinFragments(boxes: FrameBox[], height: number): FrameBox[] {
  if (!boxes.length) {
    return boxes;
  }
  const largest = Math.max(...boxes.map(boxArea));
  const isFragment = (box: FrameBox) =>
    boxArea(box) < largest * FRAGMENT_FRACTION;
  const frames = boxes.filter(box => !isFragment(box));
  const maxGap = height * JOIN_GAP_FRACTION;
  boxes.filter(isFragment).forEach(fragment => {
    let best = -1;
    let bestGap = Infinity;
    frames.forEach((frame, i) => {
      const gap = boxDistance(frame, fragment);
      if (gap <= maxGap && gap < bestGap) {
        best = i;
        bestGap = gap;
      }
    });
    if (best >= 0) {
      frames[best] = union(frames[best], fragment);
    }
  });
  return frames;
}

// A blob holding several frames of the given shape, side by side or stacked,
// cut into them at the sparsest line near each even division.
function splitByShape(
  box: FrameBox,
  frameAspect: number,
  data: Uint8ClampedArray,
  width: number,
  alphaThreshold: number
): FrameBox[] {
  const aspect = boxWidth(box) / boxHeight(box);
  const across = Math.floor(aspect / frameAspect + PIECE_ROUNDING);
  const down = Math.floor(frameAspect / aspect + PIECE_ROUNDING);
  if (across > 1) {
    return cutInto(box, across, false, data, width, alphaThreshold);
  }
  if (down > 1) {
    return cutInto(box, down, true, data, width, alphaThreshold);
  }
  return [box];
}

// A box cut into `pieces` along one axis (across the height when `across`,
// else across the width), each cut at the line with the fewest solid pixels
// near where an even division would fall.
function cutInto(
  box: FrameBox,
  pieces: number,
  across: boolean,
  data: Uint8ClampedArray,
  width: number,
  alphaThreshold: number
): FrameBox[] {
  const length = across ? boxHeight(box) : boxWidth(box);
  const piece = length / pieces;
  const search = Math.max(1, Math.floor(piece * CUT_SEARCH_FRACTION));
  const cuts: number[] = [];
  for (let n = 1; n < pieces; n++) {
    const guess = Math.round(n * piece);
    let cut = guess;
    let fewest = Infinity;
    for (let k = guess - search; k <= guess + search; k++) {
      if (k <= (cuts[cuts.length - 1] ?? 0) || k >= length) {
        continue;
      }
      const count = solidOnLine(box, k, across, data, width, alphaThreshold);
      // Ties go to the line nearest the even division.
      if (
        count < fewest ||
        (count === fewest && Math.abs(k - guess) < Math.abs(cut - guess))
      ) {
        fewest = count;
        cut = k;
      }
    }
    cuts.push(cut);
  }
  const edges = [0, ...cuts, length];
  return edges
    .slice(1)
    .map((end, i) =>
      across
        ? {...box, top: box.top + edges[i], bottom: box.top + end}
        : {...box, left: box.left + edges[i], right: box.left + end}
    );
}

// Solid pixels on the k-th line of the box, a row when `across`, else a
// column.
function solidOnLine(
  box: FrameBox,
  k: number,
  across: boolean,
  data: Uint8ClampedArray,
  width: number,
  alphaThreshold: number
): number {
  let count = 0;
  if (across) {
    const y = box.top + k;
    for (let x = box.left; x < box.right; x++) {
      if (data[(y * width + x) * 4 + 3] > alphaThreshold) {
        count++;
      }
    }
  } else {
    const x = box.left + k;
    for (let y = box.top; y < box.bottom; y++) {
      if (data[(y * width + x) * 4 + 3] > alphaThreshold) {
        count++;
      }
    }
  }
  return count;
}

// The gap between two boxes, zero when they overlap.
function boxDistance(a: FrameBox, b: FrameBox): number {
  const dx = Math.max(0, b.left - a.right, a.left - b.right);
  const dy = Math.max(0, b.top - a.bottom, a.top - b.bottom);
  return Math.hypot(dx, dy);
}

// Rows are frames whose vertical centres lie within half a frame of each
// other; rows top to bottom, frames left to right within a row.
function rowMajor(boxes: FrameBox[]): FrameBox[] {
  const centre = (box: FrameBox) => (box.top + box.bottom) / 2;
  const sorted = [...boxes].sort((a, b) => centre(a) - centre(b));
  const rows: FrameBox[][] = [];
  sorted.forEach(box => {
    const row = rows[rows.length - 1];
    if (row) {
      const ref = row[0];
      const tolerance = Math.min(boxHeight(ref), boxHeight(box)) / 2;
      if (Math.abs(centre(ref) - centre(box)) <= tolerance) {
        row.push(box);
        return;
      }
    }
    rows.push([box]);
  });
  return rows.flatMap(row => row.sort((a, b) => a.left - b.left));
}

function fallbackGrid(
  width: number,
  height: number,
  expected: number
): FrameBox[] {
  if (width >= height * 1.5) {
    return evenGrid(width, height, 1, expected);
  }
  const rows = [...Array(expected).keys()]
    .map(n => n + 1)
    .filter(n => expected % n === 0)
    .reduce((best, n) =>
      Math.abs(n - expected / n) < Math.abs(best - expected / best) ? n : best
    );
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
