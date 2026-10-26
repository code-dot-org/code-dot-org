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

import {LOOK} from './look';
import {
  actorFile,
  defineProperty,
  drawParagraph,
  fill,
  me,
  setText,
  showAs,
  swatch,
  textOf,
  useStyle,
  useTrait,
  words,
} from './workspace';

/** How big a Label is unless a project says otherwise. */
const WIDTH = 96;
const HEIGHT = 24;

/**
 * `⟨width⟩ of this actor`, and its sibling — what the box is drawn from.
 *
 * THE BOX IS NOT THE LABEL'S ANY MORE. It is the `Has a Box` trait's, which
 * every interface kind elects and which the map editor can ask about without
 * knowing what
 * it is looking at (`engine/rules/boxed`, specs/BOXES_PLAN.md). This still
 * lives here and is still what everything reads through, because everything
 * that ACTS LIKE a Label inherits the election along with the properties
 * (`ActorBuilder.actsLike` copies the traits) — a Button's panel and a Speech
 * Box's panel are both "as big as this actor says it is".
 */
export const labelSizeOf = (name: 'Width' | 'Height') => ({
  block: {
    type: `world_get_Boxed_${name}Property`,
    inputs: {ACTOR: me()},
  },
});

/** `⟨n⟩ ÷ 2` — the middle of the box, whatever the box is. Exported with it. */
export const labelHalf = (of: object) => ({
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
  // THE WORDS AND HOW THEY LOOK. These were the Writing rule's — four
  // properties and no behavior of any kind, which is a file and a shelf row
  // standing between a learner and four declarations they can read in the
  // actor that draws them. Every actor that shows words either acts like this
  // one or declares these itself (specs/UI_ACTORS.md).
  //
  // `text` starts EMPTY, because an actor nobody has given words to has none:
  // a Label placed and left alone draws nothing rather than the word "text".
  // The size is in pixels, like every other size in the lab; only rates are in
  // units per second. The anchor is the one whose absence reads as a bug — a
  // score anchored left grows to the right and off the screen.
  defineProperty('string', 'text', ''),
  defineProperty('number', 'text size', '12'),
  // EMPTY, NOT WHITE, and the difference is the whole of how a theme reaches
  // a caption. `#ffffff` is not a choice anybody made, and the row that reads
  // this property overrode whatever the actor's class had just set — so a
  // Classic button drew a white caption on a light grey face. An unset colour
  // now leaves the pen as it was (`CommandPen.fill`), and every text row is
  // preceded by its `use style`, so what it falls through to is the class.
  //
  // A project with NO theme is unchanged: the pen's own default fill is
  // `#ffffff`, which is exactly what this default used to be.
  defineProperty('color', 'text color', ''),
  defineProperty('string', 'text anchor', 'center'),
];

/** `set ⟨width|height⟩ of this actor to ⟨n⟩` — the trait's, not the Label's. */
export const setBox = (name: 'Width' | 'Height', value: number) => ({
  type: `world_set_Boxed_${name}Property`,
  inputs: {
    ACTOR: me(),
    VALUE: {shadow: {type: 'math_number', fields: {NUM: value}}},
  },
});

export const labelActor = actorFile(
  'Label',
  [
    ...LABEL_PROPERTIES,
    // The box, elected rather than declared — and elected HERE, so the eight
    // kinds that act like a Label get it without each saying so
    // (specs/BOXES_PLAN.md).
    useTrait('Boxed#HasABoxTrait'),
    // …and which theme it is painted out of, when it is not the world's
    // (specs/STYLES_PLAN.md). Elected by the same kinds for the same reason:
    // an inspector cannot ask a Coin what its theme is.
    useTrait('Styled#HasAStyleTrait'),
    setBox('Width', WIDTH),
    setBox('Height', HEIGHT),
    showAs('text'),
    // A default, so a Label dragged onto a map is visible before anybody has
    // typed anything into it — and so the picker has a picture to show.
    setText('TextProperty', words('Label')),
  ],
  {
    drawing: {
      width: labelSizeOf('Width'),
      height: labelSizeOf('Height'),
      commands: [
        // THE INK, AS A LITERAL, BEFORE THE CLASS. Every other row in this kit says
        // its own look and then offers to be overruled, and the caption was the one
        // that did not — it went straight to `use style ⟨caption⟩`, which leaves the
        // pen alone when no theme defines one. So in a project with NO theme the
        // caption inherited whatever the FACE had just set, and a Button drew its
        // words in the button colour: invisible (specs/STYLES_PLAN.md).
        fill(swatch(LOOK.ink)),
        useStyle('caption'),
        fill(textOf('TextColorProperty')),
        // The column is the whole box, so the words wrap where the box ends.
        drawParagraph(
          labelHalf(labelSizeOf('Width')),
          labelHalf(labelSizeOf('Height')),
          labelSizeOf('Width'),
        ),
      ],
    },
  },
);
