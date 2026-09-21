// "Image" — a picture in a box you decide the size of.
//
// ANY ACTOR CAN ALREADY SHOW A SPRITE: `set sprite` is the engine's own, and a
// Coin and a Player are actors with pictures. What none of them is, is a
// picture laid out with the rest of an interface — a thumbnail in a row, an
// avatar beside a name, an illustration on a card. Those want a BOX: a width
// and a height the project chooses, that the picture is made to sit in,
// whatever size the file happens to be (specs/UI_ACTORS.md).
//
// So this is a Label's box with a picture in it. It acts like a Label for the
// width and the height — the same two properties every other interface actor
// is measured by, so an Image drops into a row beside a Button and a Slider
// and lines up — and it fits the picture to them every frame.
//
// THE FITTING IS SCALE, because that is the only thing the engine offers. An
// actor is drawn at its intrinsic size times its scale, so making a 400-wide
// photograph 100 wide is a scale of a quarter. Which means:
//
//   • FIT keeps the picture's shape and puts the whole of it inside the box,
//     with space left over on one axis. Both axes take the SMALLER ratio.
//   • STRETCH fills the box exactly and distorts, which is sometimes what a
//     banner wants. Each axis takes its own ratio.
//
// AND NOT CROP, which is what an avatar usually wants and what this cannot do.
// Cropping means drawing outside a box and clipping it away, a mask is a no-op
// in this Phaser, and the two things that clip — a camera and an actor's own
// canvas — cannot clip a TEXTURE: a Scroll View clips actors, and a drawing
// clips what the drawing drew. An Image that crops is a Scroll View with one
// picture in it, and is not worth a stock actor until somebody wants one
// (specs/SCROLLING_PLAN.md).

import {setBox} from './label';
import {PORTRAIT_SPRITE} from './portrait';
import {
  actorFile,
  defineProperty,
  me,
  useTrait,
  num,
  setSprite,
  showAs,
} from './workspace';

/** How big an Image is unless a project says otherwise. */
const WIDTH = 64;
const HEIGHT = 64;

const OWN = 'ActorsImage';

const box = (name: 'Width' | 'Height') => ({
  block: {type: `world_get_Boxed_${name}Property`, inputs: {ACTOR: me()}},
});
const width = () => box('Width');
const height = () => box('Height');

/**
 * `⟨x|y⟩ of how big the picture is` — zero until there is one.
 *
 * ONE BLOCK, not a component block over a vector one. A VECTOR property is
 * read one axis at a time: the getter carries a `COMPONENT` field and reports
 * a NUMBER, exactly as the rule library reads one (`scripts/rules/dsl`,
 * `axis`). Wrapping it in `⟨y⟩ of ⟨…⟩` puts a number where a vector is wanted,
 * which Blockly answers by refusing the connection and leaving the block at
 * the top of the file — where it generated a bare expression against no
 * statement and the module stopped parsing.
 */
const natural = (which: 'x' | 'y') => ({
  block: {
    type: 'world_get_Space_IntrinsicSizeProperty',
    fields: {COMPONENT: which},
    inputs: {ACTOR: me()},
  },
});

const maths = (a: object, op: string, b: object) => ({
  block: {type: 'math_arithmetic', fields: {OP: op}, inputs: {A: a, B: b}},
});

/** `⟨box⟩ ÷ ⟨picture⟩` on one axis — how much to scale it by. */
const ratio = (axis: 'x' | 'y') =>
  maths(axis === 'x' ? width() : height(), 'DIVIDE', natural(axis));

/**
 * The smaller of the two ratios, which is what puts the whole picture inside.
 *
 * SAID AS A CLAMP, because there is no `min` block: keeping the width's ratio
 * between nothing and the height's ratio IS the smaller of the two, since
 * neither can be negative. The same trick the rule library reaches for
 * (`scripts/rules/dsl`, `keptBetween`).
 */
const smaller = () => ({
  block: {
    type: 'math_constrain',
    inputs: {VALUE: ratio('x'), LOW: num(0), HIGH: ratio('y')},
  },
});

const stretches = () => ({
  block: {type: `world_get_${OWN}_StretchesProperty`, inputs: {ACTOR: me()}},
});

/** `if it stretches then ⟨its own ratio⟩ else ⟨the smaller one⟩`. */
const perAxis = (axis: 'x' | 'y') => ({
  block: {
    type: 'logic_ternary',
    inputs: {IF: stretches(), THEN: ratio(axis), ELSE: smaller()},
  },
});

export const imageActor = actorFile('Image', [
  // NOT `acts like a Label`, which every other boxed interface actor is and
  // which was the first thing tried. A Label brings its DRAWING, and a
  // drawing WINS OVER A SPRITE when an actor has both (`World.renderSnapshot`,
  // `drawing`) — so an Image that acted like a Label drew a label-shaped
  // rectangle and never showed its picture at all. It is a picture with a box
  // round it, not a Label with a picture in it.
  //
  // THE BOX IS STILL SHARED, though: `Has a Box` is a trait nine kinds elect,
  // and an Image not being a Label is no reason for it to invent a second
  // `width` (specs/BOXES_PLAN.md). Not acting like a Label only means it has
  // to say this itself.
  showAs('image'),
  useTrait('Boxed#HasABoxTrait'),
  setBox('Width', WIDTH),
  setBox('Height', HEIGHT),
  // A picture to start with, so an Image placed in the map editor is
  // something you can see and move before you have chosen what it shows.
  setSprite(`${PORTRAIT_SPRITE}.png`),
  // Fill the box exactly and distort, or fit inside it and keep the
  // picture's shape. A boolean rather than a choice of words because an
  // actor's own properties have no enum type, and two answers do not need
  // one (`blockly/ruleMeta`, PROPERTY_TYPES).
  defineProperty('boolean', 'stretches', 'FALSE'),
  {
    type: 'world_trait_step',
    // In `react`, the last phase whose subject is an ACTOR — the same one
    // the Health Bar shows its subject's health in, and the same kind of
    // work: read what is true and say how the thing should look.
    //
    // NOT `view`, which is later and reads like exactly the right word for
    // "how it is drawn". Every phase after `react` belongs to the CAMERA
    // (`core/phases`, `subject`), and an actor's step in one of them
    // generates a module that does not parse — with no message naming the
    // phase, the step or the actor.
    fields: {PHASE: 'react', NAME: 'fit the picture'},
    inputs: {
      DO: {
        block: {
          // NOTHING TO FIT UNTIL THERE IS A PICTURE. An actor with no sprite
          // has an intrinsic size of zero, and dividing a box by it is an
          // infinite scale — which draws nothing at all and looks exactly
          // like a missing picture, so the cause would be invisible.
          type: 'controls_if',
          inputs: {
            IF0: {
              block: {
                type: 'logic_compare',
                fields: {OP: 'GT'},
                inputs: {A: natural('x'), B: num(0)},
              },
            },
            DO0: {
              block: {
                // The Space trait's own property. A vector one is set as
                // two NUMBERS, one socket per axis — which is also what
                // lets each axis take its own ratio when it stretches.
                // There is no `set scale`; the block that looks like one
                // sets a CHILD's local scale (`world_set_local_scale`).
                type: 'world_set_Space_ScaleProperty',
                inputs: {ACTOR: me(), X: perAxis('x'), Y: perAxis('y')},
              },
            },
          },
        },
      },
    },
  },
]);
