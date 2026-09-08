// "Button" — a Label you can press.
//
// The demonstration that an interface actor is an actor, and the first one to
// say what it is in a row: it ACTS LIKE a Label, so the words, their size,
// their color, their anchor and the box they are laid into all come across,
// and what is left here is the two things a Button adds — an edge, and an
// answer to a press (specs/UI_ACTORS.md).
//
// IT IS NOT A LABEL, and that is deliberate. `any ⟨Label⟩` finds the Labels
// and not the buttons, because a kind is what an instance was placed from and
// is never inherited (`ActorBuilder.actsLike`). What a Button and a Label have
// in common is what they can DO, which is what the trait relationship is for.
//
// Its face is painted here rather than carried as state, and that is the line
// this draws: what a Button IS gets a property, what this particular button
// LOOKS like is a routine you open and edit. A learner who wants a red button
// changes one swatch in a file they can read.

import {labelHalf, labelSizeOf} from './label';
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

/** Taller than a Label, because a face wants room around the word. */
const HEIGHT = 32;

const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');

export const buttonActor = actorFile(
  'Button',
  [
    // FIRST, so everything below overrides it: the height, the word, and the
    // face this paints instead of the Label's plain one.
    actsLike('actors/label'),
    // The whole of what makes it pressable. `is clicked with ⟨button⟩` is
    // raised on this actor alone, so a handler needs no hit test of its own.
    useTrait('Mouse#CanBeClickedTrait'),
    showAs('button'),
    {
      type: 'world_set_ActorsLabel_HeightProperty',
      inputs: {
        ACTOR: me(),
        VALUE: {shadow: {type: 'math_number', fields: {NUM: HEIGHT}}},
      },
    },
    setText('TextProperty', words('Button')),
  ],
  {
    drawing: {
      width: width(),
      height: height(),
      commands: [
        fill(swatch('#3050a0')),
        outline(swatch('#ffffff'), 2),
        rectangle(0, 0, width(), height()),
        // The edge belongs to the face, not to the word: a stroked letter at
        // this size is a smudge.
        noOutline(),
        fill(textOf('TextColorProperty')),
        drawParagraph(labelHalf(width()), labelHalf(height()), width()),
      ],
    },
  },
);
