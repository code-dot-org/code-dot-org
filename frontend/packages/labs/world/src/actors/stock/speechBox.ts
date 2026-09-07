// "Speech Box" — the panel a line of dialogue is read from.
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
// IT SHOWS `text`, WHICH IS WHAT MAKES IT A TYPEWRITER FOR FREE. Give it the
// `Reveals Text` trait and set `the whole line`; that rule writes `text` a few
// letters at a time and this draws whatever `text` says right now. Neither
// knows about the other.
//
// The anchor is READ, not chosen here — as a Label's is — so a box anchored at
// its top-left grows downward as the words arrive, which is what reading looks
// like.

import {
  actorFile,
  drawParagraph,
  fill,
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
/** Room either side of the words, so nothing is read off the edge of the panel. */
const MARGIN = 12;

export const speechBoxActor = actorFile(
  'Speech Box',
  [
    useTrait('Writing#ShowsTextTrait'),
    showAs('speech'),
    // Anchored at the top left, because a box fills downward as it is read. A
    // centered one would jump about as each line arrived.
    setText('TextAnchorProperty', words('top left')),
    // A default, so a box dragged onto a map says something before anybody has
    // typed anything into it — and so the picker has a picture to show.
    setText('TextProperty', words('Once upon a time…')),
  ],
  {
    drawing: {
      width: WIDTH,
      height: HEIGHT,
      commands: [
        // The panel: dark, with a light edge, which is what makes the words on
        // it legible over whatever the scene happens to be.
        fill(swatch('#101828')),
        outline(swatch('#ffffff'), 2),
        rectangle(0, 0, WIDTH, HEIGHT),
        // The edge belongs to the panel and not to the letters: a stroked
        // sentence at this size is a smudge.
        noOutline(),
        fill(textOf('TextColorProperty')),
        drawParagraph(MARGIN, MARGIN, WIDTH - MARGIN * 2),
      ],
    },
  },
);
