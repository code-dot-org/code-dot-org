// Describes a World and brings it to life: the rules in play, and the actors
// living under them.
//
// There used to be a Scene between these two halves — a World plus the Actors
// in it. It was removed because it never was a separate thing: every method on
// it opened by reaching for the world it held, so it was a partial application
// of world operations rather than an abstraction. What it really owned was the
// actor-type registry that `loadMap` needs, which lives here now.
//
// The first call that needs actors (`loadMap`, `addActor`, `clear`, `getWorld`)
// builds the World. What that means for a call arriving afterwards depends on
// the call, and the test is whether the live World can still answer it:
//
//   - `set` and `addEffect` have exact counterparts on `World`, so they FORWARD.
//     Both are also blocks that a learner can place in an event handler, where
//     they land on the live world and mean the same thing; making them care
//     where they sit inside a `.world` file would be an arbitrary rule.
//   - `useRules` and `useAnimations` have none. Rules decide trait membership
//     for every actor, and the animation registry is seeded once at
//     construction, so neither can be applied to a world that already exists.
//     They THROW, because silently doing nothing is worse.

import type {EffectDocument} from '../../effect/model/types';
import type {Actor} from '../core/Actor';
import type {AnimationDef} from '../core/animationTypes';
import {rgba, type ColorValue, type Rgba} from '../core/color';
import {DEFAULT_LAYER_ID, type LayerInit} from '../core/Layer';
import type {AppliedEffectSpec, Property, Rule} from '../core/types';
import {World, type BackdropState} from '../core/World';
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
  actors: Array<{
    type: string;
    /** Stable instance id; a random unique one is assigned when omitted. */
    id?: string;
    /** Overrides keyed by owner id (rule or trait), then property id. */
    properties?: Record<string, Record<string, unknown>>;
  }>;
}

export class WorldBuilder {
  private readonly id: string;
  private readonly name: string;
  private rules: Rule[] = [];
  private readonly hidden = new Set<Rule>();
  private readonly overrides: Array<[Property, unknown]> = [];
  private readonly animations: Record<string, AnimationDef> = {};
  private readonly effects: AppliedEffectSpec[] = [];
  // Backdrop layers as described, back to front. Empty until something says
  // otherwise; the World fills in the default layer either way.
  // Backgrounds as described, by the layer each belongs to. Empty until
  // something says otherwise; the World gives every layer an empty slot.
  private readonly backgrounds = new Map<
    string,
    BackdropState & {effects: AppliedEffectSpec[]}
  >();
  /** The same for what each layer draws in front of its actors. */
  private readonly foregrounds = new Map<
    string,
    BackdropState & {effects: AppliedEffectSpec[]}
  >();
  /** The one colour behind everything, if it was set before the world existed. */
  private clearColor: Rgba | undefined;
  // Layers as declared, back to front. Empty until something says otherwise;
  // the World fills in the default layer either way.
  private readonly layers: LayerInit[] = [];
  private readonly types = new Map<string, ActorBuilder>();
  /** The live world, once something has needed one. See `getWorld`. */
  private built: World | undefined;

  constructor(opts: {id: string; name: string}) {
    this.id = opts.id;
    this.name = opts.name;
  }

  /**
   * Refuse a declaration the live world could not be given after the fact.
   *
   * Only for the two that have no counterpart on `World` — see the note at the
   * top. Blocks can be reordered in the workspace, so `use rule` below
   * `load map` is a mistake a learner can make by dragging, and silently
   * ignoring it would give them a world missing a rule they can plainly see
   * they asked for.
   */
  private requireUnbuilt(what: string): void {
    if (this.built) {
      throw new Error(
        `World '${this.id}': ${what} must come before the actors are placed ` +
          `(move it above "load map" / "add actor").`,
      );
    }
  }

