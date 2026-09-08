// "Progress Bar" — a fraction, drawn.
//
// The Label's sibling: that actor draws the words a rule holds, this draws the
// number one holds (specs/UI_ACTORS.md). Two rectangles and one expression —
// a track that is always the whole canvas, and a fill whose WIDTH is the
// canvas times how far along the actor is.
//
// THE NUMBER AND THE TWO COLORS ARE ITS OWN, declared right here with
// `define property`. They were a rule — `Progress`, which had three properties
// and nothing else: no steps, no blocks, no behavior of any kind. A rule that
// only holds properties is a file, a shelf row and an import standing between
// a learner and three declarations they can read in the actor that uses them.
//
// ANYTHING MAY STILL SET THEM, which is the whole point of a progress bar and
// used to be the argument for the rule. An actor's own properties are exported
// and every actor's are in every file's palette, so `set fraction of ⟨any
// ⟨Progress Bar⟩⟩` is a sentence a world can say — the same change that let
// the Health Bar keep `subject` (blockly/ownProperties).
//
// AND A BAR THAT IS NOT ONE still gets them: the Health Bar and the jetpack's
// Fuel Bar ACT LIKE this actor, so the slots come across with the picture
// (`ActorBuilder.actsLike`).
//
// IT ASKS THE ACTOR, not the world. Everything it draws — the fraction and
// both colors — is read off whoever is running the routine, so two bars of
// this one kind show two different things and neither knows the other exists.
//
// TURN IT for a vertical one. A bar along x rotated ninety degrees is a bar
// along y, and rotation is already every actor's, so there is no direction to
// choose here.

import {
  actorFile,
  defineProperty,
  fill,
  me,
  num,
  rectangle,
  showAs,
} from './workspace';

/** The canvas, and so also the actor's size for clicks and collisions. */
const WIDTH = 64;
const HEIGHT = 8;

/**
 * What a bar is made of: how far along it is, and the two colors it is drawn
 * in.
 *
 * EXPORTED as rows, because a world may define a bar of its OWN rather than
 * import this file (fixtures/platformerSingle) and the two tellings must
 * declare the same three properties or they are two different bars — the same
 * bargain `HEALTH_BAR_SUBJECT` strikes one file over.
 *
 * `fraction` starts FULL, so a bar nobody has told anything to reads as a bar
 * rather than as an empty frame that looks deliberate. Red is the bar color
 * because health is what most learners put in the first one they make; the
 * track is dark, so an empty bar still reads as a bar with nothing in it.
 */
export const PROGRESS_BAR_PROPERTIES = [
  defineProperty('number', 'fraction', '1'),
  defineProperty('color', 'bar color', '#e04040'),
  defineProperty('color', 'track color', '#301820'),
];

/**
 * `⟨name⟩ of this actor`, for one of the three above.
 *
 * `own` is the declaring file as a block-type segment — `ActorsProgressBar`
 * for this file, `WorldsMain<block>` for a bar a world defines for itself. An
 * own member's block type carries the file that declared it
 * (`ruleRegistry.memberLocalName`), so the two tellings cannot share the
 * literal blocks and do share the shape.
 */
const progressOf = (own: string, exportName: string) => ({
  block: {type: `world_get_${own}_${exportName}`, inputs: {ACTOR: me()}},
});

/**
 * The picture, as its own thing.
 *
 * EXPORTED for the ONE telling that cannot inherit it: a bar a world defines
 * for itself has no file to act like this one from, so it declares the three
 * properties and draws this picture out of them (fixtures/platformerSingle).
 * Every other bar in the lab is this actor or acts like it, and gets the
 * picture with everything else.
 */
export const progressBarDrawing = (own = 'ActorsProgressBar') => ({
  width: WIDTH,
  height: HEIGHT,
  commands: [
    // The track first and whole, so what is left of it IS the empty part —
    // there is no second rectangle for "the rest", and none to keep in step.
    fill(progressOf(own, 'TrackColorProperty')),
    rectangle(0, 0, WIDTH, HEIGHT),
    fill(progressOf(own, 'BarColorProperty')),
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
            inputs: {A: num(WIDTH), B: progressOf(own, 'FractionProperty')},
          },
        },
        HEIGHT: num(HEIGHT),
      },
    },
  ],
});

export const progressBarActor = actorFile(
  'Progress Bar',
  [...PROGRESS_BAR_PROPERTIES, showAs('bar')],
  {drawing: progressBarDrawing()},
);
