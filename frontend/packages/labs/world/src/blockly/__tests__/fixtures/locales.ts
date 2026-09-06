// Two fixtures, for two different questions about translating this lab.
//
// THE PSEUDO-LOCALE answers "did this string go through the seam at all?" It
// is mechanical — no dictionary to keep, nothing to go stale when a label is
// reworded — and every string it returns is unmistakable on sight. That makes
// coverage a property a test can assert over the whole palette, and makes a
// browser check readable by anyone: whatever is still plain English did not
// reach `localizeBlocks`.
//
// THE SPANISH answers "does a real translation survive?", which the pseudo one
// cannot: it is the same words in the same order with decoration around them,
// so it never reorders arguments, never runs long, and never makes the
// mistakes a person makes. It is deliberately SMALL. The English string is the
// key (specs/LOCALIZATION.md), so a full dictionary of the palette would be
// 466 entries that break the moment anybody rewords a label — this holds a
// dozen chosen because each one is a different way a translation can differ.

import type {Translate} from '../../localizeBlocks';

/** Latin letters that read as themselves with an accent on top. */
const ACCENTED: Record<string, string> = {
  a: 'á',
  e: 'é',
  i: 'í',
  o: 'ó',
  u: 'ú',
  n: 'ñ',
  c: 'ç',
  s: 'š',
  y: 'ý',
  A: 'Á',
  E: 'É',
  I: 'Í',
  O: 'Ó',
  U: 'Ú',
  N: 'Ñ',
  C: 'Ç',
  S: 'Š',
  Y: 'Ý',
};

/**
 * Every word marked and accented, and the `%n` left exactly as they are.
 *
 * Bracketed so a test can see what was translated, accented so a human can,
 * and padded because a translation is usually LONGER than its English — about
 * a third, for the languages this lab is likely to see — which is how a layout
 * that only ever held English gets found out.
 */
export const pseudo: Translate = text =>
  `«${text.replace(/%\d+|%%|[A-Za-z]/g, token =>
    token.length > 1 || token === '%%' ? token : (ACCENTED[token] ?? token),
  )}»`;

/** Whether a string has been through `pseudo`. */
export const isPseudo = (text: string): boolean =>
  text.startsWith('«') && text.endsWith('»');

/**
 * Real Spanish for a handful of real palette strings.
 *
 * Chosen one per hazard: an argument that moves, a label that runs long, an
 * accent, a dropdown label whose VALUE must not follow it, and the three ways
 * a translation can disagree with `args0` — which are not translator mistakes
 * so much as facts about how `%n` works that no translation tool enforces.
 */
const SPANISH: Record<string, string> = {
  // The ordinary case: same arguments, same order, more words.
  'move %1 to %2': 'mover %1 hasta %2',
  // An argument MOVES. Spanish puts the manner before the object here, and
  // this is the case the whole design rests on — `%2` still means `args0[1]`.
  'push %1 out of %2 sideways': 'empujar lateralmente %2 fuera de %1',
  // Accents and a much longer string, for anything that measures a label.
  'when the world starts': 'cuando comienza la simulación del mundo',
  // A dropdown label. Its stored value is `sense` and must stay `sense`.
  'before everything': 'antes que todo',
  // …and the three Blockly will not accept. Each of these is a translation a
  // person could plausibly write, and each throws when the block is defined:
  // an argument dropped, one repeated, one invented out of nowhere.
  'set %1 to %2': 'asignar %1',
  'give %1 to %2': 'dar %1 a %1',
  'count %1': 'contar %1 de %2',
};

/** Spanish where this fixture has it, and the English word where it does not. */
export const spanish: Translate = text => SPANISH[text] ?? text;

/** The entries above that Blockly would refuse, by their English. */
export const SPANISH_BAD = ['set %1 to %2', 'give %1 to %2', 'count %1'];
