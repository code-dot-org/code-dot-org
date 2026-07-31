// Describes a World and brings it to life: the rules in play, and the actors
// living under them.
//
// There used to be a Scene between these two halves — a World plus the Actors
// in it. It was removed because it never was a separate thing: every method on
// it opened by reaching for the world it held, so it was a partial application
// of world operations rather than an abstraction. What it really owned was the
// actor-type registry that `loadMap` needs, which lives here now.
//
// The two halves run in order, and the boundary is real. Everything declarative
// — rules, property values, animations, effects — describes a world that does
// not exist yet. The first call that needs actors (`loadMap`, `addActor`,
// `clear`, `getWorld`) builds it, and after that the declarative half is closed:
// calling it then would silently do nothing, so it throws instead.

import type {EffectDocument} from '../../effect/model/types';
import type {Actor} from '../core/Actor';
import type {AnimationDef} from '../core/animationTypes';
import type {AppliedEffectSpec, Property, Rule} from '../core/types';
import {World} from '../core/World';

import type {ActorBuilder} from './ActorBuilder';

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
  private readonly types = new Map<string, ActorBuilder>();
  /** The live world, once something has needed one. See `getWorld`. */
  private built: World | undefined;

  constructor(opts: {id: string; name: string}) {
    this.id = opts.id;
    this.name = opts.name;
  }

  /**
   * Refuse a declaration that arrives after the world exists.
   *
   * Blocks can be reordered in the workspace, so `use rule` below `load map` is
   * a mistake a learner can make by dragging. Silently ignoring it would give
   * them a world missing a rule they can plainly see they asked for.
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

  /** Override a world-scoped property's initial value. */
  set<T>(property: Property<T>, value: T): this {
    this.requireUnbuilt(`setting ${property.id}`);
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
   * The World counterpart to `ActorBuilder.useEffect`: that one filters one
   * actor's own pixels, this one filters everything the camera has drawn — the
   * underwater distortion covering the whole view, rather than a wobble on one
   * fish. Same document, same parameters; only the surface it lands on differs.
   *
   * @param path     the effect's module path (`effects/underwater`)
   * @param document the parsed `.effect` file, imported as JSON by the bundler
   * @param values   values for the effect's declared parameters, by parameter id
   */
  useEffect(
    path: string,
    document: EffectDocument,
    values?: AppliedEffectSpec['values'],
  ): this {
    this.requireUnbuilt('use effect');
    this.effects.push(values ? {path, document, values} : {path, document});
    return this;
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
   * Place one actor now, and hand it back so the caller can set values on it.
   */
  addActor(builder: ActorBuilder, id?: string, type?: string): Actor {
    const world = this.getWorld();
    const actor = builder.instantiate(
      this.resolveInstanceId(world, builder, id),
      type,
    );
    world.addActor(actor);
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
   */
  loadMap(map: WorldMap): Actor[] {
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
      world.addActor(actor);
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
      rules: [...this.rules],
      overrides: [...this.overrides],
      animations: Object.entries(this.animations),
      effects: [...this.effects],
    });
  }
}
