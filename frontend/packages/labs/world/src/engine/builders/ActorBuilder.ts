// Describes an Actor — a set of Traits, initial property values, and event
// handlers — and instantiates it. Applying a trait applies its dependencies and
// adds their properties with defaults (INTERFACE.md); `set` overrides a default,
// `on` registers a handler.

import {Actor} from '../core/Actor';
import {Trait} from '../core/Trait';
import type {EventHandler, GameEvent, Property} from '../core/types';

export class ActorBuilder {
  /** The template's id — the actor's type, and the default instance id. */
  readonly id: string;
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

  /**
   * Create a live Actor from this description. `instanceId` is the unique id the
   * Scene assigns (defaulting to this template's id); this builder's id becomes
   * the actor's `type`. The builder is reusable — each call yields an
   * independent actor, so one template can be spawned many times.
   */
  instantiate(instanceId?: string): Actor {
    return new Actor({
      id: instanceId ?? this.id,
      type: this.id,
      name: this.name,
      traits: [...this.traits],
      overrides: [...this.overrides],
      handlers: [...this.handlers],
    });
  }
}
