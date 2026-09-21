// "Scroll View" — a window onto something taller than itself, that a finger
// moves.
//
// THE PIECE A KIT NEEDS BEFORE ITS SCREENS CAN BE LONG. A Label wraps, a List
// scrolls rows of WORDS, and neither answers the ordinary case: a settings
// page, a form, a feed, a list whose rows are real actors with a picture and
// a button in them (specs/SCROLLING_PLAN.md).
//
// IT IS A VIEWPORT, which is the only thing in this lab that can clip. A mask
// does nothing in this Phaser; a clip comes from a CAMERA, and a Viewport is
// an actor with a space and a camera of its own. So the content is a MAP
// loaded into it, the engine grows the space to the map's size, and scrolling
// is moving that camera — which the engine was already clamping into the
// bounds every tick, for a level's camera, and which now answers to `scroll`.
//
// WHAT IT ADDS TO A VIEWPORT is a finger and a scrollbar. Dragging moves the
// content with the finger — which is why the movement is SUBTRACTED: dragging
// up carries the page up, so the window goes down it. The bar down the right
// edge is drawn from `scroll` and `content`, both of which the engine keeps
// honest, so it cannot disagree with where the window actually is.
//
// NOT A LIST. It does not know about rows, choosing, or what is in it; it
// shows a map and moves over it. A list whose rows are actors is this with a
// map of rows in it, and the choosing is that map's business.

import {BORDER, LOOK, RADIUS_BAR, RADIUS_TIGHT} from './look';
import {
  actorFile,
  actsLike,
  chain,
  corner,
  fill,
  me,
  noOutline,
  num,
  outline,
  rectangle,
  setText,
  showAs,
  swatch,
  useTrait,
  words,
} from './workspace';

/** How big a Scroll View is unless a project says otherwise. */
const WIDTH = 280;
const HEIGHT = 200;
/** The bar down the right edge, and how far it sits in from it. */
const BAR_WIDTH = 6;
const BAR_INSET = 3;
/** How far an arrow key moves it, and a page key. */
const STEP = 24;

const OWN = 'Boxed';
const VIEW = 'Viewport';

const read = (own: string, exportName: string) => ({
  block: {type: `world_get_${own}_${exportName}`, inputs: {ACTOR: me()}},
});
const width = () => read(OWN, 'WidthProperty');
const height = () => read(OWN, 'HeightProperty');
const scroll = () => read(VIEW, 'ViewportScrollProperty');
const content = () => read(VIEW, 'ViewportContentProperty');

const sized = (name: 'Width' | 'Height', value: number) => ({
  type: `world_set_Boxed_${name}Property`,
  inputs: {
    ACTOR: me(),
    VALUE: {shadow: {type: 'math_number', fields: {NUM: value}}},
  },
});

/** `⟨a⟩ ⟨op⟩ ⟨b⟩` over vectors, and the same over numbers. */
const vector = (a: object, op: string, b: object) => ({
  block: {type: 'world_vector_math', fields: {OP: op}, inputs: {A: a, B: b}},
});
const maths = (a: object, op: string, b: object) => ({
  block: {type: 'math_arithmetic', fields: {OP: op}, inputs: {A: a, B: b}},
});
/** `⟨y⟩ of ⟨a vector⟩`. */
const axis = (of: object, which: 'x' | 'y') => ({
  block: {
    type: 'world_vector_component',
    fields: {COMPONENT: which},
    inputs: {VEC: of},
  },
});
const point = (x: object, y: object) => ({
  block: {type: 'world_vector_of', inputs: {X: x, Y: y}},
});

/** `set scroll of this actor to ⟨…⟩`. */
const scrollTo = (to: object) => ({
  type: `world_set_${VIEW}_ViewportScrollProperty`,
  inputs: {ACTOR: me(), VALUE: to},
});

/** Move by a number of pixels down the page — what a key press is. */
const by = (pixels: number) =>
  scrollTo(
    point(axis(scroll(), 'x'), maths(axis(scroll(), 'y'), 'ADD', num(pixels))),
  );

