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

import type {AppliedEffectSpec} from './types';
import {Vector} from './Vector';

/**
 * The layer every actor is in unless something says otherwise.
 *
 * A real layer, not the absence of one. A scene graph with two kinds of actor
 * in it — those in a layer and those in none — would need every query about
 * layers to invent an answer for the second kind, forever.
 */
export const DEFAULT_LAYER_ID = 'main';

/** Which of a layer's two image slots is meant. */
export type SlotName = 'background' | 'foreground';

/**
 * An image drawn with a layer — behind its actors, or in front of them.
 *
 * This is what a 'backdrop' was. A world used to hold a flat stack of them at
 * a fixed negative depth; they belong to a layer, because a layer is already
 * the thing with a depth and (later) a parallax factor, and a slot that is part
 * of one inherits both for free. There is nothing to name and nothing to order.
 *
 * No colour here. There is ONE sky, and it is the world's: a colour on any
 * layer but the bottom is behind the layer under it and can never be seen
 * (BACKGROUNDS.md).
 */
export interface LayerSlot {
  /** An image file name, as a frame names one; absent means nothing drawn. */
  sprite?: string;
  /** Effects filtering this image's own pixels — not the whole camera. */
  effects: AppliedEffectSpec[];
  /**
   * Where the image sits, in world pixels — motion the author owns.
   *
   * The other term in `camera position (*) parallax + offset`. A parallax
   * factor ties an image to the camera and to nothing else, so a background on
   * a still camera never moves however the factor is set; drifting clouds, a
   * scrolling starfield and a conveyor texture are all motion with no camera
   * involved, and none of them is expressible as a multiplier. Neither term
   * says what the other says.
   *
   * Written every tick by a drifting layer, so it is a VALUE in the snapshot
   * rather than structure — the line `effectValues` already draws.
   */
  offset: Vector;
  /**
   * Whether the image tiles instead of stretching to fill the surface.
   *
   * Pairs with {@link offset}: a stretched image slid sideways leaves a gap at
   * the edge, a repeating one wraps. Both are legal — stretch plus offset is a
   * mistake worth warning about rather than forbidding — but repeat plus offset
   * is the combination that means something.
   *
   * Stretch is the default, because one sky filling the view is the common case
   * and stretching is right for it.
   */
  repeat: boolean;
}

/** An empty slot: nothing drawn, nothing filtering it, sitting where it is. */
export const emptySlot = (): LayerSlot => ({
  effects: [],
  offset: new Vector(0, 0),
  repeat: false,
});

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
  /** Drawn behind this layer's actors. Mutable: a handler may change it. */
  readonly background: LayerSlot;
  /**
   * Drawn in front of this layer's actors.
   *
   * The same object as the background and drawn by the same code — fog over the
   * game, a vignette, snow. Which side of the actors it lands on is the only
   * difference, and it is a depth rather than a kind. That is why a "foreground
   * layer" is not a thing anyone has to make: any layer has one.
   */
  readonly foreground: LayerSlot;
}

/** A layer with its defaults filled in. */
export function makeLayer(init: LayerInit): Layer {
  return {
    id: init.id,
    name: init.name ?? init.id,
    parallax: init.parallax ? Vector.from(init.parallax) : new Vector(1, 1),
    fit: init.fit ?? false,
    background: emptySlot(),
    foreground: emptySlot(),
  };
}
