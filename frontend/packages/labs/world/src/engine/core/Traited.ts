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

/**
 * Messages already said once, so a per-frame step cannot flood the console.
 *
 * Keyed by the message and not by the holder: `for each actor where ⟨has trait
 * …⟩` asks the same broken question of every actor sixty times a second, and a
 * hundred identical lines is a worse diagnostic than one.
 */
const warned = new Set<string>();

/**
 * Whether this is a trait at all, complaining once if it is not.
 *
 * A block names a trait through its module — `WorldLab.CanCollideTrait`, or an
 * import from the rule that declared it — and that name can come up empty: a
 * saved workspace naming a rule since deleted or renamed still holds the field
 * value, and generation cannot tell, because whether an engine export exists is
 * not a fact the palette has.
 *
 * What it used to do was reach `DependencySet`, which keys traits by `id`, and
 * stop the game with "Cannot read properties of undefined (reading 'id')" —
 * a message naming nothing a learner wrote. A missing trait is a broken
 * reference in one block, not a reason for the game to stop, so the operation
 * is skipped and the console says so. Skipping it silently would be worse than
 * either: a `remove trait` that does nothing, forever, with no way to find out
 * why.
 */
const isTrait = (trait: Trait | undefined, doing: string): trait is Trait => {
  if (trait) {
    return true;
  }
  const message =
    `world-lab: ignored “${doing}” for a trait that does not exist. ` +
    'The rule that declared it may have been deleted or renamed — open the ' +
    'block and pick the trait again.';
  if (!warned.has(message)) {
    warned.add(message);
    console.warn(message);
  }
  return false;
};

/** For tests: forget what has been said, so each can assert on its own. */
export const resetTraitWarnings = (): void => warned.clear();

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
      // A template can carry one too: `use trait` stores the same field value,
      // and an actor built from it would otherwise fail to instantiate at all.
      if (isTrait(trait, 'use trait')) {
        this.membership.add(trait);
      }
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
    // Not a trait, so nothing has it — which is also the answer that keeps a
    // `for each actor where ⟨has trait …⟩` selecting nothing rather than
    // stopping.
    return isTrait(trait, 'has trait') && this.membership.has(trait);
  }

  /**
   * Elect a trait after the fact, with the slots it brings.
   *
   * Slots that already exist keep their values, which is what makes this the
   * inverse of {@link removeTrait} rather than a reset: take a trait away and
   * put it back and the actor picks up where it left off. Only a property with
   * no slot at all is seeded, and its default is the seed — the constructor's
   * overrides were a fact about how this actor was BUILT, and there is nothing
   * to apply them to a second time.
   */
  addTrait(trait: Trait): void {
    if (!isTrait(trait, 'add trait')) {
      return;
    }
    this.membership.add(trait);
    for (const present of this.membership.items()) {
      for (const property of Object.values(present.properties) as Property[]) {
        if (!this.store.has(property)) {
          this.store.set(property, coerce(property, property.default));
        }
      }
    }
  }

  /**
   * Drop a trait. Its steps stop running for this holder from the next frame —
   * `World.actors.with` re-filters every frame, so there is no list to update.
   *
   * THE SLOTS STAY. A property is read by anything holding a reference to it,
   * not only by the trait that declared it, so removing them would turn "this
   * camera stopped following" into a crash somewhere unrelated the next time
   * anything read the property. Keeping them also makes off-and-on preserve
   * state, which is what a toggle means. `hasProperty` is the question to ask
   * about a slot; `has` is the question about the trait.
   *
   * A trait that is only here because something else REQUIRES it does not go —
   * the count says so, and `DependencySet.remove` ignores a trait that was
   * never explicitly elected. That is silent by design: it is the same answer
   * as removing a trait the holder never had, and neither is worth stopping a
   * game over.
   */
  removeTrait(trait: Trait): void {
    if (!isTrait(trait, 'remove trait')) {
      return;
    }
    this.membership.remove(trait);
  }

  /** The traits in play, dependencies included. */
  traits(): readonly Trait[] {
    return this.membership.items();
  }
}