/** `when this actor presses ⟨key⟩: move by ⟨pixels⟩` — only while focused. */
const onKey = (key: string, pixels: number) => ({
  type: 'world_on_Input_PressesEvent',
  fields: {FILTER0: key},
  inputs: {ACTOR: me()},
  next: {
    block: chain([
      {
        type: 'controls_if',
        inputs: {
          IF0: {
            block: {
              type: 'world_get_TabNavigation_FocusedProperty',
              inputs: {ACTOR: me()},
            },
          },
          DO0: {block: by(pixels)},
        },
      },
    ]),
  },
});

/**
 * How far down the bar's thumb sits, and how long it is.
 *
 * Both are the same fraction twice: the window is `height ÷ content` of the
 * whole, and it begins `scroll ÷ content` of the way down. Drawn from the
 * numbers the ENGINE settled rather than from what anybody asked for, so the
 * thumb cannot be off the end of its track (`World.settleSpace`).
 */
const thumbTop = () =>
  maths(
    maths(axis(scroll(), 'y'), 'DIVIDE', axis(content(), 'y')),
    'MULTIPLY',
    height(),
  );
const thumbHeight = () =>
  maths(maths(height(), 'DIVIDE', axis(content(), 'y')), 'MULTIPLY', height());

export const scrollViewActor = actorFile(
  'Scroll View',
  [
    actsLike('actors/label'),
    useTrait('Viewport#ViewportTrait'),
    useTrait('Gestures#TakesGesturesTrait'),
    // …and the click, which is a SEPARATE election from the drag: the Mouse
    // rule raises `is clicked with` only on actors that elected Can Be
    // Clicked, so without this the click that should bring the keyboard here
    // never happened and the arrows went on moving whatever had it before.
    useTrait('Mouse#CanBeClickedTrait'),
    useTrait('Tab Navigation#CanBeFocusedTrait'),
    useTrait('Input#TakesKeyboardInputTrait'),
    showAs('scroll'),
    sized('Width', WIDTH),
    sized('Height', HEIGHT),
    setText('TextProperty', words('')),
  ],
  {
    handlers: [
      // Clicking it brings the keyboard, so the arrows move THIS rather than
      // whatever had the focus before.
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {
          block: chain([
            {
              type: 'world_do_TabNavigation_TakeTheFocusAction',
              inputs: {ACTOR: me()},
            },
          ]),
        },
      },
      // A finger on the page. SUBTRACTED, because a drag carries the content
      // with it: pulling up moves the window down the page.
      {
        type: 'world_on_Gestures_IsDraggedByEvent',
        inputs: {ACTOR: me()},
        next: {
          block: chain([
            scrollTo(
              vector(scroll(), 'SUBTRACT', {
                block: {type: 'world_event_value'},
              }),
            ),
          ]),
        },
      },
      onKey('up arrow', -STEP),
      onKey('down arrow', STEP),
      onKey('page up', -HEIGHT),
      onKey('page down', HEIGHT),
    ],
    drawing: {
      width: width(),
      height: height(),
      commands: [
        fill(swatch(LOOK.well)),
        outline(swatch(LOOK.surfaceEdge), BORDER),
        corner(RADIUS_TIGHT),
        rectangle(0, 0, width(), height()),
        // The bar, down the right edge, over the face and under the content.
        noOutline(),
        // The bar is rounder than the box it is in, which is what a scrollbar
        // looks like everywhere: at three pixels of corner on a six-wide bar
        // it is a lozenge.
        corner(RADIUS_BAR),
        fill(swatch(LOOK.muted)),
        rectangle(
          maths(width(), 'MINUS', num(BAR_WIDTH + BAR_INSET)),
          num(BAR_INSET),
          num(BAR_WIDTH),
          maths(height(), 'MINUS', num(BAR_INSET * 2)),
        ),
        fill(swatch(LOOK.surfaceEdge)),
        rectangle(
          maths(width(), 'MINUS', num(BAR_WIDTH + BAR_INSET)),
          thumbTop(),
          num(BAR_WIDTH),
          thumbHeight(),
        ),
      ],
    },
  },
);
