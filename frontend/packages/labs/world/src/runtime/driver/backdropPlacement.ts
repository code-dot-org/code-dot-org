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
 * How far the camera can travel, per axis — the map less one viewport.
 *
 * Zero for a world no bigger than its window, which is a world with no map: the
 * camera has nowhere to go, and every span below collapses to the viewport.
 */
const panRange = (mapSize: Shift): Shift => ({
  x: Math.max(0, mapSize.x - VIEWPORT_WIDTH),
  y: Math.max(0, mapSize.y - VIEWPORT_HEIGHT),
});

/**
 * Where a STRETCHED slot's image sits, and how big it is drawn.
 *
 * One picture rather than a repeating surface, so covering the view is a
 * question of being BIG enough and in the right place — there is no third
 * option, the way tiling is for the repeating kind.
 *
 * It was drawn one viewport big at the viewport's centre, which covers exactly
 * one camera position: its own layer's container slides under the camera, so
 * the picture rode away and bare clear-colour followed it in. Sizing it to the
 * MAP is the fix for the ordinary case, and it is what a learner means — the
 * sky belongs to the level, not to the window onto it.
 *
 * Parallax is the part with no obvious answer, until the requirement is written
 * down. The image must contain `[0, viewport]` on screen for every position the
 * container takes, and the container takes `-parallax * off` for `off` across
 * the pan range. Both ends of that give:
 *
 *     size     = viewport + |parallax| * range
 *     position = (viewport + parallax * range) / 2
 *
 * which is the smallest picture that always covers. Every case falls out of it
 * rather than being special-cased:
 *
 *   - `1` is map-sized and centred on the map — glued to the level, as asked.
 *   - `0.2` is a sky stretched a fifth as far, drifting slowly across. Less
 *     distortion than a map-sized one, which is what a parallax sky wants.
 *   - `0`, and `fit` (which is parallax 0 here, since its container never
 *     moves), is one viewport at the viewport's centre — exactly what this drew
 *     before, so screen furniture is untouched.
 *   - above `1`, which the block offers as "runs ahead of it", grows PAST the
 *     map, because a layer that outruns the world needs more picture than the
 *     world has. Map-sizing alone would have gapped here.
 *   - below `0` reverses which side the slack goes on, which the `parallax *
 *     range` in the position handles and the `|parallax|` in the size does not
 *     care about.
 *
 * The author's own `slide background` offset moves it on top of all that, and
 * can still walk it off the edge. That is what an offset on a stretched slot
 * means, and the block's tooltip says tiled is what wanting otherwise looks
 * like.
 */
export const stretchedPlacement = (
  offset: Shift,
  mapSize: Shift,
  parallax: Shift,
): {position: Shift; size: Shift} => {
  const range = panRange(mapSize);
  return {
    size: {
      x: VIEWPORT_WIDTH + Math.abs(parallax.x) * range.x,
      y: VIEWPORT_HEIGHT + Math.abs(parallax.y) * range.y,
    },
    position: {
      x: (VIEWPORT_WIDTH + parallax.x * range.x) / 2 + offset.x,
      y: (VIEWPORT_HEIGHT + parallax.y * range.y) / 2 + offset.y,
    },
  };
};

/**
 * What a layer's parallax is FOR PLACEMENT: zero when it is fixed.
 *
 * A `fit` layer's container never moves, and that is the same arithmetic as a
 * factor of zero — so saying it once here keeps {@link stretchedPlacement} from
 * having to know what `fit` is.
 */
export const placementParallax = (layer: LayerMotion | undefined): Shift =>
  !layer || layer.fit ? {x: 0, y: 0} : layer.parallax;
