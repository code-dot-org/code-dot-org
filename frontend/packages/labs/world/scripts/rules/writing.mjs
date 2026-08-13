import {defineRule, moduleFor} from './dsl.mjs';

const rule = defineRule({
  name: 'Writing',
  ability: 'Shows Text',
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

// Empty, because every actor that has not been given words has none. A Label
// placed and left alone draws nothing rather than the word "text".
shows.string('text', '');
// Pixels, like every other size in the lab (engine/core/units): positions and
// sizes are pixels and only RATES are in units.
shows.number('text size', 12);
// A COLOUR, not a string that happens to hold one. What the type buys is the
// two places that ask what a property is: `get text color` reports `Colour`, so
// it plugs into `set fill` and into an effect's parameter; and the map editor's
// inspector draws a swatch rather than six characters to type by hand.
shows.color('text color', '#ffffff');
// Which part of the word sits where it is drawn. The one property here whose
// absence reads as a bug: a score anchored left grows to the right and off the
// screen, and the same score anchored right stays where it was put.
shows.string('text anchor', 'centre');

export default () => moduleFor(rule, 'writing');
