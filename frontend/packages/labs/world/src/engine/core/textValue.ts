// A value, said as words (specs/UI_ACTORS.md).
//
// The one place anything becomes text, and it exists so that "how is this
// written down" has one answer rather than one per block. `“ ⟨value⟩ ”`
// generates a call to this and nothing else does yet; anything that later
// needs to say a value out loud says it the same way, which is the point of
// there being a function at all.
//
// A LIST JOINS WITH ONE SPACE. `["red", "blue"]` is "red blue", not
// "red,blue" — which is what `String` gives, and which is a comma nobody
// asked for and cannot remove. A list of words IS a sentence in this
// language: `the words in ⟨…⟩` hands one back, and drawing it should read as
// the thing it holds.
//
// NOTHING ELSE IS SPECIAL. A number is its digits, a boolean is `true` or
// `false`, and an actor is whatever `String` makes of it — which is not
// useful, and is the honest answer to a question nobody should be asking a
// picture. Making an actor print its name here would be a second naming
// scheme, invisibly, in the block that draws a score.

/**
 * `value`, as the words that would be drawn for it.
 *
 * Recursive over lists, so a list of lists still reads as a sentence rather
 * than as brackets — the nesting is a shape the language has no block for, and
 * flattening it is the least surprising of the wrong answers.
 */
export function text(value: unknown): string {
  return Array.isArray(value) ? value.map(text).join(' ') : String(value);
}
