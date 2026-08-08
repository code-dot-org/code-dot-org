// Describes a World and brings it to life: the rules in play, and the actors
// living under them.
//
// There used to be a Scene between these two halves — a World plus the Actors
// in it. It was removed because it never was a separate thing: every method on
// it opened by reaching for the world it held, so it was a partial application
// of world operations rather than an abstraction. What it really owned was the
// actor-type registry that `loadMap` needs, which lives here now.
//
// A builder is a DESCRIPTION, and the description is a call log. Everything a
// World can be told after it exists is recorded here and replayed into one —
// now, if the world is already built, and again from the top whenever another
// is made (`instantiate`). Only what a World must know AT CONSTRUCTION, because
// it derives something global from the whole set, is accumulated separately:
//
//   - `useRules`: rule membership resolves through a DependencySet, seeds every
//     world-scoped property default, and fixes the per-tick step order
//     (`new Scheduler(steps)`). None of those has an incremental form.
//   - `useAnimations`: the registry is seeded once, from the active rules.
//   - `defineLayer`: declaration order IS draw order, so a layer arriving later
//     would have to be spliced into a scene graph the driver already made.
//
// Those three THROW when they arrive too late — silently dropping a rule a
// learner can see they asked for is worse. Everything else is a one-line
// `defer`, which is the point: there is no per-method decision to get wrong.
// A method that forwards to a World it does not have was this file's recurring
// bug (`world.setLayerParallax is not a function`), and `defer` makes the
// forwarding one piece of code with the method name checked by the compiler.
//
// "Too late" means AFTER THE ACTORS ARE PLACED, which is what the error says
// and now what it tests. The world existing is not itself a problem: reading a
// camera or the actor list builds one, and a declaration arriving after that
// but before any actor is placed simply rebuilds and replays. It is actors
// constructed under the old laws that cannot be undone.

import type {EffectDocument} from '../../effect/model/types';
import type {Actor} from '../core/Actor';
import type {AnimationDef} from '../core/animationTypes';
import type {Camera, CameraInit} from '../core/Camera';
import type {ColorValue} from '../core/color';
import {DEFAULT_LAYER_ID, type LayerInit} from '../core/Layer';
import type {
  AppliedEffectSpec,
  GameEvent,
  Property,
  Rule,
  WorldEventHandler,
} from '../core/types';
import type {Vector} from '../core/Vector';
import {World} from '../core/World';
import {AnimationRule} from '../rules/animation';
import {SpatialRule} from '../rules/spatial';

import type {ActorBuilder} from './ActorBuilder';

/**
 * The rules every world has whether or not it says so — see `rulesInPlay`.
 *
 * Imported from their modules rather than through the engine's index, which
 * would be a cycle: the index re-exports this file.
 */
const FOUNDATION_RULES: readonly Rule[] = [SpatialRule, AnimationRule];

/**
 * A Map: initial actor instances as data (GLOSSARY.md), loaded into a World.
 *
 * The only way a project expresses an arrangement of actors — a level, a menu,
 * a HUD. A world may load several.
 */
export interface WorldMap {
  /**
   * How big the map is, in tiles, and how big one tile is.
   *
   * Already in every `.map` file the editor writes — it is what the map
   * editor's Width/Height set — and it used to stop there: `loadMap` took the
   * whole object and read only `actors`, so nothing downstream could ask how
   * big the level was. A camera that keeps the view inside the level is the
   * first thing that needs to (`World.mapBounds`).
   *
   * Optional, because a map block synthesises its placements without one.
   */
  size?: {width: number; height: number};
  tile?: {width: number; height: number};
  actors: Array<{
    type: string;
    /** Stable instance id; a random unique one is assigned when omitted. */
    id?: string;
    /** Overrides keyed by owner id (rule or trait), then property id. */
    properties?: Record<string, Record<string, unknown>>;
  }>;
}

/** Any method name on World — what a recorded call may name. */
type WorldOp = {
  [K in keyof World]: World[K] extends (...args: never[]) => unknown
    ? K
    : never;
}[keyof World];

/** The arguments that method takes. */
type OpArgs<K extends WorldOp> = Parameters<
  Extract<World[K], (...args: never[]) => unknown>
>;

/**
 * One recorded call, name and arguments together.
 *
 * Distributed over the union so the pair stays matched: a `{name, args}` here
 * is always some K's name beside that same K's arguments, never one method's
 * name beside another's.
 */
type OpCall<K extends WorldOp = WorldOp> = K extends WorldOp
  ? {name: K; args: OpArgs<K>}
  : never;

