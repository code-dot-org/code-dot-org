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
  // THE EDITING KEYS, which are only in this table because of their capitals —
  // and which were missing, so a Text Input listening for `backspace` heard
  // `Backspace` and never fired. They make no CHARACTER, so they never arrive
  // as one (`rules/input`): a field that wants to delete has to hear them as
  // keys, and could not until they were named.
  ['backspace', 'Backspace'],
  ['delete', 'Delete'],
  ['tab', 'Tab'],
  ['escape', 'Escape'],
  // …AND THE MODIFIER, which is here for a different reason from the four
  // above. Shift already reached the pressed set under the browser's own name,
  // because anything the table does not hold keeps it — so `Shift` worked and
  // `shift` did not, and no author could pick either from a dropdown built
  // from this table. Naming it makes it choosable, which is what Shift+Tab
  // walking the focus backwards needs (`rules/tabNavigation`).
  //
  // It is NOT how a shifted letter is heard: `a` with shift held is the key
  // `a` and the character `A`, and the two arrive by different doors
  // (specs/UI_ACTORS.md).
  ['shift', 'Shift'],
];

/**
 * Keys the game may never take from the browser, whatever it asks.
 *
 * ESCAPE, and only Escape. It is the way OUT: while an interface actor holds
 * the keyboard the game keeps Tab to itself, and Escape is what drops that
 * focus and hands Tab back to the page (specs/UI_ACTORS.md). A game that could
 * capture Escape could shut that door behind itself, and a canvas a keyboard
 * user cannot leave is a trap — so `World.captureKey` refuses this one rather
 * than trusting every rule that will ever be written not to ask.
 *
 * A game may still HEAR it. Reserving it is about the browser's default
 * action, not about the event: `when ⟨escape⟩ is pressed` opening a menu is
 * ordinary, and it cannot stop the focus being dropped in the same frame.
 */
export const RESERVED_KEYS: ReadonlySet<string> = new Set(['escape']);

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
