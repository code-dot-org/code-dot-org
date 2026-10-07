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
import {LOOK, RADIUS, RING_INSET, RING_WIDTH, ringRadius, SHADOW} from './look';
import {
  actorFile,
  actsLike,
  chain,
  corner,
  drawParagraph,
  fill,
  me,
  noFill,
  noOutline,
  noShadow,
  num,
  outline,
  rectangle,
  setText,
  shadow,
  showAs,
  swatch,
  textOf,
  useStyle,
  useTrait,
  weight,
  words,
} from './workspace';

/** Taller than a Label, because a face wants room around the word. */
const HEIGHT = 32;

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

/** `⟨being pressed⟩ of this actor` — the Gestures rule's, and read-only. */
const beingPressed = () => ({
  block: {
    type: 'world_get_Gestures_BeingPressedProperty',
    inputs: {ACTOR: me()},
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
    // …and the whole of what makes it look pressed while you hold it, which
    // is the plainest thing this kit was missing: a Button held down was
    // pixel-identical to one at rest.
    //
    // THE MOUSE RULE CANNOT ANSWER THIS. It raises a targeted CLICK and no
    // targeted press — a press is announced to every actor with `Takes Mouse
    // Input` whether the pointer is over it or not, which is the wrong
    // granularity for "am I the one being held". Gestures keeps `being
    // pressed` per actor, set only for those UNDER the pointer when the
    // button went down, and it turns with the actor (specs/GESTURES_PLAN.md).
    useTrait('Gestures#TakesGesturesTrait'),
    // …and the whole of what makes it reachable: the keyboard can be moved to
    // it, and it hears the key that presses it.
    useTrait('Tab Navigation#CanBeFocusedTrait'),
    useTrait('Input#TakesKeyboardInputTrait'),
    showAs('button'),
    {
      type: 'world_set_Boxed_HeightProperty',
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
        // A RAISED SHEET IN THE ONE COLOUR THAT MEANS "PRESS THIS", and no
        // edge at all. It had a white 2px outline, which was the loudest
        // thing in the kit and was doing the job a shadow does better: saying
        // the face is above the page rather than drawn on it
        // (specs/STYLES_PLAN.md).
        noOutline(),
        fill(swatch(LOOK.accent)),
        corner(RADIUS),
        shadow(SHADOW),
        useStyle('button'),
        // …and pressed while it is held. A CLASS ON TOP OF A CLASS, and it
        // is the clearest demonstration of why a style field has three
        // states rather than two: Modern's `pressed` SAYS a lifted fill, says
        // `null` to the shadow — so a raised button sinks into the page while
        // you hold it — and says NOTHING about the corner, which therefore
        // stays exactly as the face set it. Mention, clear, and leave alone
        // (specs/STYLES_PLAN.md).
        onlyIf(beingPressed(), [useStyle('pressed')]),
        rectangle(0, 0, width(), height()),
        // Nothing after the face is raised — a shadow under the caption would
        // be a drop-shadowed word, which is a different decade.
        noShadow(),
        // …and the caption is BOLD, which is the one thing that tells a
        // control you press from a label that describes it, when everything
        // in the kit is one family at one size.
        weight('bold'),
        // THE INK, AS A LITERAL, BEFORE THE CLASS. Every other row in this kit says
        // its own look and then offers to be overruled, and the caption was the one
        // that did not — it went straight to `use style ⟨caption⟩`, which leaves the
        // pen alone when no theme defines one. So in a project with NO theme the
        // caption inherited whatever the FACE had just set, and a Button drew its
        // words in the button colour: invisible (specs/STYLES_PLAN.md).
        fill(swatch(LOOK.ink)),
        useStyle('caption'),
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
          outline(swatch(LOOK.focus), RING_WIDTH),
          // …and it follows the corner it is inset from. A square ring inside
          // a rounded face reads as a mistake rather than as an answer.
          corner(ringRadius(RADIUS)),
          useStyle('ring'),
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
