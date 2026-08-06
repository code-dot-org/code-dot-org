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

import {SPATIAL} from './spatialKeys';
import type {Trait} from './Trait';
import {Traited} from './Traited';
import type {Property} from './types';
import {Vector} from './Vector';
import type {World} from './World';

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
  /** Traits it elects — how it behaves, authored in a rule. */
  traits?: Trait[];
  /** Initial values for the properties those traits declare. */
  overrides?: Array<[Property, unknown]>;
}

/**
 * Whether this is Spatial's `position` — recognised by KEY, not by import.
 *
 * `core` must not import `rules`, which is why `spatialKeys` exists: plain
 * constants both sides read, so core can speak the rule's vocabulary without
 * depending on it (`renderSnapshot` reads an actor's transform the same way).
 *
 * This is what makes `set position of ⟨camera⟩` work. The positional blocks
 * generate `subject.set(WorldLab.PositionProperty, …)`, and a camera answers
 * that call with its own pose rather than with a slot no trait gave it — which
 * is the concrete meaning of "a camera is the actor foundation minus
 * appearance".
 */
const isPosition = (property: Property): boolean =>
  property.ownerId === SPATIAL.trait && property.id === SPATIAL.position;

/**
 * A camera, as the world holds it.
 *
 * A class rather than a plain object because it holds traits, and holding
 * traits is what makes a camera something a rule can act on: "follows the
 * player" is a trait a camera elects, and a rule's step walks the cameras that
 * have it — exactly as gravity's step walks the actors with its own.
 *
 * The trait machinery is the SAME one an actor uses (core/Traited), because
 * there is nothing actor-specific about holding traits. What a camera does not
 * get is the rest of an Actor: no appearance, no effects of its own, no place
 * in `world.actors`.
 */
export class Camera {
  /**
   * The world this camera is in, set when the world takes it.
   *
   * The same back-reference an Actor carries, for the same reason: a
   * camera-scoped body is invoked as `(camera, …args)` — the engine has no
   * world to hand it — and a body like "follow the player" is a question about
   * the world asked of a camera. The generated preamble binds `const world =
   * camera.world`, exactly as an actor's binds it from the actor.
   */
  world: World | undefined;

  readonly id: string;
  readonly name: string;
  /** Mutable: moving the camera is the whole point of having one. */
  position: Vector;
  private readonly traited: Traited;

  constructor(init: CameraInit) {
    this.id = init.id;
    this.name = init.name ?? init.id;
    this.position = init.position
      ? new Vector(init.position.x, init.position.y)
      : new Vector(0, 0);
    this.traited = new Traited(
      `Camera '${init.id}'`,
      init.traits ?? [],
      init.overrides ?? [],
    );
  }

  /** Whether this camera has the given trait, directly or by dependency. */
  has(trait: Trait): boolean {
    return this.traited.has(trait);
  }

  /** The traits in play on it, dependencies included. */
  traits(): readonly Trait[] {
    return this.traited.traits();
  }

  get<T>(property: Property<T>): T {
    if (isPosition(property)) {
      return this.position as unknown as T;
    }
    return this.traited.get(property);
  }

  /** Set a property; returns `this` so setup can chain, as an actor's does. */
  set<T>(property: Property<T>, value: T): this {
    if (isPosition(property)) {
      // Copied, like every other write of a pose: a step that follows the
      // player writes this every tick, and adopting the caller's Vector would
      // let a later mutation move the view with no call at all.
      const to = value as unknown as {x: number; y: number};
      this.position = new Vector(to.x, to.y);
      return this;
    }
    this.traited.set(property, value);
    return this;
  }

  /** Whether the slot exists at all — distinct from what is in it. */
  hasProperty(property: Property): boolean {
    return isPosition(property) || this.traited.hasProperty(property);
  }
}

/** A camera with its defaults filled in. */
export function makeCamera(init: CameraInit): Camera {
  return new Camera(init);
}