export class WorldBuilder {
  private readonly id: string;
  private readonly name: string;
  private rules: Rule[] = [];
  private readonly hidden = new Set<Rule>();
  private readonly animations: Record<string, AnimationDef> = {};
  // Layers as declared, back to front. Empty until something says otherwise;
  // the World fills in the default layer either way.
  private readonly layers: LayerInit[] = [];
  private readonly types = new Map<string, ActorBuilder>();
  /**
   * Every call made on this description, in order.
   *
   * Order is the whole of the semantics — `add effect` then `remove effect`
   * leaves none, the other way round leaves one — so replay walks it forward
   * and never merges or de-duplicates. The World's own methods are already
   * idempotent where it matters (`addEffect` by path), so nothing here has to
   * be.
   */
  private readonly log: OpCall[] = [];
  /** The live world, once something has needed one. See `getWorld`. */
  private built: World | undefined;

  constructor(opts: {id: string; name: string}) {
    this.id = opts.id;
    this.name = opts.name;
  }

  /**
   * Record a call, and make it now if there is a world to make it on.
   *
   * The single point where the builder's surface meets the World's. `name` is
   * `keyof World`, so a method that does not exist there — or one whose
   * arguments do not match — is a compile error rather than a TypeError in a
   * learner's game, which is what the old hand-written `if (this.built)` pairs
   * kept producing.
   */
  private defer<K extends WorldOp>(name: K, ...args: OpArgs<K>): this {
    const call = {name, args} as OpCall;
    this.log.push(call);
    if (this.built) {
      apply(this.built, call);
    }
    return this;
  }

  /**
   * Refuse a declaration the actors already placed could not be given.
   *
   * Blocks can be reordered in the workspace, so `use rule` below `load map` is
   * a mistake a learner can make by dragging.
   *
   * When the world exists but is EMPTY the declaration is still in time, and
   * the world is thrown away rather than refused — the log makes rebuilding it
   * exact. That matters because reading a camera or the actor list builds a
   * world (`camera`, `actors`), and a read has never been the thing that makes
   * a later declaration unsafe.
   */
  private requireNoActors(what: string): void {
    if (!this.built) {
      return;
    }
    if (this.built.actorCount() > 0) {
      throw new Error(
        `World '${this.id}': ${what} must come before the actors are placed ` +
          `(move it above "load map" / "add actor").`,
      );
    }
    // Empty: nothing has been built under the old laws, so start over. Anything
    // holding the discarded world (a Camera read out of it) is now looking at a
    // world nothing else refers to — see `camera`.
    this.built = undefined;
  }

  useRules(rules: Rule[]): this {
    this.requireNoActors('use rule');
    this.rules = [...this.rules, ...rules];
    return this;
  }

  /** Mark a rule hidden in the simple view (still active at runtime). */
  hideRule(rule: Rule): this {
    this.hidden.add(rule);
    return this;
  }

  /** Whether a rule is marked hidden (for the interface layer). */
  isHidden(rule: Rule): boolean {
    return this.hidden.has(rule);
  }

  /**
   * Register animations (typically from imported `.anim` files) by id, in
   * addition to the stock animations the active rules ship.
   */
  useAnimations(defs: Record<string, AnimationDef>): this {
    this.requireNoActors('use animations');
    Object.assign(this.animations, defs);
    return this;
  }

  /**
   * Declare a layer, at the back of the stack as it stands.
   *
   * Declaration order IS draw order (core/Layer), so this is one of the calls
   * that must come before the actors: a layer added afterwards would have to be
   * spliced into a scene graph the driver has already made, and the ordering a
   * learner can see in their blocks would stop being the ordering they get.
   */
  defineLayer(layer: LayerInit): this {
    this.requireNoActors('define layer');
    this.layers.push(layer);
    return this;
  }

  /**
   * Register an actor template under the name a Map refers to it by.
   *
   * Declarative — it records a template rather than placing anything — so it
   * may come before or after the world is built.
   */
  define(type: string, builder: ActorBuilder): this {
    this.types.set(type, builder);
    return this;
  }

  // The rest is the World's surface, deferred. Each is one line on purpose:
  // the doc comment says what the block means here, `World`'s says what the
  // call does, and there is no third thing to keep in step.

  /**
   * Handle a world event. See {@link World.on}.
   *
   * Deferred like everything else, so a `when ⟨space⟩ is pressed` hat at module
   * scope in a `.world` file registers on the world this describes — `world` is
   * this builder there, and the same call has to be right in a handler too.
   */
  on(event: GameEvent, handler: WorldEventHandler): this {
    return this.defer('on', event, handler);
  }

