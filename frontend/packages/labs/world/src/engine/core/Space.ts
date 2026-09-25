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
import {DEFAULT_CAMERA_ID, type Camera} from './Camera';
import type {Layer} from './Layer';
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
   * The space this Viewport SHOWS instead of one of its own — the root, or
   * another Viewport's — or undefined for a Viewport with a scene of its own
   * (specs/MIRRORING_PLAN.md).
   *
   * A mirror holds no loads and grows nothing: its bounds are its target's,
   * kept in step each tick, and its cameras look at the target — `Camera.space`
   * is the target for each of them, so `in this space`, `map size` and
   * everything else asked with one in hand answers about the scene it shows.
   * What stays the mirror's own is its cameras and its window.
   */
  mirrorOf: Space | undefined;

  /** Whether this Viewport shows some other space's scene. */
  get mirrors(): boolean {
    return this.mirrorOf !== undefined;
  }

  /** The loads this space holds, oldest first — `unload` takes them back. */
  readonly loads: MapLoad[] = [];
  /**
   * The space's own layers, back to front, from the map loaded into it
   * (specs/LAYERS_PLAN.md). Empty for the root, whose layers are the
   * world's and fixed when the world is built; a space's are the driver's
   * to build, so a map brings them.
   */
  layers: Layer[] = [];
  /**
   * The path the Viewport's `map` property held when its map was last
   * loaded, so a change to the property is noticed (`World.showHeldMap`).
   */
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
