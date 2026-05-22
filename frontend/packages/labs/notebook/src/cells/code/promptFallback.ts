/**
 * Fallback prompt label derivation for notebook parameters.
 *
 * When a `#@param` annotation omits a `prompt:` field the author intended no
 * specific label.  This module derives a human-readable label from the Python
 * variable name so the rendered control always has something meaningful to show.
 */

/**
 * Well-known single-word variable names that deserve a custom English phrase
 * rather than a mechanical title-cased split.
 */
const WELL_KNOWN_PROMPTS: Record<string, string> = {
  TEMPERATURE: 'Try a temperature',
  SPEED: 'Try a speed',
  COLOR: 'Try a color',
  SIZE: 'Try a size',
  COUNT: 'Try a count',
  NAME: 'Try a name',
  TEXT: 'Try some text',
  MESSAGE: 'Try a message',
};

/**
 * Converts a single underscore-delimited word to title case.
 *
 * @param word - A single segment between underscores, e.g. `"my"`.
 * @returns The word with its first character uppercased.
 */
function toTitleCase(word: string): string {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Derives a human-readable prompt label from a Python variable name.
 *
 * Well-known names map to curated English phrases.  All other names are
 * split on underscores, title-cased per segment, and joined with spaces,
 * e.g. `MY_VAR` → `"My Var"`.
 *
 * @param name - The Python variable name (typically UPPER_SNAKE_CASE).
 * @returns A human-readable label suitable for display above a control.
 */
export function derivePrompt(name: string): string {
  const upper = name.toUpperCase();
  const wellKnown = WELL_KNOWN_PROMPTS[upper];
  if (wellKnown !== undefined) return wellKnown;

  return name.split('_').map(toTitleCase).join(' ');
}
