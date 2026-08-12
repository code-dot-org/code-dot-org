import {
  defineRule,
  forEach,
  forEachButton,
  hasTrait,
  moduleFor,
  note,
  param,
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

const each = rule.local('each', 'Actor');
const button = rule.local('button', 'String');

/** Tell the world, then the actors that asked to hear it. */
const announce = (worldEvent, actorEvent, paramName) => [
  worldEvent({[paramName]: button.get()}),
  forEach(each, {
    where: hasTrait(each.get(), rule.traitRef('Takes Mouse Input')),
    body: [actorEvent({[paramName]: button.get()}, each.get())],
  }),
];

rule.step('buttonEvents', 'sense', [
  note('The world knows which buttons are held. What it also knows, and'),
  note('nothing else can work out, is which ones CHANGED this frame.'),
  forEachButton(
    'PRESSED',
    button,
    announce(pressed, presses, 'pressed button'),
  ),
  forEachButton(
    'RELEASED',
    button,
    announce(released, releases, 'released button'),
  ),
]);

export default () => moduleFor(rule, 'mouse');
