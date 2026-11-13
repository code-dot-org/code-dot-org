// Runtime camera math for the set-zoom block (platform scenes). The world
// keeps its canvas-sized coordinates; zooming narrows the view onto the
// player and the view scrolls with them. Pure functions; the engine owns the
// per-frame state. Assumes the square stage (APP_WIDTH == APP_HEIGHT).

import {APP_WIDTH} from '@cdo/apps/p5lab/constants';

import {ONE_SCREEN, WorldBounds} from './world';

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
// A world larger than one screen draws its background this much larger for
// each screen past the first, and pans it across that extra as the camera
// crosses the world.
const LARGER_WORLD_BACKGROUND_GROWTH = 0.25;

const ZOOM_EASE = 0.25;
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
export function cameraFocus(
  zoom: number,
  target: Point | null,
  world: WorldBounds = ONE_SCREEN
): Point {
  const half = APP_WIDTH / (2 * zoom);
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max - half, Math.max(min + half, value));
  if (!target) {
    return {x: APP_WIDTH / 2, y: APP_WIDTH / 2};
  }
  return {
    x: clamp(target.x, world.left, world.right),
    y: clamp(target.y, world.top, world.bottom),
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
 * The screen-space rectangle to draw the world-sized background into: the
 * background plane at its own (harder) zoom, centered when the camera is,
 * panning at BACKGROUND_SCROLL_RATE of the foreground's screen shift. At
 * zoom 1 this is exactly the unzoomed full-canvas draw.
 */
export function backgroundFrame(
  zoom: number,
  focus: Point,
  world: WorldBounds = ONE_SCREEN
): {x: number; y: number; size: number} {
  if (world !== ONE_SCREEN) {
    return largerWorldBackgroundFrame(zoom, focus, world);
  }
  const scale = backgroundZoom(zoom);
  const half = APP_WIDTH / 2;
  const place = (coord: number) =>
    half - half * scale - BACKGROUND_SCROLL_RATE * (coord - half) * zoom;
  return {
    x: place(focus.x),
    y: place(focus.y),
    size: APP_WIDTH * scale,
  };
}

// The background for a world larger than one screen. The one picture is
// drawn larger than the screen, and slides from one of its edges to the
// other as the camera crosses the world, so it always covers the screen.
function largerWorldBackgroundFrame(
  zoom: number,
  focus: Point,
  world: WorldBounds
): {x: number; y: number; size: number} {
  const screens = Math.max(
    (world.right - world.left) / APP_WIDTH,
    (world.bottom - world.top) / APP_WIDTH
  );
  const size =
    APP_WIDTH *
    backgroundZoom(zoom) *
    (1 + LARGER_WORLD_BACKGROUND_GROWTH * (screens - 1));
  const half = APP_WIDTH / (2 * zoom);
  // How far the camera is across the world, from 0 to 1; halfway where the
  // world leaves it no room to move.
  const across = (value: number, min: number, max: number) =>
    max - half > min + half
      ? Math.min(1, Math.max(0, (value - min - half) / (max - min - 2 * half)))
      : 0.5;
  return {
    x: -(size - APP_WIDTH) * across(focus.x, world.left, world.right),
    y: -(size - APP_WIDTH) * across(focus.y, world.top, world.bottom),
    size,
  };
}
