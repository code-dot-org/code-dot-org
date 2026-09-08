import {defineRule, moduleFor} from './dsl.mjs';

const rule = defineRule({
  name: 'Writing',
  ability: 'Shows Text',
  purpose: `**Writing** is the words an actor has to say.

It owns the *text* and draws none of it — a Label actor does the drawing, which
is why the same words can be a speech bubble, a score line or a sign.

Give anything with words **Shows Text**.`,
  header: `// "Shows Text" — the state a drawn word is drawn from.
//
// NAMED "Writing" AND NOT "Text". A rule's name is its toolbox category, and
// the toolbox already has a Text category — Blockly's, holding the string
// literal and the note block. Two categories with one name is a toolbox a
// learner has to read twice, so the rule takes the mechanic's name the way
// Physics, Collection and Shooting do, and leaves the word "text" to the
// property it is about.
//
// A RULE WITH NO STEPS, which nothing else here is. Nothing about text happens
// over time: this declares what an actor's words are and leaves the drawing to
// the actor that elects it (specs/DRAWING.md). It exists to be elected and to
// be set.
//
// WHY THESE ARE A TRAIT'S AND NOT THE ACTOR'S OWN. \`define property\` in an
// \`.actor\` file would say the same thing in one file instead of two, and the
// getter and setter it mints would be in that file's palette and NOWHERE ELSE
// (\`BlocklyFileEditor\` hands the palette only the actor being edited). A
// world's handler could never say \`set text of ⟨any ⟨Score⟩⟩\`, which is the
// entire point of having a score. A rule's property has no such limit.
//
// Electing it is also what makes labels findable: \`for each actor where ⟨has
// trait ⟨Shows Text⟩⟩\` is a sentence, with nothing new behind it.`,
});

const shows = rule.trait('Shows Text');
export const ShowsText = rule.traitRef('Shows Text');

// Empty, because every actor that has not been given words has none. A Label
// placed and left alone draws nothing rather than the word "text".
//
// EXPORTED, so anything that reveals words a few at a time can write it — the
// Speech Box does, the way `cameraFollow` writes the Camera's goal. What
// it buys is that every drawing already reading `text` keeps working: a Label
// and a Button reveal themselves without knowing anything has changed.
export const text = shows.string('text', '');
// Pixels, like every other size in the lab (engine/core/units): positions and
// sizes are pixels and only RATES are in units.
shows.number('text size', 12);
// A COLOR, not a string that happens to hold one. What the type buys is the
// two places that ask what a property is: `get text color` reports `Colour`, so
// it plugs into `set fill` and into an effect's parameter; and the map editor's
// inspector draws a swatch rather than six characters to type by hand.
shows.color('text color', '#ffffff');
// Which part of the word sits where it is drawn. The one property here whose
// absence reads as a bug: a score anchored left grows to the right and off the
// screen, and the same score anchored right stays where it was put.
shows.string('text anchor', 'center');

shows.doc(
  '**The words, and how they look.** The rule owns the text and draws none of it.\n\nA Label actor reads these four properties and paints them, which is why the same words can be a speech bubble, a score line or a sign — the drawing is the actor\'s business and the words are yours.\n\n`text` starts EMPTY, because an actor nobody has given words to has none: a Label placed and left alone draws nothing rather than the word "text". The size is in pixels, like every other size in the lab; only rates are in units per second.\n\nSomething writing `text` a few letters at a time — the Speech Box does — types itself out for free, because every drawing already reading it keeps working without knowing anything changed.',
);

export default () => moduleFor(rule, 'writing');
