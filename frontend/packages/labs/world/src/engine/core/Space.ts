// A coordinate space (specs/ONE_WORLD_PLAN.md).
//
// Every actor is in exactly one. There are three kinds: the ROOT, which is
// the screen and what it places; the WORLD, which maps fill and which every
// Viewport shows; and one for each Viewport, which holds no actors and is
// the Viewport's camera and window onto the World (`mirrorOf`). Positions
// are the space's; a query for what is near a point is asked of the point's
// space, and finds nothing in another.

import type {Actor} from './Actor';
import {DEFAULT_CAMERA_ID, type Camera} from './Camera';
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
   * The cameras this space may be seen through, its main one first.
   *
   * EMPTY FOR THE ROOT, whose cameras are the world's own `cameraList` — the
   * world owns them directly, having no placement to own them for it
   * (specs/SPACE_CAMERAS_PLAN.md). A Viewport's are here because a camera's
   * position belongs to a space and means nothing in another, so a Viewport
   * showing a different scene cannot share the world's.
   *
   * A LIST because a Viewport may want more than one framing — a wide shot and
   * a chase — exactly as the world may. Which of them the view is taken
   * through is the Viewport's own business to say; until it does, it is the
   * first, which is the space's `main`.
   */
  readonly cameras: Camera[];

  /**
   * Which of this space's cameras the view is taken through, by name.
   *
   * Kept in step with the owning Viewport's `shows through` property once a
   * tick (`World.settleSpaces`), which is where the same sync notices a change
   * to the map it holds. Here rather than read from the property directly
   * because a space has no way to ask one: properties belong to rules, and a
   * space is core.
   */
  activeCameraName: string = DEFAULT_CAMERA_ID;

  /**
   * The camera the space is currently seen through, if it has any.
   *
   * The one `activeCameraName` names, or the space's main camera — which is the
   * first, always exists and cannot be taken away. `undefined` for the root,
   * whose view is taken through the world's active camera as it always was.
   *
   * A name no camera has falls back rather than answering nothing, for the
   * reason `World.camera` does the same with an unknown id: the name arrives
   * from a field or from generated code, and a view through nothing is not a
   * better answer than a view through the default.
   */
  get camera(): Camera | undefined {
    return (
      this.cameras.find(camera => camera.name === this.activeCameraName) ??
      this.cameras[0]
    );
  }

  /**
   * One of this space's cameras by the name it was declared under.
   *
   * BY NAME AND NOT BY ID, because a space's camera ids carry the space —
   * `win:wide`, so that two Viewports may each have a `wide` and a list of
   * every camera in the world still tells them apart. What an author writes,
   * and what the Viewport's own property holds, is the bare name.
   */
  cameraNamed(name: string): Camera | undefined {
    return this.cameras.find(camera => camera.name === name);
  }
  /**
   * The space this Viewport shows, which is the World; undefined for the
   * root and the World themselves.
   *
   * A Viewport's space holds no loads and grows nothing: its bounds are the
   * World's, kept in step each tick, and its cameras look at the World —
   * `Camera.space` is the World for each of them, so `in this space`, `map
   * size` and everything else asked with one in hand answers about the
   * World. What stays the Viewport's own is its cameras and its window.
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

  constructor(
    id: string,
    owner: Actor | undefined,
    bounds: Vector,
    cameras: Camera[] = [],
  ) {
    this.id = id;
    this.owner = owner;
    this.bounds = bounds;
    this.cameras = cameras;
  }
}
