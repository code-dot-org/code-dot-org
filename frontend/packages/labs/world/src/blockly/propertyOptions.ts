// Every actor property in the project, as one dropdown.
//
// The library mints a `get` and a `set` block for every property every rule
// declares — 81 and 87 of them across the stock shelf, which is 42% of the
// whole palette for two verbs. Each is discoverable in its rule's category,
// which is the good half; the bad half is that an ACTOR'S OWN property has no
// category to be discoverable in, and giving it one would mean a category per
// actor.
//
// So there is a general pair as well: `get ⟨property⟩ of ⟨actor⟩` and `set
// ⟨property⟩ of ⟨actor⟩ to ⟨value⟩`, whose dropdown is every actor-scoped
// property in play — a rule's and an actor's own alike. An actor that keeps a
// name for something is reachable from anywhere without a new category, and a
// learner who knows what they are looking for does not have to know which
// rule owns it.
//
// THE VALUE IS THE MEMBER KEY (`Gravity_GravityScaleProperty`), which is what
// the per-property block types are already minted from and is unique across
// rules and actors alike. The LABEL says where it came from, because two rules
// may both call something `fraction` and a bare name would offer the same word
// twice.
//
// ONE PAIR PER KIND, not one polymorphic pair. `get ⟨point⟩` reports a Vector
// and `get ⟨health⟩` reports a Number, and a single block would have to change
// its own output as the dropdown moved — which works, and disconnects whatever
// was plugged in the moment somebody browses the menu. Six kinds and twelve
// blocks instead, each statically typed, each offering a dropdown of only the
// properties it could report. Twelve against a hundred and sixty-eight.
//
// It also puts the type where a learner reads it. A number block is a number
// block by its shape, and the list inside it is the numbers an actor has.
//
// WORLD-SCOPED PROPERTIES ARE NOT HERE. `get score` takes no subject and reads
// `world`; a block with an actor socket cannot say it. They keep their own
// blocks, which is no loss — there are few of them and a world's own state is
// already gathered in one place.

import type {PropertyMeta} from './ruleMeta';

/** A property the general blocks can reach, and how to name it. */
export interface KnownProperty {
  /** `Gravity_GravityScaleProperty` — unique, and the dropdown's value. */
  key: string;
  /** `Gravity ▸ gravity scale`, which is what the menu shows. */
  label: string;
  property: PropertyMeta;
}

let known: readonly KnownProperty[] = [];

/**
 * Replace the list. Called where the palette is built, so it holds exactly the
 * properties the project's rules and actors declare right now.
 */
export function setKnownProperties(next: readonly KnownProperty[]): void {
  known = next;
}

/**
 * The kinds a block can be one of.
 *
 * Fewer than there are property types, because two pairs report the same thing
 * and a learner would be choosing between two identical blocks: a `point` and
 * a `vector` are both a Vector, and an `actor` and `actors` are both an actor
 * value — one says it holds one, which changes what is generated AROUND it and
 * not what it reports (`asTypedValue`).
 */
export type PropertyKind =
  | 'number'
  | 'text'
  | 'boolean'
  | 'color'
  | 'vector'
  | 'actor';

/** Which kind of block may name this property. */
export const kindOf = (type: string): PropertyKind =>
  type === 'boolean'
    ? 'boolean'
    : type === 'string'
      ? 'text'
      : type === 'color'
        ? 'color'
        : type === 'vector' || type === 'point'
          ? 'vector'
          : type === 'actor' || type === 'actors'
            ? 'actor'
            : 'number';

/** Every property of one kind, for a getter. */
export const propertyOptions = (kind: PropertyKind): Array<[string, string]> =>
  known
    .filter(({property}) => kindOf(property.type) === kind)
    .map(({label, key}) => [label, key]);

/**
 * …and only the ones a block may write.
 *
 * A read-only property is a rule's own bookkeeping — `jumps used`, `unhurt
 * until`, `falling`. Offering a setter for one would offer a learner a way to
 * lie to a rule about its own state.
 */
export const writablePropertyOptions = (
  kind: PropertyKind,
): Array<[string, string]> =>
  known
    .filter(
      ({property}) => kindOf(property.type) === kind && !property.readonly,
    )
    .map(({label, key}) => [label, key]);

/** The property a dropdown value names, if the project still holds it. */
export const propertyByKey = (key: string): KnownProperty | undefined =>
  known.find(entry => entry.key === key);
