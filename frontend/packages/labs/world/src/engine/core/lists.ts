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
