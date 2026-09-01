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
export function addTo(list: unknown, value: unknown): unknown[] {
  if (Array.isArray(list)) {
    list.push(value);
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
export function listHas(list: unknown, value: unknown): boolean {
  return items(list).some(item => sameValue(item, value));
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
