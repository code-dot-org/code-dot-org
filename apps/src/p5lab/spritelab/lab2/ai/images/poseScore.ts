// How well a generated frame took its pose from the figure it was drawn to.
//
// Adherence is a coin flip per frame — the same request gives a wide stride
// one time and the plate's standing pose the next — so the fix is
// selection, not persuasion: score each frame and ask again for the ones
// that missed. The score is the silhouette's width in two horizontal bands
// of its bounding box, arms and legs, as a fraction of its height, compared
// with the figure's. Plain overlap does not work here: a robe and a hat
// dominate it and the two best frames of a sheet scored below the worst.
// Width by band tracks exactly what a missed pose loses — a swung arm, a
// stride — and, calibrated on three generated sheets, a ratio of 0.7 on
// both bands reproduced every judgment made by eye.

export interface SilhouetteBands {
  /** Width of the arms band (30%–65% of the height down) over the height. */
  arms: number;
  /** Width of the legs band (65%–100%) over the height. */
  legs: number;
}

const ARMS_BAND: [number, number] = [0.3, 0.65];
const LEGS_BAND: [number, number] = [0.65, 1];

/**
 * Band widths of the pixels `isOn` accepts, within their own bounding box.
 * Null when nothing is on.
 */
export function silhouetteBands(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  isOn: (data: Uint8ClampedArray, index: number) => boolean
): SilhouetteBands | null {
  const rowLeft = new Int32Array(height).fill(width);
  const rowRight = new Int32Array(height).fill(-1);
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isOn(data, (y * width + x) * 4)) {
        if (x < rowLeft[y]) {
          rowLeft[y] = x;
        }
        if (x > rowRight[y]) {
          rowRight[y] = x;
        }
        if (y < top) {
          top = y;
        }
        bottom = y;
      }
    }
  }
  if (bottom < 0) {
    return null;
  }
  const h = bottom - top + 1;
  const band = ([from, to]: [number, number]) => {
    let left = width;
    let right = -1;
    for (
      let y = top + Math.floor(h * from);
      y < top + Math.floor(h * to);
      y++
    ) {
      if (rowRight[y] >= 0) {
        left = Math.min(left, rowLeft[y]);
        right = Math.max(right, rowRight[y]);
      }
    }
    return right < 0 ? 0 : (right - left + 1) / h;
  };
  return {arms: band(ARMS_BAND), legs: band(LEGS_BAND)};
}

/** A pixel of a keyed frame that counts: at least half opaque. */
export const isSolid = (data: Uint8ClampedArray, i: number) =>
  data[i + 3] > 127;

/** A pixel of a figure that counts: anything that is not the white ground. */
export const isFigure = (data: Uint8ClampedArray, i: number) =>
  data[i] < 235 || data[i + 1] < 235 || data[i + 2] < 235;

export interface PoseMatch {
  /** Frame width over figure width, per band, capped at 1: wider is fine. */
  arms: number;
  legs: number;
  /** The weaker of the two. */
  score: number;
}

export function poseMatch(
  frame: SilhouetteBands,
  figure: SilhouetteBands
): PoseMatch {
  const ratio = (a: number, b: number) => (b > 0 ? Math.min(1, a / b) : 1);
  const arms = ratio(frame.arms, figure.arms);
  const legs = ratio(frame.legs, figure.legs);
  return {arms, legs, score: Math.min(arms, legs)};
}

// A frame this close to its figure, in both bands, is taken; below it, the
// frame is asked for again while attempts remain.
export const POSE_MATCH_THRESHOLD = 0.7;
// Pictures asked for per frame at most. One, for now: a run at three took
// 30 pictures and bought nothing, because width in a band cannot tell the
// far arm from the near one, or a real arm from a third — the model kept
// offering the same wrong pose in different clothes. The score is still
// computed and shown; retries return when there is a judge worth retrying
// for. (At three, the worst case is 1 + 12 × 3 = 37 pictures, under the
// gateway's 50 a minute.)
export const MAX_FRAME_ATTEMPTS = 1;
