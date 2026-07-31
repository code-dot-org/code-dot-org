// An Actor is an entity that can act in the World (GLOSSARY.md). It carries a
// set of Traits (reference-counted, so applying one applies its dependencies),
// a property store keyed by Property identity, and the event handlers it
// elected to respond to. Instances are produced from an ActorBuilder when a
// Scene is assembled.

import {Trait} from './Trait';
import {DependencySet} from './traits';
import type {
  ActorAction,
  AppliedEffectSpec,
  EventHandler,
  GameEvent,
  Property,
  Query,
} from './types';
import {Vector} from './Vector';

/** The data an ActorBuilder hands the Actor constructor. */
export interface ActorInit {
  /** Unique instance id (the Scene assigns it). */
  id: string;
  /** The template this instance was made from; defaults to `id`. */
  type?: string;
  name: string;
  /** Explicitly-applied traits; their dependencies are pulled in implicitly. */
  traits: Trait[];
  /** Initial property values overriding trait defaults. */
  overrides: Array<[Property, unknown]>;
  /** Event handlers the actor registered. */
  handlers: Array<[GameEvent, EventHandler]>;
  /** Effects played on this actor's image, in application order. */
  effects?: AppliedEffectSpec[];
}

// A `vector` (directional) and a `point` (an x/y pair, e.g. scale) are both
// stored as a `Vector`; they differ only in how the editor presents them.
const coerce = <T>(property: Property<T>, value: unknown): T =>
  property.type === 'vector' || property.type === 'point'
    ? (Vector.from(value as Vector) as unknown as T)
    : (value as T);

export class Actor {
  readonly id: string;
  /** The template (ActorBuilder id) this instance came from — a type tag. */
  readonly type: string;
  readonly name: string;
  private readonly membership = new DependencySet<Trait>(
    trait => trait.requiredTraits,
    trait => trait.id,
  );
  private readonly store = new Map<Property, unknown>();
  private readonly handlers = new Map<GameEvent, EventHandler[]>();
  // Held, not interpreted: the engine never looks inside an effect document.
  private readonly appliedEffects: readonly AppliedEffectSpec[];

  constructor(init: ActorInit) {
    this.id = init.id;
    this.type = init.type ?? init.id;
    this.name = init.name;
    for (const trait of init.traits) {
      this.membership.add(trait);
    }
    // Seed the store from every present trait's property defaults, then apply
    // the initial overrides on top.
    for (const trait of this.membership.items()) {
      for (const property of Object.values(trait.properties)) {
        this.store.set(property, coerce(property, property.default));
      }
    }
    for (const [property, value] of init.overrides) {
      this.store.set(property, coerce(property, value));
    }
    for (const [event, handler] of init.handlers) {
      this.on(event, handler);
    }
    this.appliedEffects = init.effects ? [...init.effects] : [];
  }

  get<T>(property: Property<T>): T {
    if (!this.store.has(property)) {
      throw new Error(
        `Actor '${this.id}' has no property '${property.id}' ` +
          `(is trait '${property.ownerId}' applied?)`,
      );
    }
    return this.store.get(property) as T;
  }

  /** Set a property's value; returns `this` so instance setup can chain. */
  set<T>(property: Property<T>, value: T): this {
    this.store.set(property, coerce(property, value));
    return this;
  }

  /** Whether this actor has the given trait (directly or by dependency). */
  has(trait: Trait): boolean {
    return this.membership.has(trait);
  }

  query<T>(query: Query<T>, ...args: unknown[]): T {
    return query.evaluate(this, ...args);
  }

  act(action: ActorAction, ...args: unknown[]): void {
    action.apply(this, ...args);
  }

  on(event: GameEvent, handler: EventHandler): void {
    const list = this.handlers.get(event);
    if (list) {
      list.push(handler);
    } else {
      this.handlers.set(event, [handler]);
    }
  }

  /** Handlers registered for `event`; used by the EventQueue on flush. */
  handlersFor(event: GameEvent): readonly EventHandler[] {
    return this.handlers.get(event) ?? [];
  }

  /** The traits present on this actor, in application order. */
  traits(): readonly Trait[] {
    return this.membership.items();
  }

  /** The effects played on this actor's image, in application order. */
  effects(): readonly AppliedEffectSpec[] {
    return this.appliedEffects;
  }

  /** Whether this actor carries `property` (seeded by one of its traits). */
  hasProperty(property: Property): boolean {
    return this.store.has(property);
  }
}
