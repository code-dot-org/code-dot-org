// What a mouse button is called, and where the mouse is.
//
// The keyboard's counterpart (core/keys), and the same bargain: the browser
// names a button by NUMBER — `MouseEvent.button` is 0, 1, 2 — and a rule that
// read `if (button === 0)` would be a line nobody should have to decode. So the
// driver translates at the door and everything inland says `left`, `middle`,
// `right`.
//
// Three buttons and no more. The browser reports two further ones (back and
// forward, 3 and 4), and they are left out on purpose: a game that needs them
// is a game played on one kind of mouse. A number the table does not name
// passes through as itself, exactly as an unnamed key does, so a rule that
// wants button 3 may still say `3`.

/** Our name for each `MouseEvent.button`, by its number. */
const NAMED_BUTTONS: ReadonlyArray<readonly [number, string]> = [
  [0, 'left'],
  [1, 'middle'],
  [2, 'right'],
];

const BY_NUMBER = new Map(NAMED_BUTTONS);

/** Our name for a `MouseEvent.button` number. */
export function buttonName(button: number): string {
  return BY_NUMBER.get(button) ?? String(button);
}

/**
 * The buttons worth offering in a dropdown, as `[label, name]`.
 *
 * Label and value are the same here, where the keyboard's differ: `left` is
 * already what a learner would call it, and there is no case to fold.
 */
export const BUTTON_CHOICES: ReadonlyArray<readonly [string, string]> =
  NAMED_BUTTONS.map(([, name]) => [name, name] as const);
