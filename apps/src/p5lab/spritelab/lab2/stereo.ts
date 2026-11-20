// Side-by-side stereo output for the game, on ?stereo=1 (or ?stereo=<px>
// for the eye offset). Each frame is split as it is drawn into two layers,
// the background and everything over it, and each eye gets the layers
// shifted against each other: the background sits behind the screen, the
// sprite plane sits on the screen at zoom 1 and comes forward as the
// camera zooms in. Pure functions; the engine owns the layers.

import {queryParams} from '@cdo/apps/code-studio/utils';

export const DEFAULT_EYE_PX = 6;
/** The space between the two views, in px of a 400px view. */
export const STEREO_GAP = 8;
// How far the sprite plane comes forward per unit of zoom, as a share of
// the eye offset.
const ZOOM_POP_RATE = 0.5;

export interface StereoSettings {
  /** Half the background's disparity, in canvas px at zoom 1. */
  eye: number;
}

/** The stereo settings the page asks for, or null. A bare `1` (or any
    non-number) takes the default eye offset; a larger number is the
    offset in px. */
export function stereoFromQuery(
  value: unknown = queryParams('stereo')
): StereoSettings | null {
  if (
    value === undefined ||
    value === '' ||
    value === '0' ||
    value === 'false'
  ) {
    return null;
  }
  const px = Number(value);
  return {eye: Number.isFinite(px) && px > 1 ? px : DEFAULT_EYE_PX};
}

export interface LayerShifts {
  background: number;
  foreground: number;
}

/** Each layer's shift for the right eye in canvas px; the left eye takes
    the negatives. A positive shift moves the layer right, which puts it
    behind the screen; a negative one brings it in front. */
export function layerShifts(eye: number, zoom: number): LayerShifts {
  return {
    background: eye,
    foreground: -eye * (zoom - 1) * ZOOM_POP_RATE,
  };
}

export interface StereoLayers {
  background: CanvasImageSource;
  foreground: CanvasImageSource;
}

type Painter = Pick<
  CanvasRenderingContext2D,
  | 'save'
  | 'restore'
  | 'setTransform'
  | 'clearRect'
  | 'beginPath'
  | 'rect'
  | 'clip'
  | 'drawImage'
>;

/** Draw the two eyes side by side onto `out`, left then right, each
    `width` by `height` in backing px, with `gap` px left clear between
    them. The background is overscanned by its shift so neither eye sees
    its edge. */
export function drawStereoPair(
  out: Painter,
  layers: StereoLayers,
  shifts: LayerShifts,
  width: number,
  height: number,
  gap = 0
): void {
  out.save();
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.clearRect(0, 0, 2 * width + gap, height);
  const over = Math.abs(shifts.background);
  [-1, 1].forEach((side, index) => {
    const left = index * (width + gap);
    out.save();
    out.beginPath();
    out.rect(left, 0, width, height);
    out.clip();
    out.drawImage(
      layers.background,
      left - over + side * shifts.background,
      -over,
      width + 2 * over,
      height + 2 * over
    );
    out.drawImage(
      layers.foreground,
      left + side * shifts.foreground,
      0,
      width,
      height
    );
    out.restore();
  });
  out.restore();
}

/** The plain frame, put back together from its layers. */
export function drawMono(
  out: Painter,
  layers: StereoLayers,
  width: number,
  height: number
): void {
  out.save();
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.clearRect(0, 0, width, height);
  out.drawImage(layers.background, 0, 0, width, height);
  out.drawImage(layers.foreground, 0, 0, width, height);
  out.restore();
}

export interface PairPlacement {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Where the pair is shown. Each view is as large as the game's box when
 * `room` is wide enough for two of them and the gap, and smaller when it
 * is not. The pair is centered across `room` and down the box.
 */
export function stereoPairPlacement(
  box: {y: number; side: number},
  room: {left: number; width: number},
  viewPixels: number
): PairPlacement {
  const widthPerView = 2 + STEREO_GAP / viewPixels;
  const view = Math.max(0, Math.min(box.side, room.width / widthPerView));
  const width = view * widthPerView;
  return {
    left: room.left + (room.width - width) / 2,
    top: box.y + (box.side - view) / 2,
    width,
    height: view,
  };
}
