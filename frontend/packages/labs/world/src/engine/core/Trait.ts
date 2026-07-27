// A Trait is applied to an Actor and determines how it interacts with the World
// (GLOSSARY.md). It is created by `RuleBuilder.addTrait`, then described in place
// — `requires`, `addProperty`, `addAction`, `addQuery` — and frozen when the
// owning rule is built. The object the builder returns and `rule.traits.<id>`
// are the same reference, so a learner can export and reuse either.

import type {Actor} from './Actor';
import type {ActorAction, Property, PropertyType, Query} from './types';

function frozenError(id: string): never {
  throw new Error(`Trait '${id}' is already built and cannot be modified`);
}

export class Trait {
  readonly id: string;
  readonly name: string;
  /** The Rule that declared this trait (property/action ownership). */
  readonly ruleId: string;
  readonly properties: Record<string, Property> = {};
  readonly actions: Record<string, ActorAction> = {};
  readonly queries: Record<string, Query> = {};
  requiredTraits: Trait[] = [];
  private frozen = false;

  constructor(opts: {id: string; name: string}, ruleId: string) {
    this.id = opts.id;
    this.name = opts.name;
    this.ruleId = ruleId;
  }

  /** Declare traits this one depends on; applying it applies them too. */
  requires(traits: Trait[]): this {
    if (this.frozen) {
      frozenError(this.id);
    }
    this.requiredTraits = [...this.requiredTraits, ...traits];
    return this;
  }

  /** Add an actor-scoped property with a default value. */
  addProperty<T>(
    id: string,
    type: PropertyType,
    defaultValue: T,
    opts: {readonly?: boolean; name?: string} = {},
  ): Property<T> {
    if (this.frozen) {
      frozenError(this.id);
    }
    const property: Property<T> = {
      id,
      type,
      default: defaultValue,
      readonly: opts.readonly ?? false,
      name: opts.name,
      scope: 'actor',
      ownerId: this.id,
    };
    this.properties[id] = property as Property;
    return property;
  }

  /** Add an actor-scoped action (a mutator that returns nothing). */
  addAction(
    id: string,
    apply: (actor: Actor, ...args: unknown[]) => void,
    opts: {name?: string} = {},
  ): ActorAction {
    if (this.frozen) {
      frozenError(this.id);
    }
    const action: ActorAction = {id, name: opts.name, ownerId: this.id, apply};
    this.actions[id] = action;
    return action;
  }

  /** Add an actor-scoped query (a read that returns a value). */
  addQuery<T>(
    id: string,
    evaluate: (actor: Actor) => T,
    opts: {name?: string} = {},
  ): Query<T> {
    if (this.frozen) {
      frozenError(this.id);
    }
    const query: Query<T> = {id, name: opts.name, ownerId: this.id, evaluate};
    this.queries[id] = query as Query;
    return query;
  }

  /** Called by `RuleBuilder.build`; no further description is allowed after. */
  freeze(): void {
    this.frozen = true;
  }
}
