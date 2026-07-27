// Describes an Actor — a set of Traits, initial property values, and event
// handlers — and instantiates it. Applying a trait applies its dependencies and
// adds their properties with defaults (INTERFACE.md); `set` overrides a default,
// `on` registers a handler.

import {Actor} from '../core/Actor';
import {Trait} from '../core/Trait';
import type {EventHandler, GameEvent, Property} from '../core/types';

export class ActorBuilder {
  private readonly id: string;
  private readonly name: string;
  private traits: Trait[] = [];
  private readonly overrides: Array<[Property, unknown]> = [];
  private readonly handlers: Array<[GameEvent, EventHandler]> = [];

  constructor(opts: {id: string; name: string}) {
    this.id = opts.id;
    this.name = opts.name;
  }

  useTraits(traits: Trait[]): this {
    this.traits = [...this.traits, ...traits];
    return this;
  }

  /** Override a trait property's initial value for this actor. */
  set<T>(property: Property<T>, value: T): this {
    this.overrides.push([property, value]);
    return this;
  }

  /** Respond to an event raised for this actor. */
  on(event: GameEvent, handler: EventHandler): this {
    this.handlers.push([event, handler]);
    return this;
  }

  /** Create a live Actor from this description. */
  instantiate(): Actor {
    return new Actor({
      id: this.id,
      name: this.name,
      traits: [...this.traits],
      overrides: [...this.overrides],
      handlers: [...this.handlers],
    });
  }
}
