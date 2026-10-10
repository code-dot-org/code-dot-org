// Every frame of a character set is asked to face right, and the edit
// model mostly obeys; now and then it draws a pose as a clean mirror
// image. Nothing else about the frame is wrong, so the fix is to flip it
// back, and the test for which way it faces is which of the base picture
// or its mirror it is nearer to.

// Alpha above this counts as drawn.
const DRAWN_ALPHA = 64;

// Measured over three strips: every rightly drawn pose was nearer the base
// as drawn by at least 0.14, and the one mirrored pose was nearer the
// mirror by 0.10.
const MIRROR_MARGIN = 0.05;

// Unit colour distance: the RGB diagonal.
const MAX_DISTANCE = Math.sqrt(3 * 255 * 255);

/**
 * How far a frame is from the base picture (or from its mirror image),
 * 0–1: the mean over pixels drawn in either of the colour distance where
 * both are drawn, and 1 where only one is. Both must be the same size.
 */
export function facingDistance(
  frame: Uint8ClampedArray,
  base: Uint8ClampedArray,
  width: number,
  height: number,
  mirrored: boolean
): number {
  let sum = 0;
  let count = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const f = (y * width + x) * 4;
      const b = (y * width + (mirrored ? width - 1 - x : x)) * 4;
      const frameDrawn = frame[f + 3] > DRAWN_ALPHA;
      const baseDrawn = base[b + 3] > DRAWN_ALPHA;
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
