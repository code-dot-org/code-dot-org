// An Actor is an entity that can act in the World (GLOSSARY.md). It carries a
// set of Traits (reference-counted, so applying one applies its dependencies),
// a property store keyed by Property identity, and the event handlers it
// elected to respond to. Instances are produced from an ActorBuilder when a
// world places them.

import {fnv1a} from './hash';
import {Trait} from './Trait';
import {Traited} from './Traited';
import type {
  ActorAction,
  AppliedEffectSpec,
  EventHandler,
  GameEvent,
  Property,
  Query,
} from './types';
import type {World} from './World';

/** The data an ActorBuilder hands the Actor constructor. */
export interface ActorInit {
  /** Unique instance id (the world assigns it as it places the actor). */
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

export class Actor {
  /**
   * The world this actor is in, set when it is placed.
   *
   * An actor-scoped action or query is invoked as `(actor, …args)` — the engine
   * has no world to hand it — so without this, a body inside a trait could not
   * reach the other actors. "Is this one standing on any ground?" is a question
   * about the world, asked of an actor, and it was unaskable.
   *
   * Undefined until `World.addActor` places it, which is also the only thing
   * that sets it: an actor belongs to one world at a time, and it is the world
   * that decides.
   */
  world: World | undefined;

  /**
   * The layer this actor is drawn in, set when it is placed.
   *
   * Set by the same call and for the same reason as {@link world}: placement is
   * what decides both. Undefined until placed, and the world's default layer
   * whenever nothing said otherwise — never "no layer", which would make every
   * question about layers have two answers (core/Layer).
   */
  layer: string | undefined;

  /**
   * The world's clock when this actor was placed — the zero its age counts from.
   *
   * Set by the same call as {@link world} and {@link layer}, for the same
   * reason. Zero rather than undefined before placement, so an actor described
   * in a `.world` file (placed before the first tick) is as old as the game
   * is — which is the answer a learner expects for something that has been
   * there the whole time.
   */
  bornAt = 0;

  readonly id: string;
  /** The template (ActorBuilder id) this instance came from — a type tag. */
  readonly type: string;
  readonly name: string;
  /** Its traits, and a slot for every property they declare (core/Traited). */
  private readonly traited: Traited;
  private readonly handlers = new Map<GameEvent, EventHandler[]>();
  // Held, not interpreted: the engine never looks inside an effect document.
  // Mutable because effects can be added and removed while the game runs — the
  // driver re-reads this list every frame through `renderSnapshot`.
  private readonly appliedEffects: AppliedEffectSpec[];

  constructor(init: ActorInit) {
    this.id = init.id;
    this.type = init.type ?? init.id;
    this.name = init.name;
    this.traited = new Traited(
      `Actor '${init.id}'`,
      init.traits,
      init.overrides,
    );
    for (const [event, handler] of init.handlers) {
      this.on(event, handler);
    }
    this.appliedEffects = init.effects ? [...init.effects] : [];
  }

  get<T>(property: Property<T>): T {
    return this.traited.get(property);
  }

  /**
   * Set a property's value; returns `this` so instance setup can chain.
   *
   * A watched property (`watchProperty`) is read back after the write and the
   * watchers told what changed. Read BACK rather than passing `value` on,
   * because `Traited.set` coerces and a watcher comparing the two must be
   * comparing stored values or it will see changes that did not happen.
   *
   * Unwatched — which is every property but one, and the case this is on the
   * hot path for — costs one field read.
   */
  set<T>(property: Property<T>, value: T): this {
    const watchers = property.watch;
    if (!watchers) {
      this.traited.set(property, value);
      return this;
    }
    const previous = this.traited.get(property);
    this.traited.set(property, value);
    const next = this.traited.get(property);
    for (const watcher of watchers) {
      watcher(this, previous, next);
    }
    return this;
  }

  /** Whether this actor has the given trait (directly or by dependency). */
  has(trait: Trait): boolean {
    return this.traited.has(trait);
  }

  /**
   * How many game seconds this actor has existed for.
   *
   * The question a spawned thing has to be able to answer about itself: a
   * bullet that removes itself after two seconds, a spark that fades, a shield
   * that lapses. Written from the world's clock rather than counted up in a
   * step, so it costs nothing per frame and is right for an actor whose rules
   * do not include a step at all.
   *
   * Zero for an actor no world holds — one made but never placed, or one
   * already removed. Not an error: asking a thing that is not in the world how
   * long it has been in the world has a true answer, and it is none.
   */
  age(): number {
    return this.world ? this.world.time() - this.bornAt : 0;
  }