  /** Set a world-scoped property. See {@link World.set}. */
  set<T>(property: Property<T>, value: T): this {
    return this.defer('set', property as Property<unknown>, value);
  }

  /**
   * Play an effect across the whole viewport. See {@link World.addEffect}.
   *
   * The World counterpart to `ActorBuilder.addEffect`: that one filters one
   * actor's own pixels, this one filters everything the camera has drawn — the
   * underwater distortion covering the whole view, rather than a wobble on one
   * fish. Same document, same parameters; only the surface it lands on differs.
   */
  addEffect(
    path: string,
    document: EffectDocument,
    values?: AppliedEffectSpec['values'],
  ): this {
    return this.defer('addEffect', path, document, values);
  }

  /** Stop an effect covering the whole view. See {@link World.removeEffect}. */
  removeEffect(path: string): this {
    return this.defer('removeEffect', path);
  }

  /** Draw an image behind everything (BACKGROUNDS.md). */
  setBackground(sprite: string | undefined, layer = DEFAULT_LAYER_ID): this {
    return this.defer('setBackground', sprite, layer);
  }

  /** Draw an image in front of a layer's actors. See {@link World.setForeground}. */
  setForeground(sprite: string | undefined, layer = DEFAULT_LAYER_ID): this {
    return this.defer('setForeground', sprite, layer);
  }

  /** Set the colour behind the backdrop. See {@link World.setBackgroundColor}. */
  setBackgroundColor(color: ColorValue): this {
    return this.defer('setBackgroundColor', color);
  }

  /** Slide a layer's background. See {@link World.setBackgroundOffset}. */
  setBackgroundOffset(offset: Vector, layer = DEFAULT_LAYER_ID): this {
    return this.defer('setBackgroundOffset', offset, layer);
  }

  /** Slide a layer's foreground. */
  setForegroundOffset(offset: Vector, layer = DEFAULT_LAYER_ID): this {
    return this.defer('setForegroundOffset', offset, layer);
  }

  /** Tile a layer's background rather than stretching it. */
  setBackgroundRepeat(repeat: boolean, layer = DEFAULT_LAYER_ID): this {
    return this.defer('setBackgroundRepeat', repeat, layer);
  }

  /** Tile a layer's foreground rather than stretching it. */
  setForegroundRepeat(repeat: boolean, layer = DEFAULT_LAYER_ID): this {
    return this.defer('setForegroundRepeat', repeat, layer);
  }

  /**
   * Play an effect on the backdrop's own pixels, not on the whole camera.
   *
   * @param path     the effect's module path (`effects/ripple`)
   * @param document the parsed `.effect` file, imported as JSON by the bundler
   * @param values   values for the effect's declared parameters, by parameter id
   * @param layer    which layer's background; the default is the one the
   *                 blocks address
   */
  addBackgroundEffect(
    path: string,
    document: EffectDocument,
    values?: AppliedEffectSpec['values'],
    layer = DEFAULT_LAYER_ID,
  ): this {
    return this.defer('addBackgroundEffect', path, document, values, layer);
  }

  /** Stop an effect on the backdrop. Removing one not playing is a no-op. */
  removeBackgroundEffect(path: string, layer = DEFAULT_LAYER_ID): this {
    return this.defer('removeBackgroundEffect', path, layer);
  }

  /** Play an effect on a layer's foreground. See {@link World.addForegroundEffect}. */
  addForegroundEffect(
    path: string,
    document: EffectDocument,
    values?: AppliedEffectSpec['values'],
    layer = DEFAULT_LAYER_ID,
  ): this {
    return this.defer('addForegroundEffect', path, document, values, layer);
  }

  /** Stop an effect on a layer's foreground. */
  removeForegroundEffect(path: string, layer = DEFAULT_LAYER_ID): this {
    return this.defer('removeForegroundEffect', path, layer);
  }

  /** Play an effect on a whole layer. See {@link World.addLayerEffect}. */
  addLayerEffect(
    path: string,
    document: EffectDocument,
    values?: AppliedEffectSpec['values'],
    layer = DEFAULT_LAYER_ID,
  ): this {
    return this.defer('addLayerEffect', path, document, values, layer);
  }

  /** Stop an effect on a whole layer. Removing one not playing is a no-op. */
  removeLayerEffect(path: string, layer = DEFAULT_LAYER_ID): this {
    return this.defer('removeLayerEffect', path, layer);
  }

