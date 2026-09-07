// The arithmetic of the map stage, with no canvas in it.
//
// `MapStage` is fourteen hundred lines of canvas and gesture, and none of it
// could be tested: jsdom gives a canvas no context and no size, so the camera
// never initialised and every handler returned before doing anything. What
// was there to test was never the canvas — it was the questions the handlers
// ask. Which actor is under this point? Where does a dropped actor land? Does
// the camera need to move to show this? Those are functions of a document, a
// camera and a point, and this file is them, one at a time, with the reasons
// they were written the way they were.
//
// The stage keeps the drawing and the state; it asks here for every answer
// that is a number. A test asks the same questions of the same functions,
// which is what makes the answers the stage draws worth trusting.

import {
  positionOf,
  transformOf,
  type Placement,
  type Size,
  type Tile,
  type Transform,
  type Vec,
  type View,
} from './mapModel';

/** The nominal size a kind is drawn at when it declares none — one tile. */
export const DRAW_SIZE = 32;
/**
 * The smallest a hit area may be, in world pixels.
 *
 * A health bar is eight pixels tall and would otherwise be an eight-pixel
 * target. The OUTLINE still hugs the true shape, because that is what the
 * actor is — only the reach is generous.
 */
export const MIN_HIT_SIZE = 14;
export const MIN_SCALE = 0.1;
export const MAX_SCALE = 8;
/** How much of the pane a fitted map fills, leaving a rim of outside. */
export const FIT_PADDING = 0.92;
/** How far in from the pane's edge counts as comfortably visible. */
export const VISIBLE_MARGIN = 0.15;
/** How fast the wheel zooms: scale is multiplied by e^(−deltaY × this). */
export const ZOOM_RATE = 0.0015;

const DEG2RAD = Math.PI / 180;

export const clamp = (n: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, n));

/**
 * The camera that fits a map of `extent` into a `w`×`h` pane, centered.
 *
 * Takes the extent rather than reading the viewport constant: a map is
 * whatever size it says it is now, so "fit the map" is a question about the
 * document.
 */
export function fitView(w: number, h: number, extent: Size): View {
  const scale = clamp(
    Math.min(w / extent.w, h / extent.h) * FIT_PADDING,
    MIN_SCALE,
    MAX_SCALE,
  );
  return {
    scale,
    x: (w - extent.w * scale) / 2,
    y: (h - extent.h * scale) / 2,
  };
}

/** A screen point, in CSS pixels from the canvas's top-left, in the world. */
export const screenToWorld = (view: View, sx: number, sy: number): Vec => ({
  x: (sx - view.x) / view.scale,
  y: (sy - view.y) / view.scale,
});

/** …and back: where a world point lands on the canvas. */
export const worldToScreen = (view: View, pos: Vec): Vec => ({
  x: pos.x * view.scale + view.x,
  y: pos.y * view.scale + view.y,
});

/**
 * Zoom by a wheel's `deltaY`, keeping the world point under the cursor where
 * it is on screen.
 *
 * That pin is the whole of the function: a zoom that kept the map's origin
 * fixed instead would slide whatever you were looking at out from under the
 * pointer, and the way to keep it is to move the offset by however much the
 * scaling moved that point.
 */
export function zoomToward(
  view: View,
  sx: number,
  sy: number,
  deltaY: number,
): View {
  const scale = clamp(
    view.scale * Math.exp(-deltaY * ZOOM_RATE),
    MIN_SCALE,
    MAX_SCALE,
  );
  const under = screenToWorld(view, sx, sy);
  return {scale, x: sx - under.x * scale, y: sy - under.y * scale};
}

/**
 * Where a dropped actor lands: the center of the tile cell under `pos`, or
 * — free — the nearest whole pixel.
 *
 * The center rather than the corner, because an actor's position IS its
 * center (the engine draws it centered, the hit test measures from it), so
 * a snapped actor sits in its cell rather than straddling four.
 */
export function snapToTile(pos: Vec, tile: Tile, free: boolean): Vec {
  if (free) {
    return {x: Math.round(pos.x), y: Math.round(pos.y)};
  }
  return {
    x: Math.floor(pos.x / tile.width) * tile.width + tile.width / 2,
    y: Math.floor(pos.y / tile.height) * tile.height + tile.height / 2,
  };
}

/**
 * One keyboard step from `pos`: a whole tile in the direction given, landing
 * on that cell's center, or — free — a single pixel.
 *
 * Snapped AFTER the move rather than before, so an actor placed off-grid is
 * brought onto it by its first nudge, which is what a nudge means; the free
 * form leaves it exactly where it was plus one.
 */
export function steppedBy(
  pos: Vec,
  tile: Tile,
  dx: number,
  dy: number,
  free: boolean,
): Vec {
  return free
    ? snapToTile({x: pos.x + dx, y: pos.y + dy}, tile, true)
    : snapToTile(
        {x: pos.x + dx * tile.width, y: pos.y + dy * tile.height},
        tile,
        false,
      );
}

