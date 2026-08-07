import {
  defineRule,
  forEach,
  forEachKey,
  hasTrait,
  moduleFor,
  note,
  param,
} from './dsl.mjs';

const KEY = 'enum:Engine#Key';

const rule = defineRule({
  name: 'Input',
  ability: 'Responds to Input',
  header: `// "Responds to Input" — what turns a keyboard into events.
//
// It runs in \`sense\`, the first moment of the frame, so everything that reads
// a key this tick reads one that is up to date. That used to be "when tick",
// which left it unordered against every rule that reads the keys and worked
// only because this rule happened to load first.
//
// It declares its key events TWICE, which is the point of the rule. On the rule
// they are the WORLD's: a key going down is not about anybody, so it is raised
// once and handled with no actor. Under the trait they are an ACTOR's, and only
// the actors that elected it are told — one player rather than every coin in
// the level. Before events had a scope there was only the second kind, so this
// step walked every actor in the world every frame a key changed just to have
// somebody to raise them for.`,
});

const pressed = rule.event([param('pressed key', KEY), 'is pressed']);
const released = rule.event([param('released key', KEY), 'is released']);

const takesInput = rule.trait('Takes Keyboard Input');
const presses = takesInput.event(['presses', param('pressed key', KEY)]);
const releases = takesInput.event(['releases', param('released key', KEY)]);

const each = rule.local('each', 'Actor');
const key = rule.local('key', 'String');

/** Tell the world, then the actors that asked to hear it. */
const announce = (worldEvent, actorEvent, paramName) => [
  worldEvent({[paramName]: key.get()}),
  forEach(each, {
    where: hasTrait(each.get(), rule.traitRef('Takes Keyboard Input')),
    body: [actorEvent({[paramName]: key.get()}, each.get())],
  }),
];

rule.step('keyEvents', 'sense', [
  note('The world knows which keys are held. What it also knows, and'),
  note('nothing else can work out, is which ones CHANGED this frame.'),
  forEachKey('PRESSED', key, announce(pressed, presses, 'pressed key')),
  forEachKey('RELEASED', key, announce(released, releases, 'released key')),
]);

export default () => moduleFor(rule, 'input');