  /** How much of the camera's motion a layer takes. See {@link World.setLayerParallax}. */
  setLayerParallax(parallax: Vector, layer?: string): this {
    return this.defer('setLayerParallax', parallax, layer);
  }

  /** Whether a layer ignores the camera. See {@link World.setLayerFit}. */
  setLayerFit(fit: boolean, layer?: string): this {
    return this.defer('setLayerFit', fit, layer);
  }

  /** Declare a camera. See {@link World.defineCamera}. */
  defineCamera(init: CameraInit): this {
    return this.defer('defineCamera', init);
  }

  /** Take the view through a different camera. See {@link World.setActiveCamera}. */
  setActiveCamera(id: string): this {
    return this.defer('setActiveCamera', id);
  }

  /** Move a camera. See {@link World.setCameraPosition}. */
  setCameraPosition(position: Vector, id?: string): this {
    return this.defer('setCameraPosition', position, id);
  }

  /**
   * A camera by id. See {@link World.camera}.
   *
   * Builds the world, because it hands back an object out of it rather than
   * telling it something — a world body sets things ON a camera (`set actor to
   * follow of ⟨camera ⟨Chase⟩⟩`), and inside `define world` the name `world` is
   * this. A declaration arriving afterwards is still fine while no actor has
   * been placed (`requireNoActors`), though the Camera read here belongs to the
   * world that is then discarded; generated code never holds one across a
   * declaration, since the world root emits every declaration above the body.
   */
  camera(id?: string): Camera {
    return this.getWorld().camera(id);
  }

  /**
   * How big the world is. See {@link World.mapBounds}.
   *
   * Builds the world, because it hands back a value out of it rather than
   * telling it something — the same family as `camera` and `actors`. Read
   * before any map is loaded it is one screen, which is the truth about a world
   * with nothing placed in it.
   */
  mapBounds(): Vector {
    return this.getWorld().mapBounds();
  }

  /** How big the view is. See {@link World.viewSize}. */
  viewSize(): Vector {
    return this.getWorld().viewSize();
  }

  /**
   * The actors in the world, as it stands. See {@link World.actors}.
   *
   * Builds the world for the reason `camera` does. Read before anything is
   * placed this is empty, which is the truth rather than an error: `first actor
   * of type ⟨Player⟩` above `load map` finds none because at that point there
   * are none.
   */
  get actors(): World['actors'] {
    return this.getWorld().actors;
  }

  /**
   * The world this describes, built on first use and returned unchanged after.
   *
   * Memoized on purpose, and the preview depends on it: an unchanged project
   * re-imports to the same module instance, so the same builder hands back the
   * world that is already running, and the preview can tell there is nothing to
   * reload (worldPreviewWorkerManager, specs/EFFECTS_PLAN.md §13).
   */
  getWorld(): World {
    this.built ??= this.instantiate();
    return this.built;
  }

  /**
   * Place one actor now, and hand it back so the caller can set values on it.
   *
   * `layer` names one declared by {@link defineLayer}; omitted, or naming one
   * that is not there, it is the default layer (see `World.addActor`).
   */
  addActor(
    builder: ActorBuilder,
    id?: string,
    type?: string,
    layer?: string,
  ): Actor {
    // Straight through: the live World does the whole job, so one block gets
    // the same behaviour whichever it lands on (see `World.addActor`).
    return this.getWorld().addActor(builder, id, type, layer);
  }

  /**
   * Remove one actor. See {@link World.removeActor}.
   *
   * Direct, not logged, for the reason `addActor` is: actors are not part of
   * the description. `instantiate` replays the log into a world with nothing
   * placed in it, so a recorded removal would be a call about an actor that
   * world never had.
   */
  removeActor(actor: Actor | string): boolean {
    return this.getWorld().removeActor(actor);
  }

  /**
   * Remove every actor. See {@link World.clearActors}.
   *
   * Named as the World names it, because one block calls whichever it lands on:
   * `clear world` generates `world.clearActors()` under `define world` and in a
   * handler alike. It reads as a strange thing to do while describing a world
   * until you want a second map to REPLACE the first rather than stack on it,
   * which is what `loadMap`'s note points at.
   */
  clearActors(): void {
    this.getWorld().clearActors();
  }