/** How big each kind is in the world, for the kinds that declare a picture. */
export type KindSizes =
  | Record<string, {width: number; height: number}>
  | undefined;

/**
 * How big a kind is drawn, in world pixels.
 *
 * A drawing DECLARES its canvas and that canvas is the actor's size, so the
 * map can draw it at the size the game will — a 64-by-8 bar two tiles wide
 * beside a 32-pixel player, rather than fitted into the same square as
 * everything else.
 *
 * The nominal tile for a kind that does not say. A sprite's size is its
 * image's and the image is not measured in the sandbox, so those still
 * normalise — right for the 32-pixel sprites everything ships with, wrong for
 * any other, and a measurement to add rather than a shape to guess
 * (`ThumbnailsReadyMessage.sizes`).
 */
export const drawnSize = (
  sizes: KindSizes,
  type: string,
): {width: number; height: number} =>
  sizes?.[type] ?? {width: DRAW_SIZE, height: DRAW_SIZE};

/**
 * A world point in an actor's own frame — where it would be if the actor were
 * drawn unmoved, unsheared, unrotated and unscaled at the origin.
 *
 * The draw transform is translate → skew → rotate → scale (the Phaser
 * driver's T·shear·R·S), so this undoes it in the opposite order: un-shift,
 * un-shear (y −= tan(skew)·x), un-rotate, un-scale. A hit area computed this
 * way tracks the skewed, turned sprite rather than a box where it would sit
 * if it were neither.
 */
export function toLocalFrame(world: Vec, t: Transform): Vec {
  const dx = world.x - t.pos.x;
  const dy = world.y - t.pos.y - Math.tan(t.skew * DEG2RAD) * dx;
  const a = t.rotation * DEG2RAD;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    x: (dx * cos + dy * sin) / (t.scale.x || 1),
    y: (-dx * sin + dy * cos) / (t.scale.y || 1),
  };
}

/**
 * The topmost placed actor under a world point, or none.
 *
 * Actors draw in array order, so the LAST one drawn is on top and the search
 * runs back to front. The hit area is the kind's drawn size through its own
 * transform, never thinner than `MIN_HIT_SIZE`. A placement with no position
 * is not on the canvas and cannot be hit.
 */
export function hitTest(
  actors: readonly Placement[],
  world: Vec,
  sizes: KindSizes,
): Placement | undefined {
  for (let i = actors.length - 1; i >= 0; i--) {
    const actor = actors[i];
    if (!positionOf(actor)) {
      continue;
    }
    const local = toLocalFrame(world, transformOf(actor));
    const box = drawnSize(sizes, actor.type);
    const hw = Math.max(box.width, MIN_HIT_SIZE) / 2;
    const hh = Math.max(box.height, MIN_HIT_SIZE) / 2;
    if (Math.abs(local.x) <= hw && Math.abs(local.y) <= hh) {
      return actor;
    }
  }
  return undefined;
}

/**
 * The camera that shows `pos` comfortably, or nothing if this one already
 * does.
 *
 * Comfortably is inside a margin of the pane's edge: a point on the last
 * pixel is technically on screen and practically lost. When it has to move
 * the camera centers the point and keeps the zoom — a keyboard cycling the
 * selection should not also change how big everything is.
 */
export function panIntoView(
  view: View,
  size: Size,
  pos: Vec,
): View | undefined {
  if (size.w === 0 || size.h === 0) {
    return undefined;
  }
  const on = worldToScreen(view, pos);
  const mx = size.w * VISIBLE_MARGIN;
  const my = size.h * VISIBLE_MARGIN;
  if (on.x >= mx && on.x <= size.w - mx && on.y >= my && on.y <= size.h - my) {
    return undefined;
  }
  return {
    ...view,
    x: size.w / 2 - pos.x * view.scale,
    y: size.h / 2 - pos.y * view.scale,
  };
}

/**
 * The next (`+1`) or previous (`−1`) placed actor after the selected one, in
 * placement order and wrapping round.
 *
 * With nothing selected, `+1` starts at the first actor and `−1` at the last.
 * Only actors with a position take part — one without is not on the canvas,
 * and cycling onto it would select something nobody can see.
 */
export function nextSelection(
  actors: readonly Placement[],
  selectedId: string | null,
  dir: 1 | -1,
): Placement | undefined {
  const placed = actors.filter(actor => positionOf(actor));
  if (placed.length === 0) {
    return undefined;
  }
  const at = placed.findIndex(actor => actor.id === selectedId);
  const next =
    at === -1
      ? dir === 1
        ? 0
        : placed.length - 1
      : (at + dir + placed.length) % placed.length;
  return placed[next];
}
