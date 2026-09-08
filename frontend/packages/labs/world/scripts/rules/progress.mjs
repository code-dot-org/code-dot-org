import {defineRule, moduleFor} from './dsl.mjs';

const rule = defineRule({
  name: 'Progress',
  ability: 'Shows Progress',
  purpose: `**Progress** is how far along something is, as a number between 0 and 1.

Health left, a bar filling, a level part-finished. It owns the *fraction* and
paints none of it — a Progress Bar actor draws it, the way a Label draws
Writing's words.

Give anything with a fraction **Shows Progress**.`,
  header: `// "Shows Progress" — how far along something is, as a number between 0 and 1.
//
// WRITING'S SIBLING, and written to be read beside it. That rule owns the words
// an actor says and paints none of them; this owns the FRACTION an actor is at
// and paints none of it either. A Label draws the one, a Progress Bar draws the
// other, and both are actors in the library rather than anything the engine
// knows about (specs/UI_ACTORS.md).
//
// WHY IT IS A RULE AND NOT THE BAR'S OWN NUMBER — and the reason is SHARING,
// which is not the reason this used to give.
//
// It used to say that a \`define property\` in an \`.actor\` file mints its
// getter and setter into that file's palette and NOWHERE ELSE, so a bar
// keeping its own fraction would be a bar nothing could fill. That stopped
// being true when an actor's own properties became exported and every actor's
// landed in every file's palette — which is how the stock Health Bar keeps
// \`subject\`, a name for something no rule has any business owning.
//
// What is left is the argument that was always the real one. A Progress Bar, a
// Health Bar and a Fuel Bar all mean the same thing by \`fraction\`, and a rule
// is for what is SHARED — the test \`specs/UI_ACTORS.md\` states while working
// out that same Health Bar: \`text\` is Writing's because a Label and a Button
// and a Score all mean the same thing by it, and \`subject\` is the bar's own
// because nobody else means anything by it at all.
//
// AND THE TRAIT IS THE ONLY THING THAT NAMES THE FAMILY. A Health Bar ACTS
// LIKE a Progress Bar, and kinds are not inherited — an instance carries the
// module it was placed from, so a Health Bar is never one of
// \`any ⟨Progress Bar⟩\` (\`ActorBuilder.actsLike\`). What carries across is the
// trait, so \`⟨has trait ⟨Shows Progress⟩⟩\` is the only way to say "every bar
// in this game", and there would be no way to say it without this rule.
//
// A RULE WITH NO STEPS. Nothing about a fraction happens over time: what moves
// it is a project's own handler — a coin taken, a hit landed, a file loaded —
// and what draws it is the actor that elected this. It exists to be elected
// and to be set.
//
// NOT CLAMPED, and it does not need to be. A fraction above 1 draws a bar
// wider than its canvas and a canvas is what a drawing is rasterized into, so
// it is clipped by the picture rather than by arithmetic; below 0 there is
// nothing to draw. Rejecting the number instead would mean a rule that
// silently disagrees with the block that set it.
//
// HORIZONTAL IS NOT A CHOICE THIS MAKES. A bar drawn along x and turned
// ninety degrees is a bar drawn along y — rotation is already every actor's,
// so a "direction" here would be a second way to say something the language
// says already.`,
});

const shows = rule.trait('Shows Progress');
export const ShowsProgress = rule.traitRef('Shows Progress');

// Full, because a bar nobody has told anything to is a bar showing what it
// was given — and a game that forgets to set one has an obvious bug rather
// than an empty bar that looks deliberate.
export const fraction = shows.number('fraction', 1);
// The part that fills. Red is the health bar's color because health is what
// most learners put in the first one they make.
shows.color('bar color', '#e04040');
// …and the part it fills up. Dark, so an empty bar still reads as a bar with
// nothing in it rather than as nothing at all.
shows.color('track color', '#301820');

shows.doc(
  "**A fraction, and two colors.** That is the whole rule — it owns how far along something is and draws none of it.\n\n`fraction` runs from 0 to 1: empty to full. A Progress Bar actor reads it and paints that much of itself in the bar color and the rest in the track color, the way a Label reads Writing's words.\n\nAnything that is a proportion belongs here — health left, a level part-finished, a charge building. Work out the fraction with a division (`health / max health`) and set it; keeping it between 0 and 1 is Boundaries' `keep between` block.\n\nIt starts FULL, so a bar nobody has told anything to reads as a bar rather than as an empty frame that looks deliberate.",
);

export default () => moduleFor(rule, 'progress');
