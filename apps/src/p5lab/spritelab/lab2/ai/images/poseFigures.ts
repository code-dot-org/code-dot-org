// Silhouette pose references for character sets. The model takes a pose
// from a picture far more reliably than from prose — walk cycles described
// limb by limb came back as eight near-identical strides — so each frame
// request carries a figure in the exact pose, drawn here from a handful of
// joint angles. Code-drawn on purpose: every figure shares one scale, one
// foot line and one set of proportions, and a pose is adjusted by changing
// a number. Filled forms rather than stick lines: a first run followed the
// big shapes (arms thrown up in a jump) and under-read the thin ones (an
// arm swing), and reports on these models say a solid mannequin is read
// better than a wire figure.

import {CharacterFacing, CharacterPose} from '../../characterAnimations';

export const POSE_FIGURE_SIZE = 512;

// Angles are degrees from straight down; positive swings toward the front
// (the facing side). Foot angles are from horizontal-forward; 90 points the
// toe straight down. Lengths in pixels of the 512 canvas.
interface Limb {
  upper: number;
  lower: number;
  /** Legs only. */
  foot?: number;
}

interface FigureKey {
  /** The leg on the viewer's side, drawn dark; and the far leg, drawn pale. */
  nearLeg: Limb;
  farLeg: Limb;
  /** The arm on the viewer's side and the far arm. */
  nearArm: Limb;
  farArm: Limb;
  /** Hip rise (negative) or drop (positive) from the standing height. */
  hipDrop: number;
  /** Torso lean, degrees forward from vertical. */
  lean: number;
}

const HIP_Y = 300;
const THIGH = 95;
const SHIN = 95;
const TORSO = 105;
const NECK = 14;
const HEAD_RADIUS = 38;
const UPPER_ARM = 68;
const FOREARM = 62;
const FOOT = 40;
// Limb thicknesses: a solid body, thick at the hip and shoulder, thinner
// toward hands and feet.
const THIGH_WIDTH = 46;
const SHIN_WIDTH = 34;
const UPPER_ARM_WIDTH = 32;
const FOREARM_WIDTH = 24;
const FOOT_WIDTH = 26;
const TORSO_WIDTH = 92;
const NECK_WIDTH = 30;

// The four keys of one half of a side-view walk cycle for the front and
// back leg; a second half, were one generated, swaps which leg is in front
// (walkKey handles frames past the fourth that way). Arm swings are a
// little past life size, elbows bent. They were drawn far past it when
// figures went one frame at a time and the arms hung anyway; drawn to a row
// of figures the model follows the arms, and the shouting swing came back
// as arms reaching out level.
const WALK_HALF: Array<{
  front: Limb;
  back: Limb;
  frontArm: Limb;
  backArm: Limb;
  hipDrop: number;
  lean: number;
}> = [
  // Contact: front heel down, legs wide, back toe down.
  {
    front: {upper: 28, lower: 28, foot: 0},
    back: {upper: -28, lower: -6, foot: 60},
    frontArm: {upper: -34, lower: -26},
    backArm: {upper: 34, lower: 62},
    hipDrop: 4,
    lean: 4,
  },
  // Down: weight onto the bent front leg, back foot lifting.
  {
    front: {upper: 12, lower: -6, foot: 0},
    back: {upper: -24, lower: -42, foot: 70},
    frontArm: {upper: -22, lower: -16},
    backArm: {upper: 22, lower: 46},
    hipDrop: 10,
    lean: 5,
  },
  // Passing: support leg straight under the body, the other lifted past it.
  {
    front: {upper: 0, lower: 0, foot: 0},
    back: {upper: 24, lower: -16, foot: 60},
    frontArm: {upper: 8, lower: 18},
    backArm: {upper: -8, lower: -10},
    hipDrop: 2,
    lean: 3,
  },
  // Up: pushing off the toe behind, the other leg reaching forward.
  {
    front: {upper: -22, lower: -22, foot: 70},
    back: {upper: 32, lower: 8, foot: -10},
    frontArm: {upper: 28, lower: 56},
    backArm: {upper: -28, lower: -24},
    hipDrop: -6,
    lean: 5,
  },
];

function walkKey(frame: number): FigureKey {
  const key = WALK_HALF[frame % WALK_HALF.length];
  // First half: the near leg is the front leg. Second half: legs swapped.
  const nearIsFront = frame < WALK_HALF.length;
  return {
    nearLeg: nearIsFront ? key.front : key.back,
    farLeg: nearIsFront ? key.back : key.front,
    nearArm: nearIsFront ? key.frontArm : key.backArm,
    farArm: nearIsFront ? key.backArm : key.frontArm,
    hipDrop: key.hipDrop,
    lean: key.lean,
  };
}

