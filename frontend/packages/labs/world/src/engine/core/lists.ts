// A list of plain values — numbers, words, or vectors (specs/LISTS.md).
//
// The language could hold one number, one word, one vector, and any number of
// ACTORS. These are the types that let it hold two numbers, and they are the
// smallest thing that could: a stored list says what it holds so that it has a
// default and something for the map editor's inspector to draw, and a SOCKET
// says only `List`, because a check cannot say "list of numbers" without
// generics.
//
// COPIED ON THE WAY IN, which is the one thing a list type must not get wrong.
// A property's default is one value shared by the trait that declared it, so a
// list stored by reference would be one array behind every actor that elected
// the trait: two players, one bag, and every coin either of them picked up in
// both. `Traited` and `World` both coerce through here for that reason.

import {Vector, type VectorLike} from './Vector';

/** The property types that hold a list. */
const LIST_TYPES = new Set(['numbers', 'words', 'vectors']);

/** Whether a property type holds a list of plain values. */
export const isListType = (type: string): boolean => LIST_TYPES.has(type);

/**
 * A value as the list a property of this type holds.
 *
 * Anything that is not a list reads as an empty one — the same bargain every
 * other kind makes with a value of the wrong shape, and the one that keeps a
 * half-written program running rather than throwing at a learner.
 */
export function asList(type: string, value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    return [];
  }
  // A vector list holds VECTORS, however it was written: a `.map` file's JSON
  // has `{x, y}` in it and a block hands over the real thing, and a property
  // whose items were sometimes one and sometimes the other would be a list that
  // works until somebody saves the project.
  return type === 'vectors'
    ? value.map(item => Vector.from(item as VectorLike))
    : [...value];
}

/**
 * The items of a value, for walking.
 *
 * Anything that is not a list walks as an empty one, which is what `for each`
 * over an unset variable should do: nothing, rather than throw at a learner
 * mid-sentence.
 */
export const items = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

/**
 * `add ⟨5⟩ to ⟨scores⟩` — the same list, one longer.
 *
 * MUTATES and returns it, so two variables naming one list see each other's
 * additions, exactly as `push ⟨actor⟩ to ⟨…⟩` does. The return is what makes
 * the generated line an assignment, which is what covers the case a mutation
 * cannot: a variable that holds nothing yet becomes a list of one.
 */
/**
 * How many times a list has been changed IN PLACE.
 *
 * The three functions below are the only things that do it — everything else
 * that changes a list replaces it, so identity is enough to tell those apart
 * (`take the last off ⟨…⟩ of ⟨actor⟩` generates a `.slice(0, -1)` and a `set`).
 * These three cannot: `add … to` pushes so that two variables holding one list
 * both see it, which is what its own tooltip promises.
 *
 * A LENGTH WOULD NOT DO. Take one off the front and add one to the back — which
 * is what every queue does, once per turn round the loop — and the length is
 * where it was while the contents are not.
 *
 * A symbol so it cannot collide with anything a list holds, and so nothing
 * walking a list ever sees it.
 */
const VERSION = Symbol('list version');

/** Note that a list has changed under whoever is holding it. */
function touched(list: unknown[]): void {
  const stamped = list as unknown as {[VERSION]?: number};
  stamped[VERSION] = (stamped[VERSION] ?? 0) + 1;
}

/** What version a list is at — zero for one nothing has changed in place. */
function versionOf(list: unknown[]): number {
  return (list as unknown as {[VERSION]?: number})[VERSION] ?? 0;
}

/**
 * `add ⟨x⟩ to the front of ⟨list⟩` — {@link addTo}'s other end.
 *
 * `unshift` rather than a new array, matching `addTo`: a list variable is one
 * array that two variables may both hold, and replacing it would leave one of
 * them looking at the old one.
 */
export function addToFront(list: unknown, value: unknown): unknown[] {
  if (Array.isArray(list)) {
    list.unshift(value);
    touched(list);
    return list;
  }
  return [value];
}

