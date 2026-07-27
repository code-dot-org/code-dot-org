// A World is the encapsulation of the laws (Rules) in play (GLOSSARY.md). The
// instance holds the reference-counted rule set, the world-scoped property
// store, the actors living under those laws, and the per-tick Scheduler and
// EventQueue. `tick(delta)` advances the simulation: run every Step in order,
// then flush the events those steps raised.

import type {Actor} from './Actor';
import {EventQueue} from './EventQueue';
import {Scheduler} from './Scheduler';
import {DependencySet} from './traits';
import type {GameEvent, Property, Rule, Step, WorldAction} from './types';
import {Vector} from './Vector';

/** The data a WorldBuilder hands the World constructor. */
export interface WorldInit {
  id: string;
  name: string;
  /** Explicitly-used rules; their dependencies are pulled in implicitly. */
  rules: Rule[];
  /** Initial world-property values overriding rule defaults. */
  overrides: Array<[Property, unknown]>;
}

const coerce = <T>(property: Property<T>, value: unknown): T =>
  property.type === 'vector'
    ? (Vector.from(value as Vector) as unknown as T)
    : (value as T);

/** `world.actors` — iterable, with a trait filter (`world.actors.with(t)`). */
class ActorCollection {
  private readonly list: Actor[];

  constructor(list: Actor[]) {
    this.list = list;
  }

  with(trait: Parameters<Actor['has']>[0]): Actor[] {
    return this.list.filter(actor => actor.has(trait));
  }

  [Symbol.iterator](): Iterator<Actor> {
    return this.list[Symbol.iterator]();
  }
}

export class World {
  readonly id: string;
  readonly name: string;
  readonly actors: ActorCollection;
  private readonly membership = new DependencySet<Rule>(
    rule => rule.requires,
    rule => rule.id,
  );
  private readonly store = new Map<Property, unknown>();
  private readonly actorList: Actor[] = [];
  private readonly scheduler: Scheduler;
  private readonly events = new EventQueue();

  constructor(init: WorldInit) {
    this.id = init.id;
    this.name = init.name;
    this.actors = new ActorCollection(this.actorList);

    for (const rule of init.rules) {
      this.membership.add(rule);
    }
    const rules = this.membership.items();

    // Seed world-scoped properties from every present rule's defaults, then
    // apply overrides.
    for (const rule of rules) {
      for (const property of Object.values(rule.properties)) {
        this.store.set(property, coerce(property, property.default));
      }
    }
    for (const [property, value] of init.overrides) {
      this.store.set(property, coerce(property, value));
    }

    // The per-tick order is fixed by the active rules' steps.
    const steps: Step[] = [];
    for (const rule of rules) {
      steps.push(...Object.values(rule.steps));
    }
    this.scheduler = new Scheduler(steps);
  }

  get<T>(property: Property<T>): T {
    if (!this.store.has(property)) {
      throw new Error(
        `World '${this.id}' has no property '${property.id}' ` +
          `(is rule '${property.ownerId}' in use?)`,
      );
    }
    return this.store.get(property) as T;
  }

  set<T>(property: Property<T>, value: T): void {
    this.store.set(property, coerce(property, value));
  }

  act(action: WorldAction, ...args: unknown[]): void {
    action.apply(this, ...args);
  }

  addActor(actor: Actor): void {
    this.actorList.push(actor);
  }

  /** Raise an event for `actor`; dispatched after the current tick's steps. */
  emit(event: GameEvent, actor: Actor, detail?: unknown): void {
    this.events.enqueue(event, actor, detail);
  }

  /** Advance the simulation by `delta` seconds. */
  tick(delta: number): void {
    this.scheduler.run(this, delta);
    this.events.flush(this);
  }

  /** The resolved step order — for inspection and tests. */
  stepOrder(): readonly Step[] {
    return this.scheduler.order();
  }

  /** Whether a rule is active (directly or by dependency). */
  hasRule(rule: Rule): boolean {
    return this.membership.has(rule);
  }

  /** The active rules, directly-used and implied. */
  activeRules(): readonly Rule[] {
    return this.membership.items();
  }

  /** Remove every actor (used by `SceneBuilder.clear`). */
  clearActors(): void {
    this.actorList.length = 0;
  }
}
