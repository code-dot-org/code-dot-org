// Holding traits, and the properties those traits declare.
//
// The half of an Actor that is not about being drawn: which traits it has, and
// a slot per property they bring. Extracted because a CAMERA needs exactly this
// and nothing else — it is the actor foundation minus appearance (core/Camera)
// — and two copies of a property store are two places for the coercion rules to
// drift apart.
//
// Not a base class. Actor and Camera are different kinds of thing and neither
// is a special case of the other; this is a piece they both hold.

import type {Trait} from './Trait';
import {DependencySet} from './traits';
import type {Property} from './types';
import {Vector} from './Vector';

/**
 * What a value becomes on the way into a slot.
 *
 * `vector` and `point` are both stored as a `Vector`, so a learner writing
 * `{x, y}` in a default gets one. An `actors` slot always holds a list, so a
 * single actor written into one is wrapped rather than being a second shape
 * every reader has to handle.
 */
const coerce = <T>(property: Property<T>, value: unknown): T => {
  if (property.type === 'vector' || property.type === 'point') {
    return Vector.from(value as Vector) as unknown as T;
  }
  if (property.type === 'actors') {
    if (Array.isArray(value)) {
      return [...value] as unknown as T;
    }
    // An Actor without importing one: a circular import for a type guard would
    // be a poor trade, and nothing else in the engine has `traits`.
    const isActor =
      typeof value === 'object' && value !== null && 'traits' in value;
    return (isActor ? [value] : []) as unknown as T;
  }
  return value as T;
};

/** A set of traits, and a slot for every property they declare. */
export class Traited {
  private readonly membership = new DependencySet<Trait>(
    trait => trait.requiredTraits,
    trait => trait.id,
  );
  private readonly store = new Map<Property, unknown>();
  /** What to call the holder in an error — `Actor 'coin'`, `Camera 'main'`. */
  private readonly describe: string;

  constructor(
    describe: string,
    traits: readonly Trait[],
    overrides: ReadonlyArray<[Property, unknown]> = [],
  ) {
    this.describe = describe;
    for (const trait of traits) {
      this.membership.add(trait);
    }
    // Seed from every present trait's defaults, then apply the overrides on
    // top: a trait pulled in as a dependency brings its slots too.
    for (const trait of this.membership.items()) {
      for (const property of Object.values(trait.properties) as Property[]) {
        this.store.set(property, coerce(property, property.default));
      }
    }
    for (const [property, value] of overrides) {
      this.store.set(property, coerce(property, value));
    }
  }

  get<T>(property: Property<T>): T {
    if (!this.store.has(property)) {
      throw new Error(
        `${this.describe} has no property '${property.id}' ` +
          `(is trait '${property.ownerId}' applied?)`,
      );
    }
    return this.store.get(property) as T;
  }

  set<T>(property: Property<T>, value: T): void {
    this.store.set(property, coerce(property, value));
  }

  /** Whether the slot exists at all — distinct from what is in it. */
  hasProperty(property: Property): boolean {
    return this.store.has(property);
  }

  /** Whether this holds the trait, directly or by dependency. */
  has(trait: Trait): boolean {
    return this.membership.has(trait);
  }

  /** The traits in play, dependencies included. */
  traits(): readonly Trait[] {
    return this.membership.items();
  }
}
