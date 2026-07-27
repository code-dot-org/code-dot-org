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

  /** Register an actor type so `populate` can instantiate it by name. */
  define(type: string, builder: ActorBuilder): this {
    this.types.set(type, builder);
    return this;
  }

  /** Instantiate an actor, add it to the world, and return it. */
  addActor(builder: ActorBuilder): Actor {
    const world = this.requireWorld();
    const actor = builder.instantiate();
    world.addActor(actor);
    return actor;
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
      const actor = builder.instantiate();
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
