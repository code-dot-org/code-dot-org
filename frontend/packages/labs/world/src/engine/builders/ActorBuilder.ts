// Describes an Actor — a set of Traits, initial property values, and event
// handlers — and instantiates it. Applying a trait applies its dependencies and
// adds their properties with defaults (INTERFACE.md); `set` overrides a default,
// `on` registers a handler.

import type {EffectDocument} from '../../effect/model/types';
import {Actor} from '../core/Actor';
import {Trait} from '../core/Trait';
import type {
  AppliedEffectSpec,
  EventHandler,
  GameEvent,
  Property,
} from '../core/types';
import {AppearanceTrait} from '../rules/animation';
import {PositionalTrait} from '../rules/spatial';

/**
 * The traits every actor has whether or not it elects them.
 *
 * The foundation, one level down from `WorldBuilder`'s: the world runs Space
 * and Appearance because a rule cannot provide them, and an actor has their
 * traits because an actor without them is not a simpler actor. "Can Be
 * Positioned" IS what being in the world means — `World.renderSnapshot` skips
 * an actor that lacks it, so such an actor is not invisible, it is absent — and
 * "Has Appearance" is what `set sprite` and `play animation` write to, which
 * are the first two blocks a learner reaches for.
 *
 * The visible behaviour does not change: an actor with no picture was already
 * drawn as a plain rectangle, and still is, because a frame comes from a sprite
 * or an animation and neither is set by default. What changes is that the two
 * blocks work on any actor rather than failing on one that forgot a `use trait`
 * row saying something no actor would say no to.
 *
 * Electing them anyway is allowed and does nothing — `Actor`'s membership is a
 * DependencySet, so a trait is present once however many times it arrives.
 */
const FOUNDATION_TRAITS: readonly Trait[] = [PositionalTrait, AppearanceTrait];

export class ActorBuilder {
  /** The template's id — the actor's type, and the default instance id. */
  readonly id: string;
  private readonly name: string;
  private traits: Trait[] = [];
  private readonly overrides: Array<[Property, unknown]> = [];
  private readonly handlers: Array<[GameEvent, EventHandler]> = [];
  private readonly effects: AppliedEffectSpec[] = [];

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
   * Play an effect on this actor's image (specs/EFFECT_EDITOR.md).
   *
   * Sits beside `useTraits` rather than being one, because an effect is not
   * state the simulation touches: it declares no property and runs no step. The
   * engine only carries it out to `renderSnapshot`; the driver compiles the
   * graph to GLSL and hands it to Phaser as a filter.
   *
   * Named to match `Actor.addEffect`, and identical to it in signature and in
   * behavior. That is what lets ONE Blockly block serve both a template body
   * and an event handler: both bind the identifier `actor`, and the block emits
   * `actor.addEffect(…)` either way. `set` already worked like this; effects
   * differed only by an accident of naming.
   *
   * @param path     the effect's module path (`effects/ripple`) — its identity
   *   for shader registration, so the same effect on many actors is one program
   * @param document the parsed `.effect` file, imported as JSON by the bundler
   * @param values   values for the effect's declared parameters, by parameter
   *   id; anything omitted falls back to that parameter's own default
   */
  addEffect(
    path: string,
    document: EffectDocument,
    values?: Readonly<Record<string, number | number[] | boolean>>,
  ): this {
    // Idempotent by path, as on the live actor: an actor either wears an effect
    // or it does not. A builder is described once so it can hardly matter here,
    // but the two must not disagree — one block calls whichever it lands on.
    if (this.effects.some(effect => effect.path === path)) {
      return this;
    }
    this.effects.push(values ? {path, document, values} : {path, document});
    return this;
  }

  /**
   * Create a live Actor from this description. `instanceId` is the unique id the
   * world assigns (defaulting to this template's id). `type` is the actor's kind
   * — the identity `TouchingQuery` and other "actors of a type" lookups match on;
   * the world passes the module the actor was registered under (`actors/coin`),
   * so a template renamed via its `name` still matches. It defaults to the
   * builder's id when the caller gives none (engine tests, ad-hoc instances). The
   * builder is reusable — each call yields an independent actor, so one template
   * can be spawned many times.
   */
  instantiate(instanceId?: string, type?: string): Actor {
    return new Actor({
      id: instanceId ?? this.id,
      type: type ?? this.id,
      name: this.name,
      traits: [...FOUNDATION_TRAITS, ...this.traits],
      overrides: [...this.overrides],
      handlers: [...this.handlers],
      effects: [...this.effects],
    });
  }
}
