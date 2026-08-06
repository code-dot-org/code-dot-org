// A layer: a group of actors drawn together, and how that group responds to
// the view (specs/VIEWPORT.md).
//
// A layer is NOT a coordinate system of its own and NOT a camera. Cameras
// belong to the world and are applied to a viewport; a layer says only how much
// of whatever camera is drawing it applies to its contents. Two knobs:
//
//   - `parallax`, a per-axis multiplier on the view's motion. `(1, 1)` moves
//     with it, `(0.2, 0)` is the sky in a side-scroller — shifts as the player
//     walks, stays put when they jump, which is the case a single scalar cannot
//     say and the one that reads as broken when it is wrong.
//   - `fit`, which ignores the view entirely and fits the layer to the surface.
//     This is what an interface layer is, and it is why one is not a special
//     kind of object.
//
// `parallax: (0, 0)` is NOT `fit`. The factor covers translation only, so a
// layer at zero still takes the camera's SCALE — and a HUD in a world whose map
// put the camera at quarter scale would be drawn at quarter scale. `fit` does
// not consult the camera at all. The two look identical until a map is large
// enough to move the camera off 1:1.
//
// NOTHING HERE MOVES YET. A world with no camera has a view that never moves,
// so every parallax value produces the same picture; what layers do before
// cameras exist is order the drawing and give effects somewhere to live. The
// factor is carried because the layer is where it belongs, not because it is
// read.

import {Vector} from './Vector';

/**
 * The layer every actor is in unless something says otherwise.
 *
 * A real layer, not the absence of one. A scene graph with two kinds of actor
 * in it — those in a layer and those in none — would need every query about
 * layers to invent an answer for the second kind, forever.
 */
export const DEFAULT_LAYER_ID = 'main';

/** What a layer is asked for when it is declared. */
export interface LayerInit {
  id: string;
  name?: string;
  /** Per-axis multiplier on the view's motion; defaults to `(1, 1)`. */
  parallax?: Vector;
  /** Ignore the view and fit this layer to the surface; defaults to false. */
  fit?: boolean;
}

/** A layer, as the world holds it. */
export interface Layer {
  readonly id: string;
  readonly name: string;
  readonly parallax: Vector;
  readonly fit: boolean;
}

/** A layer with its defaults filled in. */
export function makeLayer(init: LayerInit): Layer {
  return {
    id: init.id,
    name: init.name ?? init.id,
    parallax: init.parallax ? Vector.from(init.parallax) : new Vector(1, 1),
    fit: init.fit ?? false,
  };
}
