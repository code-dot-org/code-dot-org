// Shared value-object shapes for the engine. These are pure data + function
// references, no behavior — the behavior lives on the World/Actor/Trait classes.
// Type-only imports keep this module free of runtime cycles.

import type {EffectDocument} from '../../effect/model/types';

import type {Actor} from './Actor';
import type {AnimationDef} from './animationTypes';
import type {Trait} from './Trait';
import type {World} from './World';

/**
 * An effect applied to something that is drawn (specs/EFFECTS_PLAN.md §3).
 *
 * The engine carries this from the builder to `renderSnapshot` and does nothing
 * else with it: an effect declares no property, runs no step, and reads nothing
 * from the world. It is appearance-of-the-drawing, which is why it lives here
 * rather than as a Trait. Turning the graph into a shader happens in the driver,
 * where Phaser is — the `EffectDocument` import above is type-only and erased,
 * so the bundled engine never pulls in the compiler.
 */
export interface AppliedEffectSpec {
  /**
   * The effect's module path (`effects/ripple`), which is its identity.
   *
   * The driver registers one shader render node per path, so twenty actors
   * sharing an effect compile and upload one program. The document's `name` is
   * the learner's label and is not unique; the path is.
   */
  readonly path: string;
  readonly document: EffectDocument;
  /**
   * Values for the effect's declared parameters, keyed by `EffectParameter.id`.
   *
   * Absent or partial is normal: anything unsupplied falls back to the
   * parameter's own default when the driver builds the uniforms. Kept opaque
   * here like the document — the engine never reads a shader knob.
   */
  readonly values?: Readonly<Record<string, number | number[] | boolean>>;
}

/**
 * The kinds a Property can hold. A `vector` (directional — velocity, force,
 * gravity's direction) and a `point` (an independent x/y pair — a scale, a size,
 * a position) are both stored as `Vector` instances; they differ only in how the
 * Blockly editor presents them (an arrow-grid field vs. two plain number inputs).
 */
export type PropertyType =
  | 'number'
  | 'boolean'
  | 'string'
  /**
   * A colour, held as `#rrggbb`.
   *
   * A string as far as the engine is concerned — `core/color` converts, and
   * every colour block a learner meets produces exactly this spelling. It is
   * its own type anyway, because the two places that ask what a property IS
   * both want a different answer for a colour than for words: a block's socket
   * takes a swatch rather than a text box, and the map editor's inspector shows
   * a picker rather than six characters to type by hand.
   */
  | 'color'
  | 'vector'
  | 'point'
  /**
   * Actors — one, several, or none (`ActorValue`).
   *
   * The kind that is not plain data, and the only one a rule may hold another
   * actor in: a contact set, a group, whatever a rule works out about who is
   * where (specs/COLLISION.md). Two things follow, both on this type rather
   * than on any rule that uses it:
   *
   *   - it is NEVER snapshotted. `World.snapshot()` is compared by
   *     stringifying, an Actor holds the world and the world holds its actors,
   *     so this would throw — and a set of actors worked out this tick is
   *     scratch, not state a hot reload should carry across a rebuild.
   *   - it defaults to none, because "no actors yet" is the only sensible
   *     starting value for one.
   */
  | 'actors'
  /**
   * ONE actor, or none.
   *
   * Stored exactly as `'actors'` is, a list, and different only in what it SAYS
   * — which is what the blocks around it are generated from. A contact set is a
   * list and gets `add … to` / `remove … from`; a camera's actor to follow is
   * not, and those blocks around it would offer a learner a second actor to
   * follow that nothing would ever read.
   *
   * Narrowed on the way in (`Traited.set`) rather than trusted: nothing stops
   * `set actor to follow to ⟨any Player⟩`, and in a game with one player that
   * is a reasonable thing to write, so taking one of them is the reasonable
   * answer. Readers still go through `WorldLab.one` for the paths that do not
   * come through the store.
   *
   * Never snapshotted, for `'actors'` reasons: an actor reaches the world.
   */
  | 'actor';

/**
 * The kinds an Action parameter or query argument can take. A superset of
 * {@link PropertyType}: it also admits `'actor'`, so a rule can declare a query
 * (or action) whose argument is another actor — e.g. Collision's "is a touching
 * b?" predicate. Properties never hold an actor, so {@link PropertyType} stays
 * the narrower kind for stored state.
 */
export type ArgType = PropertyType | 'actor';

