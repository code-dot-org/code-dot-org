// Every frame of a character set is asked to face right, and the edit
// model mostly obeys; now and then it draws a pose as a clean mirror
// image. To tell, the frame is laid over the base picture and over the
// base's mirror image. At every pixel where either picture has something
// drawn, the two are scored: 0 for the same color, up to 1 for colors as
// different as they can be, and 1 where only one of them is drawn. The
// average is the distance, and the frame faces like whichever picture it
// is nearer to. Each overlay is tried as drawn and again with the base
// moved onto the frame's drawn center, and the smaller distance counts.

// Alpha above this counts as drawn.
const DRAWN_ALPHA = 64;

// How much nearer the mirror must be before a frame is called mirrored.
const MIRROR_MARGIN = 0.05;

// Unit color distance: the RGB diagonal.
const MAX_DISTANCE = Math.sqrt(3 * 255 * 255);

// The center of the drawn pixels' bounds, or null when nothing is drawn.
function drawnCenter(
  data: Uint8ClampedArray,
  width: number,
  height: number
): {x: number; y: number} | null {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > DRAWN_ALPHA) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }
  return right < 0 ? null : {x: (left + right) / 2, y: (top + bottom) / 2};
}

// The distance with the base shifted by (dx, dy) in the frame's
// coordinates: the average over pixels drawn in either of the color
// difference as a share of the RGB diagonal, or 1 where only one is drawn.
function shiftedDistance(
  frame: Uint8ClampedArray,
  base: Uint8ClampedArray,
  width: number,
  height: number,
  mirrored: boolean,
  dx: number,
  dy: number
): number {
  const inFrame = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height;
  let sum = 0;
  let count = 0;
  for (let y = Math.min(0, dy); y < Math.max(height, height + dy); y++) {
    for (let x = Math.min(0, dx); x < Math.max(width, width + dx); x++) {
      const u = x - dx;
      const v = y - dy;
      const f = (y * width + x) * 4;
      const b = (v * width + (mirrored ? width - 1 - u : u)) * 4;
      const frameDrawn = inFrame(x, y) && frame[f + 3] > DRAWN_ALPHA;
      const baseDrawn = inFrame(u, v) && base[b + 3] > DRAWN_ALPHA;
      if (!frameDrawn && !baseDrawn) {
        continue;
      }
      count++;
      if (frameDrawn && baseDrawn) {
        const dr = frame[f] - base[b];
        const dg = frame[f + 1] - base[b + 1];
        const db = frame[f + 2] - base[b + 2];
        sum += Math.sqrt(dr * dr + dg * dg + db * db) / MAX_DISTANCE;
      } else {
        sum += 1;
      }
    }
  }
  return count ? sum / count : 0;
}

/**
 * How far a frame is from the base picture, or from its mirror image, 0 to
 * 1 (see the file comment). Both must be the same size.
 */
export function facingDistance(
  frame: Uint8ClampedArray,
  base: Uint8ClampedArray,
  width: number,
  height: number,
  mirrored: boolean
): number {
  const asDrawn = shiftedDistance(frame, base, width, height, mirrored, 0, 0);
  const frameCenter = drawnCenter(frame, width, height);
  const baseCenter = drawnCenter(base, width, height);
  if (!frameCenter || !baseCenter) {
    return asDrawn;
  }
  const baseX = mirrored ? width - 1 - baseCenter.x : baseCenter.x;
  const dx = Math.round(frameCenter.x - baseX);
  const dy = Math.round(frameCenter.y - baseCenter.y);
  if (!dx && !dy) {
    return asDrawn;
  }
  return Math.min(
    asDrawn,
    shiftedDistance(frame, base, width, height, mirrored, dx, dy)
  );
}

/** Whether the frame is nearer the base's mirror image than the base. */
export function isMirrored(
  frame: Uint8ClampedArray,
  base: Uint8ClampedArray,
  width: number,
  height: number
): boolean {
  const asDrawn = facingDistance(frame, base, width, height, false);
  const mirrored = facingDistance(frame, base, width, height, true);
  return asDrawn - mirrored > MIRROR_MARGIN;
}
