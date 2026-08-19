import {intrinsicSize, position, scale} from './builtins.mjs';
import {
  absolute,
  allWithTrait,
  atMost,
  axisOf,
  both,
  defineRule,
  filter,
  forEach,
  forEachButton,
  hasTrait,
  minus,
  moduleFor,
  moreThan,
  mousePosition,
  n,
  note,
  over,
  param,
  pick,
  times,
} from './dsl.mjs';

const BUTTON = 'enum:Engine#MouseButton';

const rule = defineRule({
  name: 'Mouse',
  ability: 'Responds to the Mouse',
  header: `// "Responds to the Mouse" — what turns a pointer into events.
//
// The keyboard's rule (rules/input) with one word changed, and deliberately so:
// a button going down is the same KIND of thing a key going down is, and a
// learner who has read one has read both. It runs in \`sense\` for the same
// reason, declares its events twice for the same reason — once on the rule,
// where a click is nobody's, and once under a trait, where it belongs to the
// actors that asked to hear it.
//
// WHAT WAS CLICKED is the third telling. \`Takes Mouse Input\` hears every
// button; \`Can Be Clicked\` hears only the presses that landed on it, worked
// out from where the actor is and how big it is drawn — a box, the same extent
// collisions use. Two traits because they are two questions: a scoreboard wants
// every press, a button wants its own.
//
// WHERE THE MOUSE IS IS NOT AN EVENT. It is \`mouse position\`, an Engine block
// answering with the point the pointer is over right now, because that is what
// aiming at it and asking whether it is over something both want. An event
// carrying the position would make a rule remember the last one just to be able
// to ask, which is storing what the World already knows.`,
});

const pressed = rule.event([param('pressed button', BUTTON), 'is pressed']);
const released = rule.event([param('released button', BUTTON), 'is released']);

const takesMouse = rule.trait('Takes Mouse Input');
const presses = takesMouse.event([
  'presses mouse button',
  param('pressed button', BUTTON),
]);
const releases = takesMouse.event([
  'releases mouse button',
  param('released button', BUTTON),
]);

const clickable = rule.trait('Can Be Clicked');
const clicked = clickable.event([
  'is clicked with',
  param('pressed button', BUTTON),
]);

const each = rule.local('each', 'Actor');
const target = rule.local('target', 'Actor');
const button = rule.local('button', 'String');

/** What an actor with no measured picture is assumed to be, per `collisions`. */
const ASSUMED_SIZE = 32;

/**
 * Half the actor's drawn size on one axis — how far its middle reaches.
 *
 * The same arithmetic `bounds` does, and for the same two reasons: an intrinsic
 * size of zero means "nobody has measured this picture" rather than "no size",
 * and `absolute` because a scale of -1 is how a sprite is flipped to face the
 * other way — left as it comes, a flipped actor would have a negative half-width
 * and be unclickable on the side it is facing.
 */
const halfSize = (which, subject) =>
  over(
    times(
      pick(
        moreThan(intrinsicSize.axis(which, subject), n(0)),
        intrinsicSize.axis(which, subject),
        n(ASSUMED_SIZE),
      ),
      absolute(scale.axis(which, subject)),
    ),
    n(2),
  );

/** Whether the pointer is inside the actor's box, one axis at a time. */
const withinAxis = (which, subject) =>
  atMost(
    absolute(
      minus(axisOf(which, mousePosition()), position.axis(which, subject)),
    ),
    halfSize(which, subject),
  );

/**
 * Whether the pointer is over this actor.
 *
 * A box, not the picture: what is under the pointer is worked out from where
 * the actor is and how big it is drawn, which is what every other question
 * about an actor's extent uses (`collision size of`, `bounds`, `wrap`). A
 * transparent corner counts as a hit, which is the same bargain collisions
 * already make and the one a learner already has a feel for.
 */
const under = subject =>
  both(withinAxis('x', subject), withinAxis('y', subject));

/** Tell the world, then the actors that asked to hear it. */
const announce = (worldEvent, actorEvent, paramName) => [
  worldEvent({[paramName]: button.get()}),
  forEach(each, {
    from: allWithTrait(rule.traitRef('Takes Mouse Input')),
    body: [actorEvent({[paramName]: button.get()}, each.get())],
  }),
];

/**
 * …and, on the way DOWN, the actors the pointer was over.
 *
 * The third telling, and the one a game actually asks for: not "somebody
 * clicked" but "this was clicked". A press only — a release elsewhere is not a
 * click of the thing you pressed on, and pairing the two up is a decision a
 * game should make rather than one the rule makes for it.
 */
const clickTargets = () => [
  forEach(target, {
    from: filter(target, {
      where: both(
        hasTrait(target.get(), rule.traitRef('Can Be Clicked')),
        under(target.get()),
      ),
    }),
    body: [clicked({'pressed button': button.get()}, target.get())],
  }),
];

rule.step('buttonEvents', 'sense', [
  note('The world knows which buttons are held. What it also knows, and'),
  note('nothing else can work out, is which ones CHANGED this frame.'),
  forEachButton('PRESSED', button, [
    ...announce(pressed, presses, 'pressed button'),
    ...clickTargets(),
  ]),
  forEachButton(
    'RELEASED',
    button,
    announce(released, releases, 'released button'),
  ),
]);

export default () => moduleFor(rule, 'mouse');