const STAND_KEYS: FigureKey[] = [
  {
    nearLeg: {upper: 6, lower: 6, foot: 0},
    farLeg: {upper: -6, lower: -6, foot: 0},
    nearArm: {upper: 4, lower: 6},
    farArm: {upper: -4, lower: -6},
    hipDrop: 0,
    lean: 0,
  },
  // Mid-breath: the same stance, risen a little.
  {
    nearLeg: {upper: 6, lower: 6, foot: 0},
    farLeg: {upper: -6, lower: -6, foot: 0},
    nearArm: {upper: 4, lower: 6},
    farArm: {upper: -4, lower: -6},
    hipDrop: -3,
    lean: -1,
  },
];

const JUMP_KEYS: FigureKey[] = [
  // Rising: knees tucked, arms up.
  {
    nearLeg: {upper: 46, lower: -44, foot: 80},
    farLeg: {upper: 34, lower: -36, foot: 80},
    nearArm: {upper: 158, lower: 170},
    farArm: {upper: -158, lower: -170},
    hipDrop: -42,
    lean: 6,
  },
  // Falling: legs reaching down, arms out for balance.
  {
    nearLeg: {upper: 18, lower: 10, foot: 20},
    farLeg: {upper: -12, lower: -20, foot: 60},
    nearArm: {upper: 92, lower: 80},
    farArm: {upper: -92, lower: -80},
    hipDrop: -22,
    lean: -4,
  },
];

export function figureKey(pose: CharacterPose, frame: number): FigureKey {
  switch (pose) {
    case 'walk':
      return walkKey(frame);
    case 'jump':
      return JUMP_KEYS[Math.min(frame, JUMP_KEYS.length - 1)];
    default:
      return STAND_KEYS[Math.min(frame, STAND_KEYS.length - 1)];
  }
}

type Point = [number, number];

function reach([x, y]: Point, degrees: number, length: number): Point {
  const a = (degrees * Math.PI) / 180;
  return [x + length * Math.sin(a), y + length * Math.cos(a)];
}

const fmt = (n: number) => n.toFixed(1);

function polyline(points: Point[], color: string, width: number): string {
  const d = points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ');
  return `<polyline points="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// A limb as segments of decreasing thickness; the round caps overlap at the
// joints and hide the seams.
function segments(points: Point[], widths: number[], color: string): string {
  return points
    .slice(1)
    .map((point, i) => polyline([points[i], point], color, widths[i]))
    .join('');
}

function leg(hip: Point, limb: Limb, color: string): string {
  const knee = reach(hip, limb.upper, THIGH);
  const ankle = reach(knee, limb.lower, SHIN);
  // Foot angle is from horizontal-forward: convert to the from-down frame.
  const toe = reach(ankle, 90 - (limb.foot ?? 0), FOOT);
  return segments(
    [hip, knee, ankle, toe],
    [THIGH_WIDTH, SHIN_WIDTH, FOOT_WIDTH],
    color
  );
}

// The near arm crosses the torso on every swing and would vanish into it,
// same colour on same colour; a white halo this much wider, drawn first,
// keeps its edge.
const ARM_HALO = 12;

function arm(
  shoulder: Point,
  limb: Limb,
  color: string,
  extraWidth = 0
): string {
  const elbow = reach(shoulder, limb.upper, UPPER_ARM);
  const hand = reach(elbow, limb.lower, FOREARM);
  return segments(
    [shoulder, elbow, hand],
    [UPPER_ARM_WIDTH + extraWidth, FOREARM_WIDTH + extraWidth],
    color
  );
}

/**
 * The SVG for one pose frame, facing right by default: a solid dark near
 * side, a pale far side, on white, feet on a common line. Left-facing figures are
 * the mirror image.
 */
export function poseFigureSvg(
  pose: CharacterPose,
  frame: number,
  facing: CharacterFacing = 'right'
): string {
  const key = figureKey(pose, frame);
  const hip: Point = [POSE_FIGURE_SIZE / 2 - 10, HIP_Y + key.hipDrop];
  const shoulder = reach(hip, 180 + key.lean, TORSO);
  const neck = reach(shoulder, 180 + key.lean, NECK);
  const head = reach(neck, 180 + key.lean, HEAD_RADIUS);
  const NEAR = '#111111';
  const FAR = '#8a8a8a';
  const BACKGROUND = '#ffffff';
  const parts = [
    leg(hip, key.farLeg, FAR),
    arm(shoulder, key.farArm, FAR),
    polyline([hip, shoulder], NEAR, TORSO_WIDTH),
    `<circle cx="${fmt(head[0])}" cy="${fmt(
      head[1]
    )}" r="${HEAD_RADIUS}" fill="${NEAR}"/>`,
    polyline([shoulder, neck], NEAR, NECK_WIDTH),
    leg(hip, key.nearLeg, NEAR),
    arm(shoulder, key.nearArm, BACKGROUND, ARM_HALO),
    arm(shoulder, key.nearArm, NEAR),
  ].join('');
  const flip =
    facing === 'left'
      ? ` transform="translate(${POSE_FIGURE_SIZE},0) scale(-1,1)"`
      : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${POSE_FIGURE_SIZE}" height="${POSE_FIGURE_SIZE}" viewBox="0 0 ${POSE_FIGURE_SIZE} ${POSE_FIGURE_SIZE}">` +
    `<rect width="${POSE_FIGURE_SIZE}" height="${POSE_FIGURE_SIZE}" fill="${BACKGROUND}"/>` +
    `<g${flip}>${parts}</g></svg>`
  );
}