/**
 * A typed slot of state on the World (scope 'world') or an Actor (scope
 * 'actor'). Identity is the object itself: the property store is keyed by the
 * Property reference, so `world.get(StrengthProperty)` needs no string lookup.
 * The generic `T` carries the value type through `get`/`set`.
 */
export interface Property<T = unknown> {
  readonly id: string;
  readonly type: PropertyType;
  readonly default: T;
  /** Writable only inside the owning rule's Step (advisory in the prototype). */
  readonly readonly: boolean;
  /** Localizable label for the Blockly surface; falls back to `id`. */
  readonly name?: string;
  readonly scope: 'world' | 'actor';
  /**
   * Rule id (world-scoped), Trait id (actor-scoped), or the id of the actor
   * KIND that declared it for itself (`ActorBuilder.defineProperty`).
   */
  readonly ownerId: string;
  /**
   * What kind of thing `ownerId` names, when it is not a rule or a trait.
   *
   * Absent for everything declared the ordinary way, which is why it reads as
   * "owned by a rule or trait" — the shape every property had before an actor
   * could declare one. Present only so an error about a missing slot can say
   * something true instead of asking whether a trait that does not exist has
   * been applied.
   */
  readonly ownerKind?: 'actor';
  /**
   * Called after this property is set on an actor, with the value before and
   * the value after — see {@link watchProperty}, which is how one is added.
   *
   * Mutable, alone among a property's fields, because a watcher is registered
   * rather than declared: the thing that wants to watch `position` is the code
   * that knows what leaving the map means, and it reads far better beside that
   * than buried in the declaration of the property at the top of the file.
   *
   * Not `PropertyWatcher<T>`: a watcher takes its values as arguments, so a
   * generic one here would make `Property<T>` invariant in T and every place
   * that holds a `Property<unknown>` — which is most of the engine — would stop
   * accepting a `Property<Vector>`. `watchProperty` is where the typing is.
   */
  watch?: PropertyWatcher[];
}

/**
 * Notified when a property changes on an actor: the actor, what the property
 * held, and what it holds now (both after coercion, so both are the real
 * stored values rather than whatever was handed to `set`).
 *
 * The reason this exists rather than a step that checks every frame: some
 * questions can only change answer when a particular value changes, and asking
 * them at the moment it does is both exact and free. "Has this actor left the
 * map" is one — an actor leaves by MOVING, and a watcher sees the crossing
 * itself (the before and the after) where a step can only see the after and has
 * to remember the before for every actor in the world.
 */
export type PropertyWatcher<T = unknown> = (
  actor: Actor,
  previous: T,
  next: T,
) => void;

/**
 * One argument an Action takes, described so the Blockly surface can generate a
 * typed value input for it (the action-block analogue of a {@link Property}'s
 * type). `apply`'s positional args line up with this list in order.
 */
export interface ActionParam {
  readonly name: string;
  readonly type: ArgType;
  /** Seed value for the block's input; falls back to a type zero when absent. */
  readonly default?: unknown;
}

/** A world-scoped method that mutates world state and returns nothing. */
export interface WorldAction {
  readonly id: string;
  readonly name?: string;
  readonly ownerId: string;
  /** The action's arguments, in `apply` order (empty/absent = no arguments). */
  readonly params?: readonly ActionParam[];
  readonly apply: (world: World, ...args: unknown[]) => void;
}

/** An actor-scoped method that mutates one actor's state. */
export interface ActorAction {
  readonly id: string;
  readonly name?: string;
  readonly ownerId: string;
  /** The action's arguments, in `apply` order (empty/absent = no arguments). */
  readonly params?: readonly ActionParam[];
  readonly apply: (actor: Actor, ...args: unknown[]) => void;
}

/** An actor-scoped read, typically a boolean ("is falling?"). */
export interface Query<T = unknown> {
  readonly id: string;
  readonly name?: string;
  readonly ownerId: string;
  /** The value kind this returns, so the Blockly surface can offer a block for
   * it (the query analogue of a {@link Property}'s type); absent = not surfaced. */
  readonly returns?: PropertyType;
  /** The arguments this query takes, in `evaluate` order (after `actor`) — the
   * actor-scoped analogue of a {@link WorldQuery}'s params. Absent/empty =
   * nullary. */
  readonly params?: readonly ActionParam[];
  readonly evaluate: (actor: Actor, ...args: unknown[]) => T;
}

