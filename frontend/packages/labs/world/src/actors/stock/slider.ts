// "Slider" — a Progress Bar the pointer drags.
//
// The first control whose answer is a NUMBER: volume, difficulty, how fast.
// It ACTS LIKE A PROGRESS BAR, so `fraction` and the two colours are the
// bar's own, and a project reads a slider exactly as it fills a bar — what
// changes is who sets the fraction. Here the pointer does (specs/UI_ACTORS.md,
// "The rest of the toolkit").
//
// A PRESS JUMPS IT, AND A DRAG MOVES IT. The click sets the fraction to where
// the press landed and takes the keyboard; after that the Gestures rule says
// `is dragged by` on every frame the pointer moves, and this follows it. That
// event belongs to the actor the press BEGAN on, which is what lets the
// pointer leave the slider mid-drag and keep moving it (specs/GESTURES_PLAN.md).
//
// It used to do this itself: a `held` boolean set by the click, and a step
// that asked every frame whether the left button was still down. That was a
// drag written out by hand in the one control that needed one, and it is the
// thing the gesture rule exists to stop every control writing again.
//
// `changed` IS ITS OWN EVENT, as the Text Input's is: raised when the fraction
// moves and not otherwise, so a volume screen hears the slider rather than
// watching it. Nudging with the arrow keys raises it too — the slider elects
// focus, as the Button does, so it can be reached and moved without a mouse.
//
// ITS OWN SIZE, in two properties, because a bar eight pixels tall is a poor
// thing to catch with a pointer: the canvas is the actor's click box, and a
// slider is as big as it says it is, like a Label.

import {setBox} from './label';
import {LOOK, RADIUS_BAR, RING_INSET, RING_WIDTH, ringRadius} from './look';
import {
  actorFile,
  actsLike,
  alongX,
  chain,
  corner,
  defineEvent,
  fill,
  me,
  noFill,
  noOutline,
  num,
  outline,
  rectangle,
  showAs,
  swatch,
  useStyle,
  useTrait,
} from './workspace';

/** The Slider's own blocks are keyed by its file (`blockly/ownProperties`). */
const OWN = 'ActorsSlider';
/** …and the bar's, which it acts like and reads its fraction through. */
const BAR = 'ActorsProgressBar';

const WIDTH = 96;
const HEIGHT = 20;
/** The knob's radius, which is also how far the track is inset at each end. */
const KNOB = 7;
const TRACK_HEIGHT = 6;
/** How far an arrow key moves it. */
const STEP = 0.1;

const read = (own: string, exportName: string) => ({
  block: {type: `world_get_${own}_${exportName}`, inputs: {ACTOR: me()}},
});
const width = () => read('Boxed', 'WidthProperty');
const height = () => read('Boxed', 'HeightProperty');
const fraction = () => read(BAR, 'FractionProperty');
const focused = () => ({
  block: {
    type: 'world_get_TabNavigation_FocusedProperty',
    inputs: {ACTOR: me()},
  },
});

const arithmetic = (
  op: 'ADD' | 'MINUS' | 'MULTIPLY' | 'DIVIDE',
  a: object,
  b: object,
) => ({
  block: {type: 'math_arithmetic', fields: {OP: op}, inputs: {A: a, B: b}},
});
const half = (of: object) => arithmetic('DIVIDE', of, num(2));

/** `⟨x|y⟩ of ⟨where the pointer is⟩`, in the world's own coordinates. */
/**
 * Where the pointer is along the slider, from 0 at the left edge to 1 at the
 * right, and held there past either end.
 */
const fractionAtPointer = () => ({
  block: {
    type: 'math_constrain',
    inputs: {
      VALUE: arithmetic(
        'DIVIDE',
        arithmetic('ADD', alongX(), half(width())),
        width(),
      ),
      LOW: num(0),
      HIGH: num(1),
    },
  },
});

const setFraction = (to: object) => ({
  type: `world_set_${BAR}_FractionProperty`,
  inputs: {ACTOR: me(), VALUE: to},
});
const emitChanged = () => ({
  type: `world_emit_${OWN}_ChangedEvent`,
  inputs: {ACTOR: me()},
});
const takeFocus = () => ({
  type: 'world_do_TabNavigation_TakeTheFocusAction',
  inputs: {ACTOR: me()},
});

