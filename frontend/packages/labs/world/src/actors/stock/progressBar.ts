// "Progress Bar" — a fraction, drawn.
//
// The Label's sibling: that actor draws the words a rule holds, this draws the
// number one holds (specs/UI_ACTORS.md). Two rectangles and one expression —
// a track that is always the whole canvas, and a fill whose WIDTH is the
// canvas times how far along the actor is.
//
// WHOSE NUMBER IT IS is nobody's business here. `fraction` belongs to the
// Progress rule, so anything in the project may set it: a coin taken, a hit
// landed, a file loaded. A bar that kept its own would be a bar nothing could
// fill, which is why the number is a rule's and not a `define property`.
//
// IT ASKS THE ACTOR, not the world. Everything it draws — the fraction and
// both colours — is read off whoever is running the routine, so two bars of
// this one kind show two different things and neither knows the other exists.
//
// TURN IT for a vertical one. A bar along x rotated ninety degrees is a bar
// along y, and rotation is already every actor's, so there is no direction to
// choose here.

import {
  actorFile,
  fill,
  me,
  num,
  rectangle,
  showAs,
  useTrait,
} from './workspace';

/** The canvas, and so also the actor's size for clicks and collisions. */
const WIDTH = 64;
const HEIGHT = 8;

/** `⟨name⟩ of this actor`, for a property the Progress rule declares. */
const progressOf = (exportName: string) => ({
  block: {type: `world_get_Progress_${exportName}`, inputs: {ACTOR: me()}},
});

/**
 * The picture, as its own thing.
 *
 * EXPORTED, because the stock Health Bar is this bar with a trait added and
 * draws exactly the same way — a second copy of the track, the fill and the
 * expression between them would be somewhere for the two to disagree, and the
 * whole claim of a Health Bar is that it IS a Progress Bar.
 */
export const progressBarDrawing = () => ({
  width: WIDTH,
  height: HEIGHT,
  commands: [
    // The track first and whole, so what is left of it IS the empty part —
    // there is no second rectangle for "the rest", and none to keep in step.
    fill(progressOf('TrackColorProperty')),
    rectangle(0, 0, WIDTH, HEIGHT),
    fill(progressOf('BarColorProperty')),
    {
      type: 'world_draw_rectangle',
      inputs: {
        X: num(0),
        Y: num(0),
        // The one measurement that is not a number. Above 1 this draws wider
        // than the canvas and the canvas clips it; below 0 there is nothing
        // to draw. Neither needs arithmetic to defend against.
        WIDTH: {
          block: {
            type: 'math_arithmetic',
            fields: {OP: 'MULTIPLY'},
            inputs: {A: num(WIDTH), B: progressOf('FractionProperty')},
          },
        },
        HEIGHT: num(HEIGHT),
      },
    },
  ],
});

export const progressBarActor = actorFile(
  'Progress Bar',
  [useTrait('Progress#ShowsProgressTrait'), showAs('bar')],
  progressBarDrawing(),
);