/**
 * `take the first off ⟨list⟩` — the front, removed and handed back.
 *
 * Undefined for an empty list, which every socket already reads as nothing:
 * a search whose queue has run dry asks once more and is told there is nothing
 * there, rather than being stopped with an error.
 */
export function takeFirst(list: unknown): unknown {
  if (!Array.isArray(list)) {
    return undefined;
  }
  const first = list.shift();
  touched(list);
  return first;
}

export function addTo(list: unknown, value: unknown): unknown[] {
  if (Array.isArray(list)) {
    list.push(value);
    touched(list);
    return list;
  }
  return [value];
}

/**
 * Whether a list holds a value — `⟨scores⟩ has ⟨10⟩`.
 *
 * BY VALUE, which `Array.includes` is only for numbers and words: two Vectors
 * at the same place are two objects, so a list of places would answer "no" to
 * a place it holds. Comparing the pair of numbers is what a learner means by
 * "the same place".
 */
/**
 * A set of the values in a list, kept beside it so `has` is a lookup.
 *
 * WHY A CACHE AND NOT A SET IN THE FIRST PLACE: a list is ordered and may hold
 * a value twice, and both matter — `for each` walks it in order, and a tally of
 * scores is allowed to hold 10 twice. So the array stays the list, and this is
 * an index of it.
 *
 * KEYED ON THE ARRAY, and rebuilt when the version it was built from has moved
 * on. `addTo` pushes in place, so identity alone would go stale — and a length
 * would go stale too, on the one pattern this exists for: a queue takes one off
 * the front and adds one to the back every turn, and its length never changes.
 *
 * The keys are strings because a place is two numbers and a Vector is an
 * object: `{x: 1, y: 2}` twice is two objects and one place, which is the whole
 * reason `sameValue` exists.
 */
const indexes = new WeakMap<object, {version: number; keys: Set<string>}>();

/** A value as a set key, or undefined for one that cannot be one. */
function keyFor(value: unknown): string | undefined {
  if (typeof value === 'number' || typeof value === 'string') {
    return `${typeof value}:${value}`;
  }
  const place = value as {x?: unknown; y?: unknown} | null;
  return place &&
    typeof place === 'object' &&
    typeof place.x === 'number' &&
    typeof place.y === 'number'
    ? `place:${place.x},${place.y}`
    : undefined;
}

export function listHas(list: unknown, value: unknown): boolean {
  if (!Array.isArray(list)) {
    return items(list).some(item => sameValue(item, value));
  }
  const wanted = keyFor(value);
  if (wanted === undefined) {
    // Something a key cannot be made of — an actor, say. Rare, and the scan
    // is what it always was.
    return list.some(item => sameValue(item, value));
  }
  const version = versionOf(list);
  let index = indexes.get(list);
  if (!index || index.version !== version) {
    const keys = new Set<string>();
    for (const item of list) {
      const key = keyFor(item);
      if (key === undefined) {
        // A list holding something unkeyable is not one this can index; fall
        // back rather than answer from a set that is missing entries.
        return list.some(item_ => sameValue(item_, value));
      }
      keys.add(key);
    }
    index = {version, keys};
    indexes.set(list, index);
  }
  return index.keys.has(wanted);
}

/** Value equality across the three kinds a list may hold. */
function sameValue(one: unknown, other: unknown): boolean {
  if (one === other) {
    return true;
  }
  const place = (value: unknown): {x: number; y: number} | undefined =>
    typeof value === 'object' &&
    value !== null &&
    typeof (value as {x?: unknown}).x === 'number' &&
    typeof (value as {y?: unknown}).y === 'number'
      ? (value as {x: number; y: number})
      : undefined;
  const a = place(one);
  const b = place(other);
  return a !== undefined && b !== undefined && a.x === b.x && a.y === b.y;
}

/**
 * The last thing in a list, or nothing when there is none.
 *
 * The end a stack is read from, and the only reading blocks offer so far: an
 * INDEX is a decision about what "past the end" means, and this needs no such
 * decision — an empty list has no last thing, and says so.
 */
export const lastOf = (list: unknown): unknown =>
  items(list)[items(list).length - 1];
