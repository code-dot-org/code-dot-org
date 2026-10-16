// Stray marks the model leaves after keying, too small to see but enough
// to hold a content crop open so the picture renders smaller than it could.

// A patch under this share of the largest one is a stray mark when it
// touches the image edge or is tiny; a larger patch clear of the edge is a
// thin part the matte broke off (a balloon's string) and stays.
const MINOR_SHARE = 0.005;
const MINOR_PIXELS = 16;

/**
 * Clear every stray opaque patch (8-connected, alpha above the threshold)
 * in place. Returns how many pixels were cleared.
 */
export function clearMinorComponents(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  alphaThreshold: number,
  minShare: number = MINOR_SHARE
): number {
  const total = width * height;
  const label = new Int32Array(total);
  const sizes: number[] = [0];
  const touchesEdge: boolean[] = [false];
  const stack: number[] = [];
  for (let start = 0; start < total; start++) {
    if (label[start] || data[start * 4 + 3] <= alphaThreshold) {
      continue;
    }
    const id = sizes.length;
    sizes.push(0);
    touchesEdge.push(false);
    label[start] = id;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop()!;
      sizes[id]++;
      const x = p % width;
      const y = (p - x) / width;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        touchesEdge[id] = true;
      }
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            continue;
          }
          const q = ny * width + nx;
          if (!label[q] && data[q * 4 + 3] > alphaThreshold) {
            label[q] = id;
            stack.push(q);
          }
        }
      }
    }
  }
  let largest = 0;
  for (const size of sizes) {
    largest = Math.max(largest, size);
  }
  const minor = sizes.map(
    (size, id) =>
      size < largest * minShare && (touchesEdge[id] || size <= MINOR_PIXELS)
  );
  let cleared = 0;
  for (let p = 0; p < total; p++) {
    if (label[p] && minor[label[p]]) {
      data[p * 4 + 3] = 0;
      cleared++;
    }
  }
  return cleared;
}