  /**
   * Place the actors a Map describes.
   *
   * A world may load several — a level and a HUD, say. Loading is additive, so
   * they stack in call order; `clear()` first to replace rather than add.
   *
   * `layer` puts every actor the map describes into one layer, which is what
   * makes a HUD a HUD: the map is an ordinary map, and the layer it is loaded
   * into is the whole of what makes it an interface (specs/VIEWPORT.md).
   */
  loadMap(map: WorldMap, layer?: string): Actor[] {
    const world = this.getWorld();
    world.growToFit(map);
    const lookup = this.propertyLookup(world);
    const added: Actor[] = [];
    for (const entry of map.actors) {
      const builder = this.types.get(entry.type);
      if (!builder) {
        throw new Error(
          `World '${this.id}': map references unregistered actor type ` +
            `'${entry.type}' (register it with define())`,
        );
      }
      // Stamp the actor's kind with the map's registered type (the module), so
      // "actors of a type" lookups match it regardless of the template's id/name.
      const actor = builder.instantiate(
        this.resolveInstanceId(world, builder, entry.id),
        entry.type,
      );
      for (const [ownerId, props] of Object.entries(entry.properties ?? {})) {
        for (const [propId, value] of Object.entries(props)) {
          const property = lookup.get(`${ownerId}.${propId}`);
          if (property && actor.hasProperty(property)) {
            actor.set(property, value);
          }
        }
      }
      world.addActor(actor, layer);
      added.push(actor);
    }
    return added;
  }

  /**
   * Choose a unique instance id. The requested id (an explicit one, else the
   * builder's) is used verbatim when free. On collision we keep as much of the
   * caller's stability as they gave us: an explicit *base* (e.g. a Blockly
   * block's id, which repeats when its `add` block runs in a loop) is kept and
   * disambiguated with an ordinal (`base`, `base#2`, …), stable as long as the
   * loop is; a bare template id (an anonymous repeat with no stable identity)
   * falls back to a random `type-uuid`.
   */
  private resolveInstanceId(
    world: World,
    builder: ActorBuilder,
    explicitId?: string,
  ): string {
    const base = explicitId ?? builder.id;
    if (!world.hasActor(base)) {
      return base;
    }
    if (explicitId === undefined) {
      return `${builder.id}-${crypto.randomUUID()}`;
    }
    let ordinal = 2;
    while (world.hasActor(`${base}#${ordinal}`)) {
      ordinal += 1;
    }
    return `${base}#${ordinal}`;
  }

  /** Map `${ownerId}.${propId}` -> Property across the world's rules + traits. */
  private propertyLookup(world: World): Map<string, Property> {
    const lookup = new Map<string, Property>();
    const add = (property: Property) =>
      lookup.set(`${property.ownerId}.${property.id}`, property);
    for (const rule of world.activeRules()) {
      for (const property of Object.values(rule.properties)) {
        add(property);
      }
      for (const trait of Object.values(rule.traits)) {
        for (const property of Object.values(trait.properties)) {
          add(property);
        }
      }
    }
    return lookup;
  }

  /**
   * The rules this world runs under: what it asked for, over the foundation.
   *
   * Space and Appearance are not asked for. They are the two the engine
   * provides because a rule CANNOT provide them — a position is not something
   * a rule can invent, and animation reads sprite sheets the language cannot
   * see (builtinMeta) — so no world can meaningfully be without them, and
   * making a learner say `use rule Has Space` is asking them to affirm a
   * tautology before their game will run. `use rule` is left meaning what it
   * says: a mechanic in play, which is a choice.
   *
   * An explicit rule of the same id WINS. That is what keeps the foundation
   * from being a trap: eject Appearance into an authored `.rule` and name it,
   * and the world runs the learner's version rather than silently running the
   * built-in one it shadows.
   */
  private rulesInPlay(): Rule[] {
    const claimed = new Set(this.rules.map(rule => rule.id));
    return [
      ...FOUNDATION_RULES.filter(rule => !claimed.has(rule.id)),
      ...this.rules,
    ];
  }

  /**
   * Build a NEW World from this description: construct, then replay the log.
   *
   * Distinct from `getWorld`, which memoizes: this is for callers that want a
   * throwaway (the thumbnail renderer builds one per picker refresh, and tests
   * build many). Two worlds made this way are independent — the log holds the
   * arguments a call was given, and the World copies what it stores (a Vector,
   * a colour), so replaying it twice shares nothing.
   */
  instantiate(): World {
    const world = new World({
      id: this.id,
      name: this.name,
      rules: this.rulesInPlay(),
      animations: Object.entries(this.animations),
      layers: this.layers.map(layer => ({...layer})),
    });
    for (const call of this.log) {
      apply(world, call);
    }
    return world;
  }
}

/** Make a recorded call on a world. */
function apply(world: World, call: OpCall): void {
  const method = world[call.name] as (...args: unknown[]) => unknown;
  method.apply(world, call.args as unknown[]);
}
