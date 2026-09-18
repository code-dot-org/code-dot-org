// A coordinate space: what a map is loaded INTO (specs/VIEWPORT_PLAN.md).
//
// Every actor is in exactly one. The world's root space is the main map's,
// and is all a world has until a Viewport is placed: a Viewport owns a space
// of its own, with bounds of its own that grow with the maps loaded into it,
// a camera of its own between the space and the Viewport's rectangle, and the
// loads it holds so they can be taken back. Positions are the space's; the
// only thing between a space and the screen is its camera, and the only
// thing between two spaces is nothing at all — a query for what is near a
// point is asked of the point's space, and finds nothing in another.

import type {Actor} from './Actor';
import type {Camera} from './Camera';
import type {Vector} from './Vector';
import type {MapLoad} from './World';

/** The root space's id, which is also the default camera's. */
export const ROOT_SPACE_ID = 'main';

export class Space {
  readonly id: string;
  /** The Viewport this is the space of; none for the root. */
  readonly owner: Actor | undefined;
  /** How big the space is — the largest map loaded into it. */
  bounds: Vector;
  /**
   * The camera the space is seen through. None for the root, whose view is
   * taken through the world's active camera as it always was.
   */
  readonly camera: Camera | undefined;
  /** The loads this space holds, oldest first — `unload` takes them back. */
  readonly loads: MapLoad[] = [];
  /** The actor the space's camera keeps in the middle, if a map named one. */
  follows: Actor | undefined;

  constructor(
    id: string,
    owner: Actor | undefined,
    bounds: Vector,
    camera: Camera | undefined,
  ) {
    this.id = id;
    this.owner = owner;
    this.bounds = bounds;
    this.camera = camera;
  }
}