  /**
   * Elect a trait while the game runs, or drop one — see `core/Traited`, which
   * owns both and explains why a dropped trait leaves its properties behind.
   *
   * Returns `this` so a step can chain, matching `set` and `addEffect`.
   */
  addTrait(trait: Trait): this {
    this.traited.addTrait(trait);
    return this;
  }

  removeTrait(trait: Trait): this {
    this.traited.removeTrait(trait);
    return this;
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

  /**
   * What this actor responds to, and with what — one `<event>@<hash of the
   * handler's source>` per registered handler, in the order they will run.
   *
   * For `World.snapshot`, so the hot-reload reconciler can see a handler being
   * added, removed, reordered or REWRITTEN. Nothing else in the snapshot says a
   * handler exists: an actor that gains a `when tapped` block has the same
   * traits, properties and effects it had a moment ago, so without this the
   * reconciler reads the rebuild as "nothing structural changed", patches the
   * running world, and the actors keep the handlers `ActorBuilder.instantiate`
   * copied into them — a deleted block that still fires.
   *
   * The source text, because that is the only handle a compiled closure gives
   * us and it is a good one: it changes when the block's body changes, so
   * editing what a handler DOES restarts the game too. Its limit is what
   * `Function.prototype.toString` cannot see — a value the handler closes over
   * rather than inlines reads as the same handler. Blockly inlines its
   * arguments, so that is a narrow gap in practice.
   */
  handlerIds(): string[] {
    const ids: string[] = [];
    for (const [event, handlers] of this.handlers) {
      for (const handler of handlers) {
        ids.push(`${event.ownerId}.${event.id}@${fnv1a(handler.toString())}`);
      }
    }
    return ids;
  }

  /** The traits present on this actor, in application order. */
  traits(): readonly Trait[] {
    return this.traited.traits();
  }

  /** The effects played on this actor's image, in application order. */
  effects(): readonly AppliedEffectSpec[] {
    return this.appliedEffects;
  }

  /**
   * Start playing an effect on this actor, now — or retune one already playing.
   *
   * One entry per path, always: an actor either wears an effect or it does not,
   * so this never stacks. That is what makes it safe in an event that fires
   * every frame while a condition holds — "while hurt, glow" would otherwise
   * add a filter per frame until the frame rate died.
   *
   * But adding an effect already present is NOT a no-op, because the values may
   * differ. `add effect Tint` with a random color behind it means a new color
   * each time the handler runs, and returning early there would leave the first
   * color on screen forever with nothing to show why. Same effect, same single
   * filter, new settings.
   *
   * The driver notices on its next frame (it reconciles this list against what
   * is attached to the Game Object), so nothing here touches Phaser.
   */
  addEffect(
    path: string,
    document: AppliedEffectSpec['document'],
    values?: AppliedEffectSpec['values'],
  ): this {
    const spec = values ? {path, document, values} : {path, document};
    const index = this.appliedEffects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      // In place, so the effect keeps its position in the application order —
      // retuning one should not move it above or below the others.
      this.appliedEffects[index] = spec;
      return this;
    }
    this.appliedEffects.push(spec);
    return this;
  }

  /**
   * Give every effect with this path a new graph, in place.
   *
   * Called by the hot-reload reconciler when a `.effect` file was edited; see
   * `World.setEffectDocument`.
   */
  setEffectDocument(
    path: string,
    document: AppliedEffectSpec['document'],
  ): void {
    this.appliedEffects.forEach((effect, index) => {
      if (effect.path === path) {
        this.appliedEffects[index] = {...effect, document};
      }
    });
  }

  /**
   * Retune this actor's copy of an effect, in place.
   *
   * See `World.setEffectValues`: knob settings are patchable where an
   * attachment is not, and each actor's copy has its own.
   *
   * @returns whether this actor carries that effect
   */
  setEffectValues(path: string, values: AppliedEffectSpec['values']): boolean {
    const index = this.appliedEffects.findIndex(effect => effect.path === path);
    if (index < 0) {
      return false;
    }
    this.appliedEffects[index] = values
      ? {...this.appliedEffects[index], values}
      : {
          path: this.appliedEffects[index].path,
          document: this.appliedEffects[index].document,
        };
    return true;
  }

  /** Stop playing an effect. Removing one the actor does not have is a no-op. */
  removeEffect(path: string): this {
    const index = this.appliedEffects.findIndex(effect => effect.path === path);
    if (index >= 0) {
      this.appliedEffects.splice(index, 1);
    }
    return this;
  }

  /** Whether this actor carries `property` (seeded by one of its traits). */
  hasProperty(property: Property): boolean {
    return this.traited.hasProperty(property);
  }
}
