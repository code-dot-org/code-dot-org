// An Actor is an entity that can act in the World (GLOSSARY.md). It carries a
// set of Traits (reference-counted, so applying one applies its dependencies),
// a property store keyed by Property identity, and the event handlers it
// elected to respond to. Instances are produced from an ActorBuilder when a
// world places them.

import {all, LazyActors} from './actorValue';
import {fnv1a} from './hash';
import {
  isDescendantOf,
  isWorldTransformProperty,
  parentingKeys,
  toLocal,
  worldTransformOf,
} from './parenting';
import type {Space} from './Space';
import {Trait} from './Trait';
import {Traited} from './Traited';
import type {TweenRun} from './tween';
import type {
  ActorAction,
  AppliedEffectSpec,
  EventHandler,
  GameEvent,
  Property,
  Query,
} from './types';
import {Vector, type VectorLike} from './Vector';
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
   * The coordinate space this actor's position is in, set when it is
   * placed (`World.place`) and taken from the parent when one is set: a
   * child sits in its parent's frame, so it is in its parent's space
   * (specs/VIEWPORT_PLAN.md). Undefined until placed.
   */
  space: Space | undefined;

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
  // Tweens in flight. Mutable for the reason `appliedEffects` is: they start
  // and finish while the game runs, and a step reads this list every frame.
  private readonly runningTweens: TweenRun[] = [];

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

  /**
   * A property's value — through the parent, for the three that have a frame.
   *
   * `position`, `rotation` and `scale` on an actor that has a parent are
   * stored in the parent's frame and answered in the world's, composed up the
   * chain on every read (`core/parenting`). Every other property, and every
   * property of an actor with no parent, is one map lookup as it always was.
   */
  get<T>(property: Property<T>): T {
    if (isWorldTransformProperty(property) && this.parent()) {
      const world = worldTransformOf(this);
      const keys = parentingKeys()!;
      return (
        property === keys.position
          ? world.position
          : property === keys.rotation
            ? world.rotation
            : world.scale
      ) as T;
    }
    return this.traited.get(property);
  }

  /** The value a property STORES: a child's local transform, unconverted. */
  local<T>(property: Property<T>): T {
    return this.traited.get(property);
  }

  /**
   * Store a value as it is, in the frame the slot is in — a child's local
   * position rather than a world one to convert. Watchers still run.
   */
  setLocal<T>(property: Property<T>, value: T): this {
    return this.store(property, value);
  }

  /** The actor this one is carried by, or undefined for a root. */
  parent(): Actor | undefined {
    const keys = parentingKeys();
    if (!keys || !this.hasProperty(keys.parent)) {
      return undefined;
    }
    return this.traited.get(keys.parent)[0];
  }

  /** The actors this one carries, in placement order — asked of the world. */
  children(): readonly Actor[] {
    return this.world?.childrenOf(this) ?? [];
  }

  /**
   * Give this actor a parent, or none (specs/PARENTING.md).
   *
   * KEEPS THE WORLD POSITION unless told otherwise: the local transform is
   * worked out from where the actor already is, so nothing jumps. `keepWorld:
   * false` is for a map, whose stored values are already local. A cycle — a
   * parent that is this actor or is carried by it — is refused with a warning
   * and nothing changes. The same parent again changes nothing and raises
   * nothing.
   *
   * The child takes its parent's layer, and four events are raised in order:
   * the old parent loses a child, this actor loses its parent, this actor
   * gets a parent, the new parent gains a child.
   *
   * @returns whether the parent was set.
   */
  setParent(
    parent: Actor | undefined,
    {keepWorld = true}: {keepWorld?: boolean} = {},
  ): boolean {
    const keys = parentingKeys();
    if (!keys || !this.hasProperty(keys.parent)) {
      return false;
    }
    const previous = this.parent();
    if (previous === parent) {
      return true;
    }
    if (parent && isDescendantOf(parent, this)) {
      console.warn(
        `world-lab: “${this.id}” cannot have “${parent.id}” as its parent, ` +
          'which is carried by it already. Nothing was changed.',
      );
      return false;
    }
    const world = keepWorld ? worldTransformOf(this) : undefined;
    this.store(keys.parent, parent ? [parent] : []);
    if (world) {
      const local = parent ? toLocal(worldTransformOf(parent), world) : world;
      this.store(keys.position, local.position);
      this.store(keys.rotation, local.rotation);
      this.store(keys.scale, local.scale);
    }
    if (parent?.layer !== undefined) {
      this.layer = parent.layer;
    }
    if (parent?.space) {
      this.space = parent.space;
    }
    const {events} = keys;
    const raise = this.world;
    if (raise) {
      if (previous) {
        raise.emit(events.lostChild, previous, this);
        raise.emit(events.lostParent, this, previous);
      }
      if (parent) {
        raise.emit(events.gotParent, this, parent);
        raise.emit(events.gainedChild, parent, this);
      }
    }
    return true;
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
    const keys = parentingKeys();
    if (keys) {
      // A parent is set through `setParent`, which refuses a cycle, keeps
      // the world position and raises the events; the property is the door
      // a `set parent of` block comes through.
      if (property === keys.parent) {
        const given: unknown = value instanceof LazyActors ? all(value) : value;
        const one: unknown = Array.isArray(given) ? given[0] : given;
        this.setParent(one instanceof Actor ? one : undefined);
        return this;
      }
      // A world value written to a child is stored in the parent's frame.
      if (isWorldTransformProperty(property) && this.parent()) {
        const parent = worldTransformOf(this.parent()!);
        const world = worldTransformOf(this);
        const next =
          property === keys.position
            ? {...world, position: Vector.from(value as VectorLike)}
            : property === keys.rotation
              ? {...world, rotation: value as number}
              : {...world, scale: Vector.from(value as VectorLike)};
        const local = toLocal(parent, next);
        return this.store(
          property,
          (property === keys.position
            ? local.position
            : property === keys.rotation
              ? local.rotation
              : local.scale) as T,
        );
      }
    }
    return this.store(property, value);
  }

  /** The write itself: coerce, store, and tell the watchers. */
  private store<T>(property: Property<T>, value: T): this {
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

  /**
   * The properties this KIND declared for itself, which belong to no trait.
   *
   * Anything asking what an actor may be configured with has to ask both this
   * and {@link traits} — `define property` invents no trait, so a walk over
   * traits alone leaves these out (see `Traited.ownProperties`).
   */
  ownProperties(): readonly Property[] {
    return this.traited.ownProperties();
  }

  /** The tweens in flight on this actor, in the order they were started. */
  tweens(): readonly TweenRun[] {
    return this.runningTweens;
  }

  /**
   * Start a tween, replacing any already moving a property it moves.
   *
   * LAST WRITE WINS, decided at the START rather than per frame. Two tweens
   * left running over one property would both write it every tick and the
   * winner would be whichever the list happened to reach second — a race
   * decided by insertion order, which is no rule at all. Replacing means the
   * newest instruction is the one in force, which is what "last write wins"
   * is for.
   *
   * WHOLE RUNS, on any overlap at all. A tween moves a SET of properties, so
   * two of them can half-collide — one fading, one moving-and-fading. Splitting
   * the older run and keeping the half that does not clash is not behavior
   * anybody could predict; "two tweens cannot fight over a property, so the
   * newer replaces the older" is one sentence.
   *
   * It is still worth saying out loud. Fading a thing out while fading it in
   * is a real mistake, and silently honouring one of them looks like the other
   * one never ran. `onReplace` is how the caller reports it — the engine has no
   * console of its own and no opinion about where a warning belongs.
   */
  startTween(run: TweenRun, onReplace?: (displaced: TweenRun) => void): this {
    const moving = new Set(run.steps.map(step => step.property.id));
    for (const held of [...this.runningTweens]) {
      if (held.steps.some(step => moving.has(step.property.id))) {
        onReplace?.(held);
        this.runningTweens.splice(this.runningTweens.indexOf(held), 1);
      }
    }
    this.runningTweens.push(run);
    return this;
  }

  /** Drop a tween in flight, leaving the property wherever it reached. */
  stopTween(run: TweenRun): this {
    const at = this.runningTweens.indexOf(run);
    if (at >= 0) {
      this.runningTweens.splice(at, 1);
    }
    return this;
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
