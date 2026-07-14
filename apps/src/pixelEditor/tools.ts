/**
 * Pure raster operations for the pixel editor. Everything works directly on
 * an ImageData-shaped buffer ({width, height, data: RGBA bytes}) so the
 * functions are canvas-free and unit-testable.
 */

export type RGBA = [number, number, number, number];

export interface Raster {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

// Brush sizes offered by the UI, in pixels (square stamps).
export const BRUSH_SIZES = [1, 2, 4, 8];

function setPixel(raster: Raster, x: number, y: number, color: RGBA | null) {
  if (x < 0 || y < 0 || x >= raster.width || y >= raster.height) {
    return;
  }
  const i = (y * raster.width + x) * 4;
  if (color) {
    raster.data[i] = color[0];
    raster.data[i + 1] = color[1];
    raster.data[i + 2] = color[2];
    raster.data[i + 3] = color[3];
  } else {
    // Erase to transparent.
    raster.data[i] = 0;
    raster.data[i + 1] = 0;
    raster.data[i + 2] = 0;
    raster.data[i + 3] = 0;
  }
}

/**
 * Stamp a size x size square centered (as centered as an even size allows)
 * on (x, y). color null erases.
 */
export function stamp(
  raster: Raster,
  x: number,
  y: number,
  size: number,
  color: RGBA | null
) {
  const start = Math.floor((size - 1) / 2);
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      setPixel(raster, x - start + dx, y - start + dy, color);
    }
  }
}

/**
 * Stamp the brush along the whole line from (x0, y0) to (x1, y1) (Bresenham),
 * so fast pointer moves leave no gaps. color null erases.
 */
export function stampLine(
  raster: Raster,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  size: number,
  color: RGBA | null
) {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    stamp(raster, x, y, size, color);
    if (x === x1 && y === y1) {
      break;
    }
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

/**
 * Flood-fill the region of pixels exactly matching the color at (x, y) with
 * the given color. A no-op when the target already matches.
 */
export function floodFill(raster: Raster, x: number, y: number, color: RGBA) {
  const {width, height, data} = raster;
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return;
  }
  const start = (y * width + x) * 4;
  const target: RGBA = [
    data[start],
    data[start + 1],
    data[start + 2],
    data[start + 3],
  ];
  if (
    target[0] === color[0] &&
    target[1] === color[1] &&
    target[2] === color[2] &&
    target[3] === color[3]
  ) {
    return;
  }
  const matches = (i: number) =>
    data[i] === target[0] &&
    data[i + 1] === target[1] &&
    data[i + 2] === target[2] &&
    data[i + 3] === target[3];
  const queue: number[] = [x, y];
  while (queue.length) {
    const py = queue.pop() as number;
    const px = queue.pop() as number;
    const i = (py * width + px) * 4;
    if (!matches(i)) {
      continue;
    }
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = color[3];
    if (px > 0) {
      queue.push(px - 1, py);
    }
    if (px < width - 1) {
      queue.push(px + 1, py);
    }
    if (py > 0) {
      queue.push(px, py - 1);
    }
    if (py < height - 1) {
      queue.push(px, py + 1);
    }
  }
}

/**
 * Draw a circle centered on (cx, cy). Filled circles paint every pixel within
 * the radius; outlines stamp the brush along the circle's edge (midpoint
 * algorithm), so the stroke thickness follows the brush size.
 */
export function drawCircle(
  raster: Raster,
  cx: number,
  cy: number,
  radius: number,
  size: number,
  color: RGBA,
  filled: boolean
) {
  radius = Math.max(0, Math.round(radius));
  if (filled) {
    const r2 = (radius + 0.5) * (radius + 0.5);
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= r2) {
          setPixel(raster, cx + dx, cy + dy, color);
        }
      }
    }
    return;
  }
  // Midpoint circle, stamping all eight octant points.
  let x = radius;
  let y = 0;
  let err = 1 - radius;
  while (x >= y) {
    stamp(raster, cx + x, cy + y, size, color);
    stamp(raster, cx - x, cy + y, size, color);
    stamp(raster, cx + x, cy - y, size, color);
    stamp(raster, cx - x, cy - y, size, color);
    stamp(raster, cx + y, cy + x, size, color);
    stamp(raster, cx - y, cy + x, size, color);
    stamp(raster, cx + y, cy - x, size, color);
    stamp(raster, cx - y, cy - x, size, color);
    y++;
    if (err < 0) {
      err += 2 * y + 1;
    } else {
      x--;
      err += 2 * (y - x) + 1;
    }
  }
}