/**
 * A world-scoped read a rule answers over the whole world — the query analogue
 * of {@link WorldAction}. Invoked via `world.query(query, ...args)`; e.g. the
 * Collision rule's "which actors is this one touching?" scans every actor and so
 * needs the world, which an actor-scoped {@link Query} does not receive.
 */
export interface WorldQuery<T = unknown> {
  readonly id: string;
  readonly name?: string;
  readonly ownerId: string;
  /** The value kind this returns, for the Blockly surface (absent = not
   * surfaced, e.g. Collision's `TouchingQuery` returns an actor list). */
  readonly returns?: PropertyType;
  /**
   * The arguments this query takes, in `evaluate` order (after `world`) — the
   * query analogue of a {@link WorldAction}'s params. Lets the Blockly surface
   * generate a typed socket per argument: e.g. the "is %1 touching %2?"
   * predicate declares two `actor` params. Absent/empty = a nullary query.
   */
  readonly params?: readonly ActionParam[];
  readonly evaluate: (world: World, ...args: unknown[]) => T;
}

/**
 * A signal a Step can raise; an Actor elects to respond via `actor.on`. Named
 * `GameEvent` to avoid colliding with the DOM `Event` in engine code and in the
 * generated `.d.ts`. Learners reference the value, not this type name.
 */
export interface GameEvent {
  readonly id: string;
  readonly name?: string;
  readonly ownerId: string;
}

/** Handler an Actor registers for a GameEvent; runs after the tick. */
export type EventHandler = (
  world: World,
  actor: Actor,
  detail?: unknown,
) => void;

/**
 * A handler for an event that is about the WORLD rather than about an actor.
 *
 * An event belongs to whatever it is about, the way a property does: declared
 * under a trait it is an actor's ("this actor started falling"), declared on
 * the rule it is the world's ("a key went down"). The second has no actor to
 * hand a handler, and pretending otherwise is what made `rules/input` raise its
 * key events once per actor per frame just to have somebody to raise them for.
 */
export type WorldEventHandler = (world: World, detail?: unknown) => void;

/**
 * Where a Step sits in the per-tick order. `before`/`after` anchor to another
 * rule's Step; `first`/`last` pin to the ends; `free` is unordered. The
 * Scheduler turns these constraints into a total order (and rejects cycles).
 */
export type StepOrder =
  | {readonly kind: 'first' | 'last' | 'free'}
  | {readonly kind: 'before' | 'after'; readonly anchor: Step}
  /**
   * In a named moment of the frame (core/phases).
   *
   * What a rule says when it knows what KIND of work it does — "this is a
   * force" — rather than who it runs next to. `before`/`after` name a
   * neighbour, which a rule can only do if it knows one; every stock rule but
   * two had to, and naming Physics to say you are gravity is the wrong
   * dependency for a learner to have to discover.
   */
  | {readonly kind: 'phase'; readonly phase: string};

export type StepFn = (world: World, delta: number) => void;

/** One per-tick routine contributed by a Rule. */
export interface Step {
  readonly id: string;
  readonly ownerId: string;
  readonly order: StepOrder;
  readonly run: StepFn;
}

/**
 * A built, immutable Rule — a law of the world. Produced by `RuleBuilder.build`.
 * The records are keyed by member id so both `rule.traits.movable` and a
 * directly-exported trait reference the same object.
 */
export interface Rule {
  readonly id: string;
  /** What the rule IS — "Gravity". Names its toolbox category, and identifies it. */
  readonly name: string;
  /**
   * What using it GIVES a world — "Has Gravity".
   *
   * A rule reads two ways round: as a thing ("open Gravity and change it") and
   * as something a world has ("this world has gravity"). The category wants the
   * first, `use rule` wants the second, and one string cannot be both without
   * reading badly in one of them.
   */
  readonly ability: string;
  readonly requires: readonly Rule[];
  readonly properties: Readonly<Record<string, Property>>;
  readonly actions: Readonly<Record<string, WorldAction>>;
  readonly queries: Readonly<Record<string, WorldQuery>>;
  readonly events: Readonly<Record<string, GameEvent>>;
  readonly traits: Readonly<Record<string, Trait>>;
  readonly steps: Readonly<Record<string, Step>>;
  /** Stock animations this rule ships; a World seeds its registry from these. */
  readonly animations: Readonly<Record<string, AnimationDef>>;
}
