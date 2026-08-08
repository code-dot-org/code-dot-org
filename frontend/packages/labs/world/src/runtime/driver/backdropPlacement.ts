// Where a layer's backdrop image goes, given where the camera has put its
// layer.
//
// Split out of the Phaser binding because it is arithmetic and nothing else —
// no scene, no game object — and because the two halves of it have to agree.
// A layer's container is MOVED by the camera; a tiled slot inside one has to
// undo exactly that to stay over the viewport. When those two drift, the
// background lags the world it belongs to, and nothing about a Phaser scene
// makes that visible in a test.

import {VIEWPORT_HEIGHT, VIEWPORT_WIDTH} from '../viewport';

/** A screen-space displacement, in pixels. */
export interface Shift {
  x: number;
  y: number;
}

/** What the driver needs to know about a layer to place it. */
export interface LayerMotion {
  parallax: {x: number; y: number};
  fit: boolean;
}

/**
 * How far the camera has slid one layer, in screen pixels.
 *
 * `(1, 1)` moves with the view, `(0.2, 0)` is a sky that shifts as the player
 * walks and stays put when they jump, and a `fit` layer does not consult the
 * camera at all — which is what makes an interface layer an interface layer.
 *
 * The layer's CONTAINER is then positioned at the negative of this: the world
 * moves opposite the camera.
 */
export const layerShift = (
  layer: LayerMotion | undefined,
  cameraOffset: Shift,
): Shift =>
  !layer || layer.fit
    ? {x: 0, y: 0}
    : {
        x: cameraOffset.x * layer.parallax.x,
        y: cameraOffset.y * layer.parallax.y,
      };

/**
 * Where a TILED slot's sprite sits, and where its texture is scrolled to.
 *
 * A tiled slot is a finite rectangle — one viewport of it — and its whole
 * promise is to cover the surface at every offset. Riding along with its
 * layer's container breaks that: pan a quarter of a viewport and a
 * quarter-viewport band of bare clear-colour appears at the trailing edge.
 *
 * So the sprite is placed to CANCEL the container's translation, leaving it
 * over the viewport, and the same displacement is applied to the texture
 * instead. The picture ends up exactly where riding along would have put it,
 * out of a surface with no edge to reach.
 *
 * The two signs differ, and both are deliberate. A rising tile position scrolls
 * the picture LEFT. The author's `slide background` offset is negated so that
 * raising it moves the picture the way raising a position moves an actor; the
 * camera's is not, because a camera moving right moves the world left.
 */
export const tiledPlacement = (
  shift: Shift,
  offset: Shift,
): {position: Shift; tile: Shift} => ({
  position: {x: VIEWPORT_WIDTH / 2 + shift.x, y: VIEWPORT_HEIGHT / 2 + shift.y},
  tile: {x: shift.x - offset.x, y: shift.y - offset.y},
});

/**
 * Where a STRETCHED slot's image sits.
 *
 * One picture, and it moves bodily with its layer — which is why an offset on
 * one can leave a gap at the edge. That is legal, and almost always a sign that
 * `tiled` was wanted; the block's own tooltip says so.
 */
export const stretchedPlacement = (offset: Shift): Shift => ({
  x: VIEWPORT_WIDTH / 2 + offset.x,
  y: VIEWPORT_HEIGHT / 2 + offset.y,
});
