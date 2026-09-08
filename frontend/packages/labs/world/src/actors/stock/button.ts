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
//
// IT CAN BE REACHED WITHOUT A MOUSE, which is the other half of being a
// control. It elects `Can Be Focused`, takes the focus when it is clicked,
// draws a ring while it has it, and answers Enter — and what Enter does is
// RAISE THE CLICK. That is what every button on every platform does, and it is
// what keeps a project's one handler enough: `when ⟨Start⟩ is clicked` fires
// for the mouse and for the keyboard, and nobody has to write it twice
// (specs/UI_ACTORS.md).
//
// The click it raises says the LEFT button, which is not true and is the least
// wrong of the available answers: the event carries which mouse button was
// used, a keyboard press used none, and every browser reports the primary one
// for exactly this case. A handler filtering on `right` therefore does not
// fire from the keyboard, which is right — a context menu is not a thing Enter
// asks for.

import {labelHalf, labelSizeOf} from './label';
import {
  actorFile,
  actsLike,
  chain,
  drawParagraph,
  fill,
  me,
  noFill,
  noOutline,
  num,
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
/** How far the focus ring sits inside the face, and how thick it is. */
const RING_INSET = 4;
const RING_WIDTH = 2;

const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');

/** `⟨a⟩ − ⟨n⟩`, which is all the arithmetic the ring needs. */
const less = (of: object, n: number) => ({
  block: {
    type: 'math_arithmetic',
    fields: {OP: 'MINUS'},
    inputs: {A: of, B: num(n)},
  },
});

/** `⟨focused⟩ of this actor` — the rule's, and read-only. */
const focused = () => ({
  block: {
    type: 'world_get_TabNavigation_FocusedProperty',
    inputs: {ACTOR: me()},
  },
});

/** `if ⟨test⟩ do ⟨body⟩`. */
const onlyIf = (test: object, body: object[]) => ({
  type: 'controls_if',
  inputs: {IF0: test, DO0: {block: chain(body)}},
});

export const buttonActor = actorFile(
  'Button',
  [
    // FIRST, so everything below overrides it: the height, the word, and the
    // face this paints instead of the Label's plain one.
    actsLike('actors/label'),
    // The whole of what makes it pressable. `is clicked with ⟨button⟩` is
    // raised on this actor alone, so a handler needs no hit test of its own.
    useTrait('Mouse#CanBeClickedTrait'),
    // …and the whole of what makes it reachable: the keyboard can be moved to
    // it, and it hears the key that presses it.
    useTrait('Tab Navigation#CanBeFocusedTrait'),
    useTrait('Input#TakesKeyboardInputTrait'),
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
    handlers: [
      // A click brings the keyboard here, the way clicking a button on a page
      // does. `take the focus` releases whoever had it and does nothing when
      // this actor already has it, so the click that presses a focused button
      // raises nothing extra (`rules/tabNavigation`).
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {
          block: {
            type: 'world_do_TabNavigation_TakeTheFocusAction',
            inputs: {ACTOR: me()},
          },
        },
      },
      // …and Enter presses it, but only the one the keyboard is on. Every
      // button hears every key — that is what the trait means — so without the
      // guard one press would click every button on the screen.
      {
        type: 'world_on_Input_PressesEvent',
        fields: {FILTER0: 'enter'},
        inputs: {ACTOR: me()},
        next: {
          block: onlyIf(focused(), [
            {
              type: 'world_emit_Mouse_IsClickedWithEvent',
              inputs: {
                VALUE: {
                  block: {
                    type: 'world_choice_Engine_MouseButton',
                    fields: {VALUE: 'left'},
                  },
                },
                ACTOR: me(),
              },
            },
          ]),
        },
      },
    ],
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
        // …AND THE RING, when the keyboard is on this one. Drawn INSIDE the
        // face rather than around it, which is where a focus ring usually
        // goes: the canvas is exactly the actor's size, so anything outside it
        // is clipped away and would simply not appear.
        //
        // Last, so it is over the word rather than under it, and in a color
        // that is nothing else on the face — a thicker white edge would read
        // as a rounding artifact rather than as an answer.
        onlyIf(focused(), [
          // AN OUTLINE AND NOTHING ELSE. The pen is still carrying the word's
          // fill at this point, and a filled ring is a rectangle painted over
          // the word.
          noFill(),
          outline(swatch('#ffd45e'), RING_WIDTH),
          rectangle(
            num(RING_INSET),
            num(RING_INSET),
            less(width(), RING_INSET * 2),
            less(height(), RING_INSET * 2),
          ),
        ]),
      ],
    },
  },
);
