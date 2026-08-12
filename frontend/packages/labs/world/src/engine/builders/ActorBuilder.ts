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
  PropertyType,
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

/**
 * The same list as ids, for the editor.
 *
 * A dropdown cannot hold a `Trait` — it holds `<RuleName>#<exportName>`, which
 * is a fact about the rule that declares the trait rather than about the trait
 * object — so the editor matches on the id and builds its own values from the
 * rule metadata (blockly/foundation). Exported from here so there is still ONE
 * list: add a third foundation trait and the dropdown stops offering it in the
 * same commit.
 */
export const FOUNDATION_TRAIT_IDS: readonly string[] = FOUNDATION_TRAITS.map(
  trait => trait.id,
);

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

  /**
   * Named to match `Actor.addTrait` / `Actor.removeTrait`, and for the reason
   * `addEffect` gives: ONE Blockly block serves a template body and an event
   * handler, both bind the identifier `actor`, and the block emits
   * `actor.addTrait(…)` either way. Without these, dragging the block above the
   * handlers rather than inside one is `actor.addTrait is not a function`.
   *
   * On a template they describe what every instance is MADE with, so removing
   * one it never elected does nothing — the same silence the live actor gives.
   */
  addTrait(trait: Trait): this {
    return this.useTraits([trait]);
  }

  removeTrait(trait: Trait): this {
    // A trait that does not exist matches nothing and removes nothing. Reading
    // `.id` off it here would stop the game the way it used to (`core/Traited`
    // explains); the complaint comes from there, when the template is built.
    if (!trait) {
      return this;
    }
    // Every election of it, not just the last: `useTraits` appends, so a
    // template that elected a trait twice has it twice, and taking it away
    // once and leaving a copy is not a thing a learner can see or reason about.
    this.traits = this.traits.filter(held => held?.id !== trait.id);
    return this;
  }

  /** Override a trait property's initial value for this actor. */
  set<T>(property: Property<T>, value: T): this {
    this.overrides.push([property, value]);
    return this;
  }

  /**
   * Declare a property this KIND of actor carries, owned by no trait.
   *
   * The shorthand for state that needs no mechanic around it — when a Player
   * last fired, how much ammo it has — where declaring a trait would mean
   * declaring a rule in a file of its own. `Traited` already takes slots from
   * two places, a trait's defaults and the overrides, so this is the second of
   * those and not a third way for a slot to exist: the property is made here
   * and immediately overridden with its own default, which is what puts the
   * slot on every instance.
   *
   * NOT a synthesized trait, though that would also have worked. A trait is
   * something elected, that several kinds of actor may share and that
   * `has trait` can ask about — none of which is true here. Inventing one to
   * satisfy a factory signature would put a trait the learner never wrote into
   * `traits()` and into anything that introspects membership.
   *
   * Returns the property so the caller can read and write it; generated actor
   * modules bind it to a const and their handlers close over it.
   */
  defineProperty<T>(
    id: string,
    type: PropertyType,
    defaultValue: T,
    opts: {readonly?: boolean; name?: string} = {},
  ): Property<T> {
    const property: Property<T> = {
      id,
      type,
      default: defaultValue,
      readonly: opts.readonly ?? false,
      name: opts.name,
      scope: 'actor',
      // The actor kind that declared it, which is what an error about a missing
      // slot needs to name. There is no trait to point at, and `ownerKind` is
      // what says so rather than leaving a reader to infer it from the id.
      ownerId: this.id,
      ownerKind: 'actor',
    };
    this.overrides.push([property, defaultValue]);
    return property;
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
    // One per path, as on the live actor: an actor either wears an effect or it
    // does not. And RETUNING one retunes it — the second call wins — because
    // the alternative is that `add effect ⟨Ripple⟩ with ⟨strength⟩` means
    // something different under `define actor` than it does in a handler, and
    // one Blockly block emits both.
    //
    // The builder used to keep the FIRST spec while `Actor.addEffect` replaced
    // it, under a comment claiming the two agreed. They did not: a retune was
    // silently dropped in a template body and honoured a moment later at
    // runtime. `World`/`WorldBuilder` had the same split and the same comment.
    const spec = values ? {path, document, values} : {path, document};
    const at = this.effects.findIndex(effect => effect.path === path);
    if (at >= 0) {
      // In place, so the effect keeps its position in the application order —
      // retuning one should not move it above or below the others.
      this.effects[at] = spec;
      return this;
    }
    this.effects.push(spec);
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
