import {
  add,
  atLeast,
  atMost,
  defineRule,
  doc,
  firstCharacters,
  frameTime,
  moduleFor,
  n,
  no,
  not,
  note,
  param,
  textLength,
  thisActor,
  times,
  when,
  yes,
} from './dsl.mjs';
import {ShowsText, text} from './writing.mjs';

const rule = defineRule({
  name: 'Reveals Text',
  ability: 'Reveals Text',
  purpose: `**Reveals Text** is words arriving a few letters at a time — the typewriter
every game with dialogue has.

Give an actor **Reveals Text** and set how fast the letters come. What is
actually drawn is Writing's job; this decides how much of it is showing.`,
  header: `// "Reveals Text" — words arriving a few letters at a time.
//
// The typewriter every game with dialogue has, and the reason it is a rule
// rather than a thing each project writes: it is a counter, a clamp and a
// substring, and getting the clamp wrong shows a line that is one letter short
// for ever.
//
// IT WRITES \`Writing\`'S OWN \`text\`, the way Camera Follow writes the Camera's
// goal. That is what makes it compose: a Label and a Button already draw
// \`text\`, so either reveals itself without knowing anything has changed, and
// nothing here has to know how words are drawn.
//
// So the line lives in \`the whole line\` and \`text\` is the part of it shown so
// far. Setting \`the whole line\` starts it again from nothing, which is what
// "say the next thing" means — and it is why the author sets THAT and never
// \`text\`, which this overwrites every frame.
//
// \`letters shown\` is a NUMBER and not an integer, because time is not made of
// letters: at twenty a second a sixtieth of a second is a third of a letter,
// and rounding each frame would lose the remainder and drift slow. The
// substring takes it as-is; Blockly's own block truncates.`,
});
rule.uses('Writing');

const reveals = rule.trait('Reveals Text');
reveals.uses(ShowsText);

/**
 * The line being revealed. READ-ONLY: `say` is how a new one arrives.
 *
 * It was settable, and that was a bug the first scene found. The counter is
 * this rule's, so only this rule can put it back to nothing — and a plain
 * `set` cannot, having no way to say "and start again". A second line shorter
 * than the first was therefore never written at all: the counter was already
 * past its end, so the step that writes `text` saw nothing left to do and the
 * box went on showing the line before.
 */
const whole = reveals.string('the whole line', '', {readonly: true});
/** Letters a second. Twenty is about reading pace. */
const speed = reveals.number('letters a second', 20);
/**
 * How much has arrived, in letters — fractional, and read-only.
 */
const shown = reveals.number('letters shown', 0, {readonly: true});
/** Whether the whole line has arrived, so a step can stop and an event fire once. */
const done = reveals.boolean('all shown', false, {readonly: true});

export const RevealsText = rule.traitRef('Reveals Text');

/** `when ⟨…⟩ finishes revealing` — the cue to wait for a click. */
export const finished = reveals.event(['finishes revealing']);

/**
 * `⟨…⟩ say ⟨words⟩` — a new line, from the beginning.
 *
 * One action rather than two writes, because the two must not be able to
 * disagree: a line set without the counter reset is a line that never appears,
 * and a counter reset without a line is the last one typed out again.
 */
reveals.block({
  // `returns` is not optional. Without it the block is not minted at all —
  // silently, so the rule looks right, generates, and offers nothing. Both
  // actions here were missing for exactly that reason until a scene tried to
  // call one.
  returns: 'none',
  // `string`, and not `text`: an unrecognised type falls back to Number
  // without complaint, so the socket refused the words it was handed and the
  // error arrived at the far end as a connection check.
  say: ['say', param('words', 'string')],
  body: ({words}) => [
    whole.set(thisActor(), words.get()),
    shown.set(thisActor(), n(0)),
    done.set(thisActor(), no()),
    note('Nothing shown yet, which is what the first frame draws.'),
    text.set(thisActor(), firstCharacters(words.get(), n(0))),
  ],
});

/**
 * `make ⟨…⟩ show all of it` — the impatient click, and the skip button.
 *
 * Every game with a typewriter needs it, and a project writing it by hand
 * would set `letters shown` — which is read-only, and rightly: this rule owns
 * the count.
 */
reveals.block({
  returns: 'none',
  say: ['show all of it'],
  body: () => [shown.set(thisActor(), textLength(whole.of(thisActor())))],
});

reveals.step('reveal a few more', 'react', [
  doc(
    '**Typing the line out, a few letters a frame.**\n\n`shown` is how many letters have arrived, and it grows by `speed x the length of the frame` — letters per SECOND, so the text appears at the same rate however fast the game is running. The text shown is simply the first `shown` characters of the whole line.\n\nIt counts past the end of the line by design: reaching the end is what raises `all shown`, and starting a new line zeroes the count, so nothing has to remember a flag.',
  ),
  when([
    [
      // Nothing to do once it has all arrived. Guarded on the count rather
      // than on `all shown`, so setting a new line — which zeroes the count
      // — starts it again with no flag to remember to clear.
      atMost(shown.of(thisActor()), textLength(whole.of(thisActor()))),
      [
        shown.set(
          thisActor(),
          add(shown.of(thisActor()), times(speed.of(thisActor()), frameTime())),
        ),
        text.set(
          thisActor(),
          firstCharacters(whole.of(thisActor()), shown.of(thisActor())),
        ),
      ],
    ],
  ]),
  when([
    [
      // Raised ONCE, on the frame it completes: `all shown` is what stops it
      // firing every frame afterwards, and the count alone could not say
      // whether this frame is the one.
      atLeast(shown.of(thisActor()), textLength(whole.of(thisActor()))),
      [
        when([
          [
            not(done.of(thisActor())),
            [done.set(thisActor(), yes()), finished({}, thisActor())],
          ],
        ]),
      ],
    ],
  ]),
]);

export default () => moduleFor(rule, 'reveals');
