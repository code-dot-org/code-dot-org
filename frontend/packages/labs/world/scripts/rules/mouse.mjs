import {
  allWithTrait,
  anyOf,
  both,
  defineRule,
  doc,
  filter,
  forEach,
  forEachButton,
  hasTrait,
  moduleFor,
  not,
  param,
  useWheel,
  wheelTurned,
  when,
  equals,
  n,
} from './dsl.mjs';
import {under} from './pointing.mjs';

const BUTTON = 'enum:Engine#MouseButton';

const rule = defineRule({
  name: 'Mouse',
  ability: 'Reads the Mouse',
  purpose: `**Mouse** turns the pointer into events.

The keyboard's rule with one word changed: a button going down is the same kind
of thing a key going down is. Clicks on a particular actor are their own event,
so a button in your game is just an actor that hears it.

Give an actor **Takes Mouse Input**, or **Can Be Clicked** to hear clicks on
itself.`,
  header: `// "Reads the Mouse" — what turns a pointer into events.
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

/**
 * …and the wheel, which is a THIRD trait and not a third event on the others.
 *
 * A thing you scroll is not a thing you click. A Button is clicked and must
 * not move when the wheel turns over it; a List is both, and a panel that
 * scrolls its contents may be neither. Hanging the wheel on `Can Be Clicked`
 * would have been free — every scrollable thing in the lab happens to be
 * clickable today — and would have meant a Button that swallowed the page's
 * scroll the moment anybody added a wheel handler to the rule.
 *
 * `by` is in PIXELS and positive is DOWN, which is the direction the content
 * moves: a list adds it to the offset it already keeps in pixels, so the
 * handler is one addition and no unit to think about.
 */
const scrollable = rule.trait('Can Be Scrolled');
const scrolled = scrollable.event(['is scrolled by', param('by', 'number')]);

const each = rule.local('each', 'Actor');
const target = rule.local('target', 'Actor');
const button = rule.local('button', 'String');

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

/**
 * Whatever the pointer is over that asked for the wheel, and the page's claim.
 *
 * TWO THINGS IN ONE STEP because they answer the same question. The wheel goes
 * to what is under the pointer, and whether the BROWSER should keep its own
 * scroll is exactly whether anything under the pointer wanted it — so working
 * one out has already worked out the other.
 *
 * SAID EVERY FRAME, not only on a turn: the driver reads it in a listener that
 * fires before the tick, so the answer has to be standing there ready. A
 * pointer moving off a list gives the page its scroll back on the next frame.
 */
const scrollTargets = () =>
  filter(target, {
    where: both(
      hasTrait(target.get(), rule.traitRef('Can Be Scrolled')),
      under(target.get()),
    ),
  });

rule.step('wheelEvents', 'sense', [
  doc(
    'The wheel goes to whatever is under the pointer that asked for it — and whether the PAGE keeps its own scroll is the same question, so both are answered here (`World.useWheel`).',
  ),
  useWheel(anyOf(scrollTargets())),
  when([
    [
      not(equals(wheelTurned(), n(0))),
      [
        forEach(target, {
          from: scrollTargets(),
          body: [scrolled({by: wheelTurned()}, target.get())],
        }),
      ],
    ],
  ]),
]);

rule.step('buttonEvents', 'sense', [
  doc(
    'The world knows which buttons are held. What it also knows, and nothing else can work out, is which ones CHANGED this frame.',
  ),
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
