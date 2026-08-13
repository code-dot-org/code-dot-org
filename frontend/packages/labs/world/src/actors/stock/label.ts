// "Label" — an actor that is a word.
//
// The smallest thing the drawing library makes possible, and the smallest
// answer to "how does a game say anything to the player". Two rows and two
// commands, and a learner can read all of it (specs/UI_ACTORS.md).
//
// THE ANCHOR IS READ, NOT CHOSEN HERE. The text is drawn at the middle of the
// canvas with whatever anchor the actor carries, so `centre` centres it on the
// actor and `right` ends it there — which is what a score counting up wants,
// since it then grows leftwards instead of walking off the screen. Nothing
// measures the text to work that out; the anchor is resolved where it is drawn.

import {
  actorFile,
  drawText,
  fill,
  setText,
  textOf,
  useTrait,
  words,
} from './workspace';

/** The canvas, and so also the actor's size for clicks and collisions. */
const WIDTH = 96;
const HEIGHT = 24;

export const labelActor = actorFile(
  'Label',
  [
    useTrait('Text#ShowsTextTrait'),
    // A default, so a Label dragged onto a map is visible before anybody has
    // typed anything into it — and so the picker has a picture to show.
    setText('TextProperty', words('Label')),
  ],
  {
    width: WIDTH,
    height: HEIGHT,
    commands: [
      fill(textOf('TextColorProperty')),
      drawText(WIDTH / 2, HEIGHT / 2),
    ],
  },
);
