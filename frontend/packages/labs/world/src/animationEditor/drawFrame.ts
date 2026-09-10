// Painting one frame of an animation onto a canvas.
//
// Three places do it: the editor's preview, its row of frame thumbnails, and
// the grid of the project's animations (`AnimationPickerDialog`). A frame is a
// sprite, a cell of it, a scale and an offset, and getting any of those wrong
// puts the drawing somewhere the game will not — so there is one of these
// rather than one per caller.

import type {Frame} from './animDocument';

/**
 * The draw scale a thumbnail and a preview share: a 32px sprite is drawn at 2×
 * so it reads at a glance. The frame's own scale and offset multiply on top.
 */
export const BASE_SCALE = 2;

/** How faint the onion skin is: there, but never mistaken for the frame. */
export const GHOST_ALPHA = 0.28;

/** Paint one frame into a `box`-sized context, at whatever alpha is set. */
export function paintFrame(
  ctx: CanvasRenderingContext2D,
  box: number,
  frame: Frame,
  images: Record<string, HTMLImageElement>,
): void {
  const img = images[frame.sprite];
  if (!img) {
    return;
  }
  const cell = frame.position ?? {
    x: 0,
    y: 0,
    width: img.width,
    height: img.height,
  };
  const scale = (frame.scale ?? 1) * BASE_SCALE;
  const dw = cell.width * scale;
  const dh = cell.height * scale;
  const cx = box / 2 + (frame.offset?.x ?? 0) * BASE_SCALE;
  const cy = box / 2 + (frame.offset?.y ?? 0) * BASE_SCALE;
  ctx.drawImage(
    img,
    cell.x,
    cell.y,
    cell.width,
    cell.height,
    cx - dw / 2,
    cy - dh / 2,
    dw,
    dh,
  );
}

/**
 * Draw one frame centered in a `box`-sized canvas (device-pixel aware).
 *
 * `ghost` is the onion skin: the frame before this one, drawn faint underneath.
 * Offsets and scale are the reason it exists — they are numbers whose whole
 * effect is where a drawing sits RELATIVE to the frame either side of it, and
 * nudging one blind is guesswork.
 */
export function drawFrame(
  canvas: HTMLCanvasElement,
  box: number,
  frame: Frame,
  images: Record<string, HTMLImageElement>,
  ghost?: Frame,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== box * dpr) {
    canvas.width = box * dpr;
  }
  if (canvas.height !== box * dpr) {
    canvas.height = box * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, box, box);
  ctx.imageSmoothingEnabled = false;
  if (ghost) {
    ctx.globalAlpha = GHOST_ALPHA;
    paintFrame(ctx, box, ghost, images);
    ctx.globalAlpha = 1;
  }
  paintFrame(ctx, box, frame, images);
}
