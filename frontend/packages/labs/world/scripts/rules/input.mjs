import {
  allWithTrait,
  defineRule,
  doc,
  forEach,
  forEachKey,
  forEachTyped,
  moduleFor,
  param,
} from './dsl.mjs';

const KEY = 'enum:Engine#Key';

const rule = defineRule({
  name: 'Input',
  ability: 'Reads the Keyboard',
  purpose: `**Input** turns the keyboard into events.

Nothing else here reads keys directly. A key going down and a key coming up
each raise an event, once, for whoever cares — so two rules can both answer the
space bar without fighting over it.

Give an actor **Takes Keyboard Input**, or handle the world-level event when no
one actor owns the key.`,
  header: `// "Reads the Keyboard" — what turns a keyboard into events.
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
// somebody to raise them for.
//
// AND A THIRD KIND OF EVENT, which is not a key at all. A key is held or it is
// not, and \`a\` is \`a\` whether or not shift is down; what was TYPED is a
// sequence of characters, and shift, a dead key, an IME and a paste all make
// one with no key edge anybody could name. A text field needs the second and a
// control scheme needs the first, so both are here and neither pretends to be
// the other (specs/UI_ACTORS.md).`,
});

const pressed = rule.event([param('pressed key', KEY), 'is pressed']);
const released = rule.event([param('released key', KEY), 'is released']);
/**
 * `⟨a⟩ is typed` — one character, as it was actually typed.
 *
 * A `string` and not a Key: the choices a Key offers are the keys a keyboard
 * has, and what arrives here is a letter, which may be uppercase, accented or
 * pasted. Naming it a Key would offer a dropdown that cannot hold most of what
 * this carries.
 */
const typed = rule.event([param('character', 'string'), 'is typed']);

const takesInput = rule.trait('Takes Keyboard Input');
const presses = takesInput.event(['presses', param('pressed key', KEY)]);
const releases = takesInput.event(['releases', param('released key', KEY)]);
const types = takesInput.event(['types', param('character', 'string')]);

const each = rule.local('each', 'Actor');
const key = rule.local('key', 'String');
const character = rule.local('character', 'String');

/** Tell the world, then the actors that asked to hear it. */
const announce = (worldEvent, actorEvent, paramName) => [
  worldEvent({[paramName]: key.get()}),
  forEach(each, {
    from: allWithTrait(rule.traitRef('Takes Keyboard Input')),
    body: [actorEvent({[paramName]: key.get()}, each.get())],
  }),
];

rule.step('keyEvents', 'sense', [
  doc(
    'The world knows which keys are held. What it also knows, and nothing else can work out, is which ones CHANGED this frame.',
  ),
  forEachKey('PRESSED', key, announce(pressed, presses, 'pressed key')),
  forEachKey('RELEASED', key, announce(released, releases, 'released key')),
  doc(
    'And what was TYPED, which is not the same list. Shift, a dead key, an IME and a paste all make a character and no key edge; `a` with shift held is the key `a` and the character `A`.',
  ),
  forEachTyped(character, [
    typed({character: character.get()}),
    forEach(each, {
      from: allWithTrait(rule.traitRef('Takes Keyboard Input')),
      body: [types({character: character.get()}, each.get())],
    }),
  ]),
]);

export default () => moduleFor(rule, 'input');
