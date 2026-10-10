// Stray marks the model leaves after keying: a one-pixel line along an
// image edge, a dot of backdrop texture. Too small to see, large enough
// to pin a content crop to the full frame, so the picture renders smaller
// than it could.

// A connected patch smaller than this share of the largest one is a stray
// mark. A 1x267 edge line is 0.3% of a 100k-pixel character; a hat or a
// wand held clear of the body is many times larger.
const MINOR_SHARE = 0.005;

/**
 * Clear every opaque patch (8-connected, alpha above the threshold) that is
 * a small fraction of the largest, in place. Returns how many pixels were
 * cleared.
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
  const stack: number[] = [];
  for (let start = 0; start < total; start++) {
    if (label[start] || data[start * 4 + 3] <= alphaThreshold) {
      continue;
    }
    const id = sizes.length;
    sizes.push(0);
    label[start] = id;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop()!;
      sizes[id]++;
      const x = p % width;
      const y = (p - x) / width;
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
  const largest = Math.max(...sizes);
  const minor = sizes.map(size => size < largest * minShare);
  let cleared = 0;
  for (let p = 0; p < total; p++) {
    if (label[p] && minor[label[p]]) {
      data[p * 4 + 3] = 0;
      cleared++;
    }
  }
  return cleared;
}
