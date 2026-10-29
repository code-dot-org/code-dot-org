// A coordinate space (specs/ONE_WORLD_PLAN.md).
//
// Every actor is in exactly one. There are three kinds: the ROOT, which is
// the screen and what it places; the WORLD, which maps fill and which every
// Viewport shows; and one for each Viewport, which holds no actors and is
// the Viewport's camera and window onto the World (`mirrorOf`). Positions
// are the space's; a query for what is near a point is asked of the point's
// space, and finds nothing in another.

import type {Actor} from './Actor';
import type {Camera} from './Camera';
import type {Rgba} from './color';
import type {Layer} from './Layer';
import type {Vector} from './Vector';
import type {MapLoad} from './World';

/** The root space's id, which is also the default camera's. */
export const ROOT_SPACE_ID = 'main';

/** The World's space, which every Viewport shows. */
export const WORLD_SPACE_ID = 'world';

export class Space {
  readonly id: string;
  /** The Viewport this is the space of; none for the root. */
  readonly owner: Actor | undefined;
  /** How big the space is — the largest map loaded into it. */
  bounds: Vector;
  /**
   * The one camera a Viewport sees the World through; none for the root and
   * the World themselves, whose view is the screen's own camera
   * (specs/ONE_WORLD_PLAN.md).
   */
  camera: Camera | undefined;

  /**
   * The space this Viewport shows, which is the World; undefined for the
   * root and the World themselves.
   *
   * A Viewport's space holds no loads and grows nothing: its bounds are the
   * World's, kept in step each tick, and its camera looks at the World —
   * `Camera.space` is the World for each of them, so `in this space`, `map
   * size` and everything else asked with one in hand answers about the
   * World. What stays the Viewport's own is its camera and its window.
   */
  mirrorOf: Space | undefined;

  /**
   * The color behind the map this space shows, or none: a Viewport is
   * see-through until code in it says otherwise (`World.setBackgroundColor`).
   * Unused for the root, whose sky is the world's.
   */
  clearColor: Rgba | undefined;

  /** The loads this space holds, oldest first — `unload` takes them back. */
  readonly loads: MapLoad[] = [];
  /**
   * The space's own layers, back to front, from the map loaded into it
   * (specs/LAYERS_PLAN.md). Empty for the root, whose layers are the
   * world's and fixed when the world is built; a space's are the driver's
   * to build, so a map brings them.
   */
  layers: Layer[] = [];
  /** For the World, the path of the map it holds, when it was given one. */
  shown: string | undefined;

  constructor(id: string, owner: Actor | undefined, bounds: Vector) {
    this.id = id;
    this.owner = owner;
    this.bounds = bounds;
  }
}