const svgUriCache = new Map<string, string>();

/** The figure as an SVG data URI, for showing in the page (an img src). */
export function poseFigureSvgDataURI(
  pose: CharacterPose,
  frame: number,
  facing: CharacterFacing
): string {
  const cacheKey = `${pose}-${frame}-${facing}`;
  let uri = svgUriCache.get(cacheKey);
  if (!uri) {
    uri =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(poseFigureSvg(pose, frame, facing));
    svgUriCache.set(cacheKey, uri);
  }
  return uri;
}

// A row of figures stands this many times the cell width tall: a figure's
// body is under half its square wide, so at this scale the strides fill the
// cells. Each figure is clipped to its cell, since its square (white to the
// edges) is wider than the cell and would paint over its neighbour.
const ROW_FIGURE_SCALE = 1.9;
const ROW_HEIGHT = 1080;

/**
 * Every frame of a pose as one row of figures on white, feet on one line,
 * in a canvas of the given width-over-height — the shape the row picture
 * is asked for in — as a PNG data URI. The reference for a whole pose
 * drawn as one picture: the poses and their order, which prose has not
 * carried (a short row came back as one stride replayed).
 */
export function poseFigureRowDataURI(
  pose: CharacterPose,
  frameCount: number,
  facing: CharacterFacing,
  aspect: number
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.height = ROW_HEIGHT;
  canvas.width = Math.round(ROW_HEIGHT * aspect);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const cell = canvas.width / frameCount;
  const size = Math.min(canvas.height, cell * ROW_FIGURE_SCALE);
  const frames = Array.from({length: frameCount}, (_, frame) =>
    loadFigure(pose, frame, facing)
  );
  return Promise.all(frames).then(images => {
    images.forEach((img, frame) => {
      // Centred in its cell, feet on the canvas floor.
      ctx.save();
      ctx.beginPath();
      ctx.rect(Math.round(cell * frame), 0, Math.round(cell), canvas.height);
      ctx.clip();
      ctx.drawImage(
        img,
        Math.round(cell * frame + (cell - size) / 2),
        canvas.height - size,
        size,
        size
      );
      ctx.restore();
    });
    return canvas.toDataURL('image/png');
  });
}

function loadFigure(
  pose: CharacterPose,
  frame: number,
  facing: CharacterFacing
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = poseFigureSvgDataURI(pose, frame, facing);
  });
}

const figureCache = new Map<string, Promise<string>>();

/** The figure as a PNG data URI (the model takes raster images), cached. */
export function poseFigureDataURI(
  pose: CharacterPose,
  frame: number,
  facing: CharacterFacing
): Promise<string> {
  const cacheKey = `${pose}-${frame}-${facing}`;
  let cached = figureCache.get(cacheKey);
  if (!cached) {
    cached = new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = POSE_FIGURE_SIZE;
        canvas.height = POSE_FIGURE_SIZE;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = poseFigureSvgDataURI(pose, frame, facing);
    });
    figureCache.set(cacheKey, cached);
  }
  return cached;
}
