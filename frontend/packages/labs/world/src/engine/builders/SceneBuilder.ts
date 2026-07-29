// Assembles a Scene: a World and the Actors living in it (INTERFACE.md "Where
// the World defines the rules, the Scene defines what's living in that world").
// `useWorld` instantiates the world and returns it; `addActor` instantiates an
// actor, adds it to the world, and returns it (so the caller can set initial
// values). `populate` instantiates actors from a Map (data), using types
// registered with `define`.

import type {Actor} from '../core/Actor';
import type {Property} from '../core/types';
import type {World} from '../core/World';

import type {ActorBuilder} from './ActorBuilder';
import type {WorldBuilder} from './WorldBuilder';

/** A Map: initial actor instances as data (GLOSSARY.md), loadable into a Scene. */
export interface SceneMap {
  actors: Array<{
    type: string;
    /** Stable instance id; a random unique one is assigned when omitted. */
    id?: string;
    /** Overrides keyed by owner id (rule or trait), then property id. */
    properties?: Record<string, Record<string, unknown>>;
  }>;
}

export class SceneBuilder {
  readonly id: string;
  readonly name: string;
  private world: World | undefined;
  private readonly types = new Map<string, ActorBuilder>();

  constructor(opts: {id: string; name: string}) {
    this.id = opts.id;
    this.name = opts.name;
  }

  private requireWorld(): World {
    if (!this.world) {
      throw new Error(
        `Scene '${this.id}': call useWorld() before adding actors`,
      );
    }
    return this.world;
  }

  /** Instantiate the scene's world and return it. */
  useWorld(builder: WorldBuilder): World {
    this.world = builder.instantiate();
    return this.world;
  }

  /** The scene's world (throws if `useWorld` has not been called). */
  getWorld(): World {
    return this.requireWorld();
  }

  /** Register an actor type so `populate` can instantiate it by name. */
  define(type: string, builder: ActorBuilder): this {
    this.types.set(type, builder);
    return this;
  }

  /**
   * Instantiate an actor from `builder`, add it to the world, and return the
   * live instance so the caller can `.set()` per-instance properties on it
   * (chainable): `scene.addActor(Coin, 'coin-a').set(PositionProperty, ...)`.
   *
   * The instance `id` is the one given, else the builder's id when it is free,
   * else a random unique id (`type-uuid`). So a lone actor keeps a stable,
   * readable id (a scene rebuild reconciles it live), while repeated spawns of
   * one template each get their own id and simply restart the scene. Scene tools
   * (map editors, the Blockly scene editor) pass explicit ids to pin identity.
   *
   * `type` is the actor's kind for "actors of a type" lookups (e.g. touching);
   * scene tools pass the module the actor came from (`actors/coin`). It defaults
   * to the builder's id.
   */
  addActor(builder: ActorBuilder, id?: string, type?: string): Actor {
    const world = this.requireWorld();
    const actor = builder.instantiate(
      this.resolveInstanceId(world, builder, id),
      type,
    );
    world.addActor(actor);
    return actor;
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

  /** Remove every actor from the scene's world. */
  clear(): void {
    this.requireWorld().clearActors();
  }

  /**
   * Instantiate the actors described by a Map. Each entry names a registered
   * type and, optionally, property overrides keyed by owner id then property
   * id — resolved against the world's active rules and their traits.
   */
  populate(map: SceneMap): Actor[] {
    const world = this.requireWorld();
    const lookup = this.propertyLookup(world);
    const added: Actor[] = [];
    for (const entry of map.actors) {
      const builder = this.types.get(entry.type);
      if (!builder) {
        throw new Error(
          `Scene '${this.id}': map references unregistered actor type ` +
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
}
