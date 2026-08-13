import {defineRule, moduleFor} from './dsl.mjs';

const rule = defineRule({
  name: 'Text',
  ability: 'Shows Text',
  header: `// "Shows Text" — the state a drawn word is drawn from.
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
// `#rrggbb`, the spelling every colour block a learner meets produces
// (engine/core/color), so a swatch and this fit the same socket.
shows.string('text color', '#ffffff');
// Which part of the word sits where it is drawn. The one property here whose
// absence reads as a bug: a score anchored left grows to the right and off the
// screen, and the same score anchored right stays where it was put.
shows.string('text anchor', 'centre');

export default () => moduleFor(rule, 'text');
