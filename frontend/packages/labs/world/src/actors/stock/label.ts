// "Label" — an actor that is words in a box.
//
// The smallest thing the drawing library makes possible, and the smallest
// answer to "how does a game say anything to the player". It is also the BASE
// of the interface set: a Button is a Label that answers a press, a Speech Box
// is a Label that lets its line out slowly, a Text Input is a Label you can
// type into (specs/UI_ACTORS.md). Everything below is inherited by all of
// them, so it is worth keeping small enough to read.
//
// IT IS AS BIG AS IT SAYS IT IS. `width` and `height` are its own properties
// and the drawing is sized from them, so two Labels of one kind are two boxes
// — which is the first thing somebody arranging a dialog reaches for, and was
// impossible while a drawing's size was two numbers typed into the block.
//
// THE WORDS FILL THE BOX. `draw paragraph` wraps them to the column and breaks
// where the text says to, so a Label holds a sentence rather than a word. A
// single word wider than the column overhangs rather than being cut, which is
// the least surprising of the wrong answers.
//
// It breaks on a newline the text carries too, which is half of what a Label
// needs to hold a paragraph; the other half is a way to SAY one in blocks, and
// that is the string concatenation this does not have yet
// (specs/UI_ACTORS.md).
//
// THE ANCHOR IS READ, NOT CHOSEN HERE. The words are drawn at the middle of
// the box with whatever anchor the actor carries, so `center` centers them and
// `right` ends them there — which is what a score counting up wants, since it
// then grows leftwards instead of walking off the screen. A block of several
// lines is centered as a block, which the painter already does for any anchor
// that is vertically middled.

import {
  actorFile,
  defineProperty,
  drawParagraph,
  fill,
  me,
  setText,
  showAs,
  textOf,
  useTrait,
  words,
} from './workspace';

/** How big a Label is unless a project says otherwise. */
const WIDTH = 96;
const HEIGHT = 24;

/** `⟨width⟩ of this actor`, and its sibling — what the box is drawn from. */
const sizeOf = (name: 'Width' | 'Height') => ({
  block: {
    type: `world_get_ActorsLabel_${name}Property`,
    inputs: {ACTOR: me()},
  },
});

/** `⟨n⟩ ÷ 2` — the middle of the box, whatever the box is. */
const half = (of: object) => ({
  block: {
    type: 'math_arithmetic',
    fields: {OP: 'DIVIDE'},
    inputs: {A: of, B: {shadow: {type: 'math_number', fields: {NUM: 2}}}},
  },
});

/**
 * The box a Label draws in, as rows.
 *
 * EXPORTED, because a world may define a Label of its own rather than import
 * the file — a single-world project has no actor files to act like — and the
 * two tellings must declare the same properties or they are two different
 * Labels. The same bargain `PROGRESS_BAR_PROPERTIES` strikes one file over.
 */
export const LABEL_PROPERTIES = [
  defineProperty('number', 'width', String(WIDTH)),
  defineProperty('number', 'height', String(HEIGHT)),
];

export const labelActor = actorFile(
  'Label',
  [
    useTrait('Writing#ShowsTextTrait'),
    ...LABEL_PROPERTIES,
    showAs('text'),
    // A default, so a Label dragged onto a map is visible before anybody has
    // typed anything into it — and so the picker has a picture to show.
    setText('TextProperty', words('Label')),
  ],
  {
    drawing: {
      width: sizeOf('Width'),
      height: sizeOf('Height'),
      commands: [
        fill(textOf('TextColorProperty')),
        // The column is the whole box, so the words wrap where the box ends.
        drawParagraph(
          half(sizeOf('Width')),
          half(sizeOf('Height')),
          sizeOf('Width'),
        ),
      ],
    },
  },
);
