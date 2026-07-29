// Shared value-object shapes for the engine. These are pure data + function
// references, no behavior — the behavior lives on the World/Actor/Trait classes.
// Type-only imports keep this module free of runtime cycles.

import type {Actor} from './Actor';
import type {AnimationDef} from './animationTypes';
import type {Trait} from './Trait';
import type {World} from './World';

/** The kinds a Property can hold. Vectors are stored as `Vector` instances. */
export type PropertyType = 'number' | 'boolean' | 'string' | 'vector';

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
  /** Rule id (world-scoped) or Trait id (actor-scoped) that declared it. */
  readonly ownerId: string;
}

/**
 * One argument an Action takes, described so the Blockly surface can generate a
 * typed value input for it (the action-block analogue of a {@link Property}'s
 * type). `apply`'s positional args line up with this list in order.
 */
export interface ActionParam {
  readonly name: string;
  readonly type: PropertyType;
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
  readonly evaluate: (actor: Actor) => T;
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
 * Where a Step sits in the per-tick order. `before`/`after` anchor to another
 * rule's Step; `first`/`last` pin to the ends; `free` is unordered. The
 * Scheduler turns these constraints into a total order (and rejects cycles).
 */
export type StepOrder =
  | {readonly kind: 'first' | 'last' | 'free'}
  | {readonly kind: 'before' | 'after'; readonly anchor: Step};

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
  readonly name: string;
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
