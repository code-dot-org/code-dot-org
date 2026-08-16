// "Button" — a Label you can press.
//
// The demonstration that an interface actor is an actor. Nothing here is new:
// the click is `Can Be Clicked` from the mouse rule, the words are `Shows Text`,
// and the picture is a drawing. A button is what happens when the three are put
// in one file (specs/UI_ACTORS.md).
//
// Its face is painted here rather than carried as state, and that is the line
// this draws: what a Button IS gets a property, what this particular button
// LOOKS like is a routine you open and edit. A learner who wants a red button
// changes one swatch in a file they can read.

import {
  actorFile,
  drawText,
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

const WIDTH = 96;
const HEIGHT = 32;

export const buttonActor = actorFile(
  'Button',
  [
    useTrait('Writing#ShowsTextTrait'),
    // The whole of what makes it pressable. `is clicked with ⟨button⟩` is
    // raised on this actor alone, so a handler needs no hit test of its own.
    useTrait('Mouse#CanBeClickedTrait'),
    showAs('button'),
    setText('TextProperty', words('Button')),
  ],
  {
    width: WIDTH,
    height: HEIGHT,
    commands: [
      fill(swatch('#3050a0')),
      outline(swatch('#ffffff'), 2),
      rectangle(0, 0, WIDTH, HEIGHT),
      // The edge belongs to the face, not to the word: a stroked letter at this
      // size is a smudge.
      noOutline(),
      fill(textOf('TextColorProperty')),
      drawText(WIDTH / 2, HEIGHT / 2),
    ],
  },
);