const either = (test: object, then: object[], otherwise?: object[]) => ({
  type: 'controls_if',
  ...(otherwise ? {extraState: {hasElse: true}} : {}),
  inputs: {
    IF0: test,
    DO0: {block: chain(then)},
    ...(otherwise ? {ELSE: {block: chain(otherwise)}} : {}),
  },
});
const differs = (a: object, b: object) => ({
  block: {type: 'logic_compare', fields: {OP: 'NEQ'}, inputs: {A: a, B: b}},
});

/** Move to `to`, and say so — but only if it is somewhere else. */
const moveTo = (to: () => object) =>
  either(differs(to(), fraction()), [setFraction(to()), emitChanged()]);

/** `presses ⟨key⟩`, answered only while the keyboard is on this one. */
const onKey = (key: string, by: number) => ({
  type: 'world_on_Input_PressesEvent',
  fields: {FILTER0: key},
  inputs: {ACTOR: me()},
  next: {
    block: either(focused(), [
      moveTo(() => ({
        block: {
          type: 'math_constrain',
          inputs: {
            VALUE: arithmetic('ADD', fraction(), num(by)),
            LOW: num(0),
            HIGH: num(1),
          },
        },
      })),
    ]),
  },
});

const circle = (x: object, y: object, radius: number) => ({
  type: 'world_draw_circle',
  inputs: {X: x, Y: y, RADIUS: num(radius)},
});
const less = (of: object, n: number) => arithmetic('MINUS', of, num(n));

/** The knob's x: inset by its radius at each end, and along by the fraction. */
const knobX = () =>
  arithmetic(
    'ADD',
    num(KNOB),
    arithmetic('MULTIPLY', less(width(), KNOB * 2), fraction()),
  );

export const sliderActor = actorFile(
  'Slider',
  [
    // FIRST, so everything below overrides it: the fraction, and the face
    // this paints instead of the bar's.
    actsLike('actors/progressBar'),
    // The box, elected rather than declared. A Slider acts like a Progress
    // Bar, which has no box of its own, so this is the one other kind that
    // says it itself (specs/BOXES_PLAN.md).
    useTrait('Boxed#HasABoxTrait'),
    // …and which theme it is painted out of, when it is not the world's
    // (specs/STYLES_PLAN.md). Elected by the same kinds for the same reason:
    // an inspector cannot ask a Coin what its theme is.
    useTrait('Styled#HasAStyleTrait'),
    setBox('Width', WIDTH),
    setBox('Height', HEIGHT),
    defineEvent('changed'),
    useTrait('Mouse#CanBeClickedTrait'),
    // …and the gestures that begin on it, which is how the knob follows a
    // finger that has slid off the end of the track.
    useTrait('Gestures#TakesGesturesTrait'),
    useTrait('Tab Navigation#CanBeFocusedTrait'),
    useTrait('Input#TakesKeyboardInputTrait'),
    showAs('slider'),
    // Halfway, which is where a volume starts; a bar starts full.
    setFraction(num(0.5)),
  ],
  {
    handlers: [
      // A press on it: the keyboard comes here, and the fraction jumps to
      // where the press landed.
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {
          block: chain([takeFocus(), moveTo(fractionAtPointer)]),
        },
      },
      // …and every frame the finger moves after it. The event carries how far
      // it moved, which this does not need — where it IS is the whole answer,
      // and `mouse position` is where that lives.
      {
        type: 'world_on_Gestures_IsDraggedByEvent',
        inputs: {ACTOR: me()},
        next: {block: chain([moveTo(fractionAtPointer)])},
      },
      onKey('left arrow', -STEP),
      onKey('right arrow', STEP),
    ],
    drawing: {
      width: width(),
      height: height(),
      commands: [
        noOutline(),
        // The track, inset by the knob so the knob never leaves the canvas.
        fill(read(BAR, 'TrackColorProperty')),
        rectangle(
          num(KNOB),
          less(half(height()), TRACK_HEIGHT / 2),
          less(width(), KNOB * 2),
          TRACK_HEIGHT,
        ),
        // …filled as far as the knob.
        fill(read(BAR, 'BarColorProperty')),
        rectangle(
          num(KNOB),
          less(half(height()), TRACK_HEIGHT / 2),
          less(knobX(), KNOB),
          TRACK_HEIGHT,
        ),
        // The knob.
        fill(swatch(LOOK.ink)),
        useStyle('knob'),
        circle(knobX(), half(height()), KNOB),
        // …and the ring, when the keyboard is on this one.
        either(focused(), [
          noFill(),
          outline(swatch(LOOK.focus), RING_WIDTH),
          corner(ringRadius(RADIUS_BAR)),
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
