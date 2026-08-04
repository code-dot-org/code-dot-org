// What a key is called.
//
// The browser names keys for the browser's convenience: the space bar is `" "`,
// the up arrow is `"ArrowUp"`, and a shifted A is `"A"` while an unshifted one
// is `"a"`. Those names used to travel the whole way in — the driver put them
// in the pressed set, `isKeyDown` compared them, an event carried them, and
// generated code read `if (eventValue !== " ") return;`, which is a line nobody
// should have to decode.
//
// So the driver translates at the door, and everything inland — the World's
// pressed set, a rule's `key … is down`, an event's value, the JavaScript a
// learner reads — speaks these names instead. The editor's `Engine#Key` enum is
// built from the same table (blockly/enums), so what a dropdown offers and what
// the engine compares cannot drift apart.
//
// A key the table does not name passes through unchanged, so the keyboard is
// not reduced to this list — F7 is `"F7"`, and a rule that wants it may say so.

/** Keys whose browser name is not the name we use, as `[ours, the DOM's]`. */
const NAMED_KEYS: ReadonlyArray<readonly [string, string]> = [
  ['space', ' '],
  ['up arrow', 'ArrowUp'],
  ['down arrow', 'ArrowDown'],
  ['left arrow', 'ArrowLeft'],
  ['right arrow', 'ArrowRight'],
  ['enter', 'Enter'],
];

const BY_DOM_KEY = new Map(
  NAMED_KEYS.map(([name, domKey]) => [domKey, name] as const),
);

/**
 * Our name for a `KeyboardEvent.key`.
 *
 * Letters fold to lower case, so a handler written for `a` fires whether or not
 * shift was held — which is what a learner means by "the A key". Anything the
 * table does not name is its own name.
 */
export function keyName(domKey: string): string {
  const named = BY_DOM_KEY.get(domKey);
  if (named) {
    return named;
  }
  // A single character folds case ("A" and "a" are the A key); anything longer
  // is a name the browser chose (`F7`, `Escape`) and is left as it is.
  return domKey.length === 1 ? domKey.toLowerCase() : domKey;
}

/**
 * The keys worth offering in a dropdown, as `[label, name]`.
 *
 * The label differs from the name only where a capital reads better than what
 * the value has to be: the letter keys show `A` and are `a`, because folding
 * case is what makes a handler fire for both.
 */
export const KEY_CHOICES: ReadonlyArray<readonly [string, string]> = [
  ...NAMED_KEYS.map(([name]) => [name, name] as const),
  ...'abcdefghijklmnopqrstuvwxyz'
    .split('')
    .map(letter => [letter.toUpperCase(), letter] as const),
];
