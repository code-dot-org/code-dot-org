// "Toggle" — a Button that is on or off.
//
// The second control, and the first whose answer is a truth rather than a
// press: sound on or off, pause, hard mode. It ACTS LIKE A BUTTON, so it is
// clickable, reachable by Tab and pressed by Enter with nothing written here
// — a Button's handlers come across with its traits (`ActorBuilder.actsLike`)
// — and what it adds is one property and two events (specs/UI_ACTORS.md,
// "The rest of the toolkit").
//
// `on` is the Toggle's OWN property, flipped by the click the Button raises;
// `turned on` and `turned off` are its own events, so a project reacts to the
// change rather than polling the property every frame. A handler on either
// is the whole of what wiring a toggle to something takes.
//
// ITS FACE IS PAINTED HERE: the caption on the left, in the Label's words,
// and a switch on the right whose track colours and whose knob slides with
// `on`. A drawing may read a property and choose a shape by it, which is all
// the state a still needs; nothing here animates. The Button's focus ring is
// drawn the same way, for the same reason.
//
// IT IS NOT A BUTTON, any more than a Button is a Label: `any ⟨Button⟩` does
// not find it. What they share is what they can do, which is the traits.

import {labelHalf, labelSizeOf} from './label';
import {LOOK, RADIUS, RING_INSET, RING_WIDTH, ringRadius} from './look';
import {
  actorFile,
  actsLike,
  chain,
  corner,
  defineEvent,
  defineProperty,
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
  useStyle,
  words,
} from './workspace';

/** The Toggle's own blocks are keyed by its file (`blockly/ownProperties`). */
const OWN = 'ActorsToggle';

/** The switch: a track at the right edge and a knob that slides along it. */
const TRACK_WIDTH = 36;
const TRACK_HEIGHT = 16;
const KNOB = 6;

const width = () => labelSizeOf('Width');
const height = () => labelSizeOf('Height');

/** `⟨a⟩ − ⟨n⟩`. */
const less = (of: object, n: number) => ({
  block: {
    type: 'math_arithmetic',
    fields: {OP: 'MINUS'},
    inputs: {A: of, B: num(n)},
  },
});

/** `⟨on⟩ of this actor`. */
const on = () => textOf('OnProperty', OWN);
/** `⟨focused⟩ of this actor` — the rule's, and read-only. */
const focused = () => ({
  block: {
    type: 'world_get_TabNavigation_FocusedProperty',
    inputs: {ACTOR: me()},
  },
});

/** `if ⟨test⟩ do ⟨body⟩`, with an `else` when given one. */
const either = (test: object, then: object[], otherwise?: object[]) => ({
  type: 'controls_if',
  ...(otherwise ? {extraState: {hasElse: true}} : {}),
  inputs: {
    IF0: test,
    DO0: {block: chain(then)},
    ...(otherwise ? {ELSE: {block: chain(otherwise)}} : {}),
  },
});

/** `emit ⟨turned on|turned off⟩ for this actor`. */
const emit = (event: 'TurnedOn' | 'TurnedOff') => ({
  type: `world_emit_${OWN}_${event}Event`,
  inputs: {ACTOR: me()},
});

/** A circle, which the workspace helpers do not yet have a word for. */
const circle = (x: object, y: object, radius: number) => ({
  type: 'world_draw_circle',
  inputs: {X: x, Y: y, RADIUS: num(radius)},
});

export const toggleActor = actorFile(
  'Toggle',
  [
    // FIRST, so everything below overrides it: the words, the anchor, and
    // the face this paints instead of the Button's.
    actsLike('actors/button'),
    defineProperty('boolean', 'on', 'false'),
    defineEvent('turned on'),
    defineEvent('turned off'),
    showAs('toggle'),
    // The caption sits to the left of the switch, so it reads from the left.
    setText('TextAnchorProperty', words('left')),
    setText('TextProperty', words('Toggle')),
  ],
  {
    handlers: [
      // The click the Button raises — from the mouse, or from Enter — flips
      // the property and says which way it went. The Button's own handlers
      // came across with `acts like`, so nothing here takes the focus or
      // hears Enter.
      {
        type: 'world_on_Mouse_IsClickedWithEvent',
        fields: {FILTER0: ''},
        inputs: {ACTOR: me()},
        next: {
          block: chain([
            {
              type: `world_set_${OWN}_OnProperty`,
              inputs: {
                ACTOR: me(),
                VALUE: {block: {type: 'logic_negate', inputs: {BOOL: on()}}},
              },
            },
            either(on(), [emit('TurnedOn')], [emit('TurnedOff')]),
          ]),
        },
      },
    ],
    drawing: {
      width: width(),
      height: height(),
      commands: [
        // The caption, in the Label's own words and colour.
        noOutline(),
        useStyle('caption'),
        fill(textOf('TextColorProperty')),
        drawParagraph(
          num(4),
          labelHalf(height()),
          less(width(), TRACK_WIDTH + 8),
        ),
        // The track: green when on, grey when off.
        // A PILL, which is what a switch is everywhere. Half the track's
        // height of corner is as round as a rectangle goes — the engine
        // clamps anything more to exactly this (`CommandPen.rectangle`).
        corner(TRACK_HEIGHT / 2),
        // NO `pressed` HERE, though a Toggle acts like a Button and so has
        // `Takes Gestures` along with everything else. `pressed` says a FILL,
        // and this track's fill is the whole of what `on` and `off` mean — a
        // switch that looked the same pressed as it does off would be saying
        // the wrong thing rather than an extra thing. A switch that wants
        // press feedback wants a class of its own, and nobody has asked
        // (specs/STYLES_PLAN.md).
        either(
          on(),
          [fill(swatch(LOOK.positive)), useStyle('on')],
          [fill(swatch(LOOK.muted)), useStyle('off')],
        ),
        rectangle(
          less(width(), TRACK_WIDTH + 2),
          less(labelHalf(height()), TRACK_HEIGHT / 2),
          TRACK_WIDTH,
          TRACK_HEIGHT,
        ),
        // The knob, at whichever end `on` says.
        fill(swatch(LOOK.ink)),
        useStyle('knob'),
        either(
          on(),
          [circle(less(width(), KNOB + 4), labelHalf(height()), KNOB)],
          [
            circle(
              less(width(), TRACK_WIDTH - KNOB),
              labelHalf(height()),
              KNOB,
            ),
          ],
        ),
        // …and the ring, when the keyboard is on this one — inside the face,
        // as the Button's is, since anything past the edge is clipped away.
        either(focused(), [
          noFill(),
          outline(swatch(LOOK.focus), RING_WIDTH),
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
