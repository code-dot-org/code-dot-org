// "Speech Box" — the panel a line of dialogue is read from, typing itself out.
//
// NOT a "text box", which everywhere else means a thing you type INTO — and
// `specs/UI_ACTORS.md` already reserves "Text field" for that one, still
// waiting on a keyboard the world does not own. This is the other thing: a
// Label with a panel behind it and room for a sentence.
//
// A PARAGRAPH, not a word. Drawn text is one line of canvas and canvas ignores
// newlines, so until `draw paragraph` existed a box of dialogue was not
// something this lab could draw at all. The column is the box's width less a
// margin either side.
//
// THE TYPEWRITER IS ORDINARY BLOCKS, and they are the same blocks any actor
// with words can be given (`actors/typewriter`, `enhance/typesOutText`). What
// is the Speech Box's own is that it ships with them: a box a learner drags in
// says its lines a letter at a time without being told to.
//
// The anchor is READ, not chosen here — as a Label's is — so a box anchored at
// its top-left grows downward as the words arrive, which is what reading looks
// like.

import {typewriterFor} from '../typewriter';

import {labelSizeOf} from './label';
import {
  actorFile,
  actsLike,
  drawParagraph,
  fill,
  me,
  noOutline,
  outline,
  rectangle,
  setText,
  showAs,
  swatch,
  textOf,
  useTrait,
  words,
} from './workspace';

/** Most of the width of a 320-pixel screen, and a third of its height. */
const WIDTH = 280;
const HEIGHT = 96;

/** `⟨width⟩ of this actor`, the Label's, inherited by acting like one. */
const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');

/** `set ⟨width⟩ of this actor to ⟨n⟩` — a box bigger than a Label's. */
const setSize = (name: 'Width' | 'Height', value: number) => ({
  type: `world_set_ActorsLabel_${name}Property`,
  inputs: {
    ACTOR: me(),
    VALUE: {shadow: {type: 'math_number', fields: {NUM: value}}},
  },
});
/** Room either side of the words, so nothing is read off the edge of the panel. */
const MARGIN = 12;

/** `⟨width⟩ - 24` — the column, once both margins are taken off it. */
const inset = (of: object) => ({
  block: {
    type: 'math_arithmetic',
    fields: {OP: 'MINUS'},
    inputs: {
      A: of,
      B: {shadow: {type: 'math_number', fields: {NUM: MARGIN * 2}}},
    },
  },
});

/** Its own file, which is what its blocks are named after. */
const typewriter = typewriterFor('actors/speechBox');

export const speechBoxActor = actorFile(
  'Speech Box',
  [
    // A LABEL WITH A PANEL BEHIND IT, said in a row: the words, their size and
    // color, and the box they are laid into all come across
    // (`ActorBuilder.actsLike`). It is not one of `any ⟨Label⟩` afterwards —
    // a kind is never inherited — which is right, since a scene addressing its
    // labels should not be addressing its dialogue.
    actsLike('actors/label'),
    useTrait('Time#HasATimerTrait'),
    showAs('speech'),
    setSize('Width', WIDTH),
    setSize('Height', HEIGHT),
    ...typewriter.rows,
    // Anchored at the top left, because a box fills downward as it is read. A
    // centered one would jump about as each line arrived.
    setText('TextAnchorProperty', words('top left')),
    // A default, so a box dragged onto a map says something before anybody has
    // typed anything into it — and so the picker has a picture to show. It
    // survives the first frame because the typewriter's timer is stopped until
    // something is said.
    setText('TextProperty', words('Once upon a time…')),
  ],
  {
    variables: typewriter.variables,
    handlers: [typewriter.handler],
    drawing: {
      width: width(),
      height: height(),
      commands: [
        // The panel: dark, with a light edge, which is what makes the words on
        // it legible over whatever the scene happens to be.
        fill(swatch('#101828')),
        outline(swatch('#ffffff'), 2),
        rectangle(0, 0, width(), height()),
        // The edge belongs to the panel and not to the letters: a stroked
        // sentence at this size is a smudge.
        noOutline(),
        fill(textOf('TextColorProperty')),
        // Inset from the box it is given, rather than from the size this file
        // happens to name: a wider box is a wider column.
        drawParagraph(MARGIN, MARGIN, inset(width())),
      ],
    },
  },
);
