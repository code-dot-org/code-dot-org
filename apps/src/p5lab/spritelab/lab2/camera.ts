// Runtime camera math for the set-zoom block (platform scenes). The world
// keeps its canvas-sized coordinates; zooming narrows the view onto the
// player and the view scrolls with them. Pure functions; the engine owns the
// per-frame state. Assumes the square stage (APP_WIDTH == APP_HEIGHT).

import {APP_WIDTH} from '@cdo/apps/p5lab/constants';

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

// The background zooms harder than the sprite plane and scrolls slower —
// the distant-plane parallax. The zoom overhang keeps the background's own
// edges out of view at every pan; the scroll rate is the background's
// screen-space pan as a fraction of the foreground's.
const BACKGROUND_ZOOM_RATE = 1.5;
const BACKGROUND_SCROLL_RATE = 0.5;

// Fraction of the remaining distance covered per frame, and the gap under
// which the zoom snaps to its target. ~0.3s to settle at 30fps.
const ZOOM_EASE = 0.25;
const ZOOM_SNAP = 0.001;

export interface Point {
  x: number;
  y: number;
}

/** The world's edges in world coordinates. */
export interface WorldBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** A world the size of the canvas. */
export const CANVAS_BOUNDS: WorldBounds = {
  left: 0,
  top: 0,
  right: APP_WIDTH,
  bottom: APP_WIDTH,
};

/** A world `extent` canvases wide and high, the first canvas at its bottom
    left keeping the canvas's own coordinates: the rest lies to the right
    and above, where y is negative. */
export function worldBounds(extent: number): WorldBounds {
  return {
    left: 0,
    top: APP_WIDTH * (1 - extent),
    right: APP_WIDTH * extent,
    bottom: APP_WIDTH,
  };
}

export function clampZoom(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_ZOOM;
  }
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

/** One frame of easing from the current zoom toward the target. */
export function stepZoom(current: number, target: number): number {
  const next = current + (target - current) * ZOOM_EASE;
  return Math.abs(target - next) < ZOOM_SNAP ? target : next;
}

export function backgroundZoom(zoom: number): number {
  return 1 + (zoom - 1) * BACKGROUND_ZOOM_RATE;
}

/**
 * Where the camera looks: the target (the player), clamped so the view never
 * leaves the world. No target centers the view on the first canvas.
 */
export function cameraFocus(
  zoom: number,
  target: Point | null,
  bounds: WorldBounds = CANVAS_BOUNDS
): Point {
  const half = APP_WIDTH / (2 * zoom);
  const clamp = (value: number, low: number, high: number) =>
    Math.min(high - half, Math.max(low + half, value));
  if (!target) {
    return {x: APP_WIDTH / 2, y: APP_WIDTH / 2};
  }
  return {
    x: clamp(target.x, bounds.left, bounds.right),
    y: clamp(target.y, bounds.top, bounds.bottom),
  };
}

/**
 * A screen point (e.g. the mouse) in world coordinates under the camera.
 * Identity at zoom 1 with a centered focus.
 */
export function worldPoint(screen: Point, zoom: number, focus: Point): Point {
  return {
    x: (screen.x - APP_WIDTH / 2) / zoom + focus.x,
    y: (screen.y - APP_WIDTH / 2) / zoom + focus.y,
  };
}

/**
 * The screen-space rectangle to draw the background into: the background
 * plane at its own (harder) zoom, centered when the camera is on the
 * world's center, panning at BACKGROUND_SCROLL_RATE of the foreground's
 * screen shift, and stretched by that rate's share of a world wider than
 * the canvas so its edges stay out of view at every pan. At zoom 1 over a
 * canvas-sized world this is exactly the unzoomed full-canvas draw.
 */
export function backgroundFrame(
  zoom: number,
  focus: Point,
  bounds: WorldBounds = CANVAS_BOUNDS
): {x: number; y: number; size: number} {
  const span = Math.max(bounds.right - bounds.left, bounds.bottom - bounds.top);
  const size =
    APP_WIDTH * backgroundZoom(zoom) +
    BACKGROUND_SCROLL_RATE * zoom * (span - APP_WIDTH);
  const half = APP_WIDTH / 2;
  const place = (coord: number, center: number) =>
    half - size / 2 - BACKGROUND_SCROLL_RATE * (coord - center) * zoom;
  return {
    x: place(focus.x, (bounds.left + bounds.right) / 2),
    y: place(focus.y, (bounds.top + bounds.bottom) / 2),
    size,
  };
}
