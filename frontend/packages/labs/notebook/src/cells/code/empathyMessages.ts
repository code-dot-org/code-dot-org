/**
 * Maps Python exception names to learner-friendly plain-English templates.
 *
 * Translations land in Phase 12; this module is the English-only v1.  The
 * intent is to never surface raw Python error text to a learner — even the
 * fallback includes the exception name so it is diagnostic without being
 * opaque.
 */

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Extracts the first single-quoted or double-quoted token from a string.
 * Used to surface the offending identifier from NameError messages like
 * "name 'foo' is not defined" without regex-interpolating raw Python into UI.
 * @param msg Raw exception message string
 * @returns The quoted token, or empty string if none found
 */
function extractQuoted(msg: string): string {
  const match = /['"]([^'"]+)['"]/.exec(msg);
  return match ? match[1] : '';
}

// ---------------------------------------------------------------------------
// Mapping table
// ---------------------------------------------------------------------------

/**
 * Per-exception template functions keyed by exception class name.
 * Each function receives the raw exception message and returns a
 * plain-English one-liner safe to show to a learner.
 */
const EMPATHY_TEMPLATES: Record<string, (msg: string) => string> = {
  NameError: (msg: string) => {
    const token = extractQuoted(msg);
    const label = token.length > 0 ? `'${token}'` : 'that name';
    return `Looks like ${label} isn't defined yet. Check spelling or define it first.`;
  },
  SyntaxError: (_msg: string) =>
    "Python couldn't understand this code. Check for missing colons, brackets, or quotes.",
  TypeError: (_msg: string) =>
    "There's a type mismatch — e.g. adding a number to text. Check what types each value is.",
  ValueError: (_msg: string) =>
    'The value is the wrong kind for this operation. Check the input.',
  IndentationError: (_msg: string) =>
    'Indentation is off. Make sure each block is indented consistently.',
  IndexError: (_msg: string) =>
    "You're trying to access an item that doesn't exist in this list.",
  KeyError: (_msg: string) =>
    "That key doesn't exist in this dictionary.",
  AttributeError: (_msg: string) =>
    "That attribute or method doesn't exist on this object.",
  ZeroDivisionError: (_msg: string) =>
    "You're dividing by zero — that's not allowed in math (or Python).",
  ImportError: (_msg: string) =>
    "Couldn't import that module. Is it spelled correctly or installed?",
  ModuleNotFoundError: (_msg: string) =>
    "That module isn't available. Double-check the name.",
  RecursionError: (_msg: string) =>
    'Your function is calling itself too many times. Check for infinite recursion.',
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns a plain-English one-liner for a Python exception.
 * Localised strings land in Phase 12; this is the English-only v1.
 * @param name Exception class name (e.g. "NameError")
 * @param message Raw exception message
 * @returns Friendly one-liner, never raw Python
 */
export function getEmpathyMessage(name: string, message: string): string {
  const template = EMPATHY_TEMPLATES[name];
  if (template !== undefined) {
    return template(message);
  }
  return `${name}: ${message}`;
}
