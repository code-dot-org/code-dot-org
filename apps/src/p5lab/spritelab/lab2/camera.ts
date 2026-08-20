// Runtime camera math for the set-zoom block (platform scenes). The world
// keeps its canvas-sized coordinates; zooming narrows the view onto the
// player and the view scrolls with them. Pure functions; the engine owns the
// per-frame state.

import {APP_WIDTH} from '@cdo/apps/p5lab/constants';

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;

// The background zooms harder than the sprite plane, so the two slide at
// different rates as the view scrolls (parallax). The overhang this creates
// also keeps the background's own edges out of view at every zoom: the
// visible margin works out to 100 * (1 - 1/zoom) px per side.
export const BACKGROUND_ZOOM_RATE = 1.5;

// Fraction of the remaining distance covered per frame, and the gap under
// which the zoom snaps to its target. ~0.3s to settle at 30fps.
export const ZOOM_EASE = 0.25;
const ZOOM_SNAP = 0.001;

export interface Point {
  x: number;
  y: number;
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
 * leaves the world. No target — or no room to scroll — centers the view.
 */
export function cameraFocus(zoom: number, target: Point | null): Point {
  const half = APP_WIDTH / (2 * zoom);
  const clamp = (value: number) =>
    Math.min(APP_WIDTH - half, Math.max(half, value));
  if (!target) {
    return {x: APP_WIDTH / 2, y: APP_WIDTH / 2};
  }
  return {x: clamp(target.x), y: clamp(target.y)};
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
 * The screen-space rectangle to draw the world-sized background into: the
 * background plane rendered at its own (harder) zoom about the same focus.
 * At zoom 1 this is exactly the unzoomed full-canvas draw.
 */
export function backgroundFrame(
  zoom: number,
  focus: Point
): {x: number; y: number; size: number} {
  const scale = backgroundZoom(zoom);
  return {
    x: APP_WIDTH / 2 - focus.x * scale,
    y: APP_WIDTH / 2 - focus.y * scale,
    size: APP_WIDTH * scale,
  };
}
