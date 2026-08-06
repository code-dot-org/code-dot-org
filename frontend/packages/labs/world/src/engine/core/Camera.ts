// A camera: where the view is taken from (specs/VIEWPORT.md).
//
// A POSE, and nothing else. A camera has a position and no pixels of its own —
// the drawing exists only where a camera is applied to a surface — which is why
// an effect "on a camera" is defined as applying to every viewport rendering
// through it, and why a camera is not a thing that draws.
//
// Cameras belong to the WORLD, not to a layer. A layer says only how much of
// whichever camera is drawing it applies to its contents (`Layer.parallax`,
// `Layer.fit`); it does not own the pose. That separation is what lets a second
// view of the same layer exist later — a minimap, a split screen — without the
// contents knowing.
//
// Not an Actor, though it is meant to be treated like one. A camera is the actor
// foundation MINUS APPEARANCE: it has a position, it is never drawn, and it is
// not in `world.actors`, so no rule has to learn to skip it and `clear world`
// does not take it away with the level.
//
// NO ZOOM YET. The spec's `fit` and a parallax factor of `(0, 0)` differ only
// once a camera can scale — a layer at zero still zooms, a `fit` layer does not
// — so the distinction is carried in the model and is invisible until zoom
// arrives. Adding it here later changes no authoring.

import {Vector} from './Vector';

/**
 * The camera every world draws through unless something says otherwise.
 *
 * A real camera, not the absence of one, for the reason the default LAYER is a
 * real layer: an engine with two kinds of view — through a camera and through
 * none — would need every question about the view to answer twice.
 */
export const DEFAULT_CAMERA_ID = 'main';

/** What a camera is asked for when it is declared. */
export interface CameraInit {
  id: string;
  name?: string;
  /** Where it looks from, in world pixels; defaults to the origin. */
  position?: Vector;
}

/** A camera, as the world holds it. */
export interface Camera {
  readonly id: string;
  readonly name: string;
  /** Mutable: moving the camera is the whole point of having one. */
  position: Vector;
}

/** A camera with its defaults filled in. */
export function makeCamera(init: CameraInit): Camera {
  return {
    id: init.id,
    name: init.name ?? init.id,
    position: init.position
      ? new Vector(init.position.x, init.position.y)
      : new Vector(0, 0),
  };
}
