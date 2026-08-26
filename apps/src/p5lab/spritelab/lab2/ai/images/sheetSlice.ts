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

const boxWidth = (box: FrameBox) => box.right - box.left;
const boxHeight = (box: FrameBox) => box.bottom - box.top;
const boxArea = (box: FrameBox) => boxWidth(box) * boxHeight(box);

/**
 * The boxes of `expected` frames in a keyed sheet image, row by row and left
 * to right. When the frames cannot be told apart the image is cut into an
 * even grid: a single row when it is wide, else as square a grid as fits.
 */
export function frameBoxes(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  expected: number,
  alphaThreshold: number
): FrameBox[] {
  let boxes = joinFragments(
    components(data, width, height, alphaThreshold),
    height
  );
  if (
    boxes.length &&
    boxes.length < expected &&
    expected % boxes.length === 0
  ) {
    boxes = splitEach(
      boxes,
      expected / boxes.length,
      data,
      width,
      alphaThreshold
    );
  }
  while (boxes.length > expected) {
    boxes = mergeClosest(boxes);
  }
  if (boxes.length !== expected) {
    return fallbackGrid(width, height, expected);
  }
  return rowMajor(boxes);
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

// Fewer blobs than frames, by a whole factor: frames are touching (a hat
// against the boots above, a hand against the next frame). Each blob is cut
// into `parts` at its sparsest interior lines, across if it is taller than
// wide and down otherwise.
function splitEach(
  boxes: FrameBox[],
  parts: number,
  data: Uint8ClampedArray,
  width: number,
  alphaThreshold: number
): FrameBox[] {
  if (parts !== 2) {
    return boxes;
  }
  return boxes.flatMap(box => {
    const across = boxHeight(box) >= boxWidth(box);
    const length = across ? boxHeight(box) : boxWidth(box);
    const from = Math.floor(length / 4);
    const to = length - from;
    let cut = -1;
    let fewest = Infinity;
    for (let k = from; k < to; k++) {
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
      if (count < fewest) {
        fewest = count;
        cut = k;
      }
    }
    return across
      ? [
          {...box, bottom: box.top + cut},
          {...box, top: box.top + cut},
        ]
      : [
          {...box, right: box.left + cut},
          {...box, left: box.left + cut},
        ];
  });
}

// The gap between two boxes, zero when they overlap.
function boxDistance(a: FrameBox, b: FrameBox): number {
  const dx = Math.max(0, b.left - a.right, a.left - b.right);
  const dy = Math.max(0, b.top - a.bottom, a.top - b.bottom);
  return Math.hypot(dx, dy);
}

// Too many blobs: the two whose boxes are nearest become one.
function mergeClosest(boxes: FrameBox[]): FrameBox[] {
  let a = 0;
  let b = 1;
  let best = Infinity;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const distance = boxDistance(boxes[i], boxes[j]);
      if (distance < best) {
        best = distance;
        a = i;
        b = j;
      }
    }
  }
  const merged = union(boxes[a], boxes[b]);
  return boxes.filter((_, i) => i !== a && i !== b).concat(merged);
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
