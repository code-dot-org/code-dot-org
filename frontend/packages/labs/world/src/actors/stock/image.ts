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
// IT IS DRAWN (specs/ACTORS_AS_DATA_PLAN.md, step 4). An interface actor is
// drawn and shown by its icon, so the picture is not the actor's sprite: it
// is a `picture` property, drawn into the box by `draw image ⟨picture⟩ in …`,
// whose drawing is the size of the box. That is the fitting, done where the
// picture's size is known:
//
//   • FITTED keeps the picture's shape and puts the whole of it inside the
//     box, centered, with space left over on one axis.
//   • STRETCHED fills the box exactly and distorts, which is sometimes what a
//     banner wants.
//
// It used to be the actor's sprite, fitted by setting the actor's SCALE each
// frame from the box and the picture's own size — scale being all the engine
// offered a sprite. A drawing is drawn into its own canvas, which also clips
// it, so a crop is one more way to fit and is left for when it is asked for.

import {setBox} from './label';
import {PORTRAIT_SPRITE} from './portrait';
import {
  actorFile,
  defineProperty,
  me,
  useTrait,
  num,
  showAs,
} from './workspace';

/** How big an Image is unless a project says otherwise. */
const WIDTH = 64;
const HEIGHT = 64;

const OWN = 'ActorsImage';

const box = (name: 'Width' | 'Height') => ({
  block: {type: `world_get_Boxed_${name}Property`, inputs: {ACTOR: me()}},
});

/** `⟨picture⟩ of this actor` — what it shows. */
const picture = () => ({
  block: {type: `world_get_${OWN}_PictureProperty`, inputs: {ACTOR: me()}},
});

const stretches = () => ({
  block: {type: `world_get_${OWN}_StretchesProperty`, inputs: {ACTOR: me()}},
});

/** `draw image ⟨picture⟩ in 0 0 ⟨width⟩ ⟨height⟩, fitted|stretched`. */
const drawn = (fit: 'fit' | 'stretch') => ({
  type: 'world_draw_picture',
  fields: {FIT: fit},
  inputs: {
    PICTURE: picture(),
    X: num(0),
    Y: num(0),
    WIDTH: box('Width'),
    HEIGHT: box('Height'),
  },
});

export const imageActor = actorFile(
  'Image',
  [
    // NOT `acts like a Label`, which every other boxed interface actor is.
    // It has no words, and a Label's drawing would be a second picture
    // under its own. It is a picture with a box round it.
    //
    // THE BOX IS STILL SHARED, though: `Has a Box` is a trait every
    // interface kind elects, and an Image not being a Label is no reason for
    // it to invent a second `width` (specs/BOXES_PLAN.md).
    showAs('image'),
    useTrait('Boxed#HasABoxTrait'),
    // …and which theme it is painted out of, when it is not the world's
    // (specs/STYLES_PLAN.md). Elected by the same kinds for the same reason:
    // an inspector cannot ask a Coin what its theme is.
    useTrait('Styled#HasAStyleTrait'),
    setBox('Width', WIDTH),
    setBox('Height', HEIGHT),
    // What it shows, chosen per placement from the project's pictures; one
    // to start with, so an Image placed in the map editor is something you
    // can see and move before you have chosen.
    defineProperty('picture', 'picture', `${PORTRAIT_SPRITE}.png`),
    // Fill the box exactly and distort, or fit inside it and keep the
    // picture's shape. A boolean rather than a choice of words because an
    // actor's own properties have no enum type, and two answers do not need
    // one (`blockly/ruleMeta`, PROPERTY_TYPES).
    defineProperty('boolean', 'stretches', 'FALSE'),
  ],
  {
    drawing: {
      width: box('Width'),
      height: box('Height'),
      commands: [
        {
          type: 'controls_if',
          extraState: {hasElse: true},
          inputs: {
            IF0: stretches(),
            DO0: {block: drawn('stretch')},
            ELSE: {block: drawn('fit')},
          },
        },
      ],
    },
  },
);