  useRules(rules: Rule[]): this {
    this.requireUnbuilt('use rule');
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
   * Set a world-scoped property.
   *
   * Before the world is built this is its initial value; after, it is a plain
   * assignment on the live world, which is what `World.set` does anyway. The
   * generated `set …` blocks emit `world.set(…)` in a `.world` body and in an
   * event handler alike, so the two must agree — the same reason `set position`
   * works on an actor template and a live actor both.
   */
  set<T>(property: Property<T>, value: T): this {
    if (this.built) {
      this.built.set(property, value);
      return this;
    }
    this.overrides.push([property, value]);
    return this;
  }

  /**
   * Register animations (typically from imported `.anim` files) by id, in
   * addition to the stock animations the active rules ship.
   */
  useAnimations(defs: Record<string, AnimationDef>): this {
    this.requireUnbuilt('use animations');
    Object.assign(this.animations, defs);
    return this;
  }

  /**
   * Play an effect across the whole viewport (specs/EFFECT_EDITOR.md).
   *
   * The World counterpart to `ActorBuilder.addEffect`: that one filters one
   * actor's own pixels, this one filters everything the camera has drawn — the
   * underwater distortion covering the whole view, rather than a wobble on one
   * fish. Same document, same parameters; only the surface it lands on differs.
   *
   * Named to match `World.addEffect` so one Blockly block covers both: in a
   * `.world` file `world` is this builder, in an event handler it is the live
   * World, and `world.addEffect(…)` is right in both places. Once the world
   * exists this forwards to it, for the same reason — a viewport filter has no
   * relationship to the actors, so where the block sits relative to `load map`
   * must not decide whether it works.
   *
   * @param path     the effect's module path (`effects/underwater`)
   * @param document the parsed `.effect` file, imported as JSON by the bundler
   * @param values   values for the effect's declared parameters, by parameter id
   */
  addEffect(
    path: string,
    document: EffectDocument,
    values?: AppliedEffectSpec['values'],
  ): this {
    if (this.built) {
      this.built.addEffect(path, document, values);
      return this;
    }
    // Idempotent by path, matching the live World — see ActorBuilder.addEffect.
    if (this.effects.some(effect => effect.path === path)) {
      return this;
    }
    this.effects.push(values ? {path, document, values} : {path, document});
    return this;
  }

  /**
   * Draw an image behind everything (BACKGROUNDS.md).
   *
   * Forwards once the world exists, for the reason `set` and `addEffect` do:
   * `set background to …` is a block a learner can place under `define world`
   * or in an event handler, `world` is this builder in one and the live World in
   * the other, and the same call has to be right in both.
   */
  setBackground(sprite: string | undefined, layer = DEFAULT_LAYER_ID): this {
    if (this.built) {
      this.built.setBackground(sprite, layer);
      return this;
    }
    this.backdropAt(layer).sprite = sprite;
    return this;
  }

  /** Draw an image in front of a layer's actors. See {@link World.setForeground}. */
  setForeground(sprite: string | undefined, layer = DEFAULT_LAYER_ID): this {
    if (this.built) {
      this.built.setForeground(sprite, layer);
      return this;
    }
    this.slotAt(this.foregrounds, layer).sprite = sprite;
    return this;
  }

  /** Set the colour behind the backdrop. See {@link World.setBackgroundColor}. */
  setBackgroundColor(color: ColorValue): this {
    if (this.built) {
      this.built.setBackgroundColor(color);
      return this;
    }
    this.clearColor = rgba(color);
    return this;
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
    if (this.built) {
      this.built.addBackgroundEffect(path, document, values, layer);
      return this;
    }
    // Idempotent by path, matching the live World — see World.addEffect.
    const effects = this.backdropAt(layer).effects;
    if (effects.some(effect => effect.path === path)) {
      return this;
    }
    effects.push(values ? {path, document, values} : {path, document});
    return this;
  }

  /** Stop an effect on the backdrop. Removing one not playing is a no-op. */
  removeBackgroundEffect(path: string, layer = DEFAULT_LAYER_ID): this {
    if (this.built) {
      this.built.removeBackgroundEffect(path, layer);
      return this;
    }
    const effects = this.backdropAt(layer).effects;
    const index = effects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      effects.splice(index, 1);
    }
    return this;
  }

  /**
   * The described background of a layer, made on first use.
   *
   * Keyed by layer id, so a background set before its `define layer` is emitted
   * still lands on the right layer — and one naming a layer that never existed
   * is simply never applied (`World`'s constructor drops it).
   */
  private backdropAt(layer: string): BackdropState & {
    effects: AppliedEffectSpec[];
  } {
    return this.slotAt(this.backgrounds, layer);
  }

  private slotAt(
    slots: Map<string, BackdropState & {effects: AppliedEffectSpec[]}>,
    layer: string,
  ): BackdropState & {effects: AppliedEffectSpec[]} {
    let slot = slots.get(layer);
    if (!slot) {
      slot = {effects: [], offset: {x: 0, y: 0}, repeat: false};
      slots.set(layer, slot);
    }
    return slot;
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
   * Register an actor template under the name a Map refers to it by.
   *
   * Declarative — it records a template rather than placing anything — so it
   * may come before or after the world is built.
   */
  define(type: string, builder: ActorBuilder): this {
    this.types.set(type, builder);
    return this;
  }

  /**
   * Declare a layer, at the back of the stack as it stands.
   *
   * Declaration order IS draw order (core/Layer), so this is one of the calls
   * that must come before the world is built: a layer added afterwards would
   * have to be spliced into a scene graph the driver has already made, and the
   * ordering a learner can see in their blocks would stop being the ordering
   * they get.
   */
  defineLayer(layer: LayerInit): this {
    this.requireUnbuilt('define layer');
    this.layers.push(layer);
    return this;
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
    const world = this.getWorld();
    const actor = builder.instantiate(
      this.resolveInstanceId(world, builder, id),
      type,
    );
    world.addActor(actor, layer);
    return actor;
  }

  /** Remove every actor. */
  clear(): void {
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
   * Build a NEW World from this description.
   *
   * Distinct from `getWorld`, which memoizes: this is for callers that want a
   * throwaway (the thumbnail renderer builds one per picker refresh, and tests
   * build many).
   */
  instantiate(): World {
    return new World({
      id: this.id,
      name: this.name,
      rules: this.rulesInPlay(),
      overrides: [...this.overrides],
      animations: Object.entries(this.animations),
      effects: [...this.effects],
      clearColor: this.clearColor,
      backgrounds: Object.fromEntries(
        [...this.backgrounds].map(([id, slot]) => [id, {...slot}]),
      ),
      foregrounds: Object.fromEntries(
        [...this.foregrounds].map(([id, slot]) => [id, {...slot}]),
      ),
      layers: this.layers.map(layer => ({...layer})),
    });
  }
}
