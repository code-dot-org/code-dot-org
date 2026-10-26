import {
  countIn,
  defineRule,
  doc,
  lastOf,
  moduleFor,
  moreThan,
  n,
  param,
  when,
} from './dsl.mjs';

const MAP = 'map';

const rule = defineRule({
  name: 'Screens',
  ability: 'Shows Screens',
  purpose: `**Screens** is a stack of maps and a way back down it.

A screen in this lab is a MAP, and loading one puts it over what is already
there — which is how a pause menu comes up over a game. What was missing is
going back.

**go to screen ⟨…⟩** puts one on top, **go back** takes the top one off, and
**the screen showing** says which is in front. Nothing else has to know.

Your app's home is usually your world's own map, which sits under every screen
and is never one of them — so going back from the last screen shows home.`,
  header: `// "Shows Screens" — a stack of maps, and a way back down it.
//
// A screen is a MAP and always has been: \`load map\` ADDS one over what is
// there, which is how the stock pause menu comes up over a game, and each
// loading knows how to take itself back. So the stack was already there in
// everything but name, and what was missing was one block — closing the one
// on TOP from outside it (specs/SCREENS_PLAN.md).
//
// WHAT THIS KEEPS IS A LIST OF PATHS, not of loads. A load is a runtime thing
// with no name; a project wants to ask which screen is showing and get back
// something it can compare and print. The load is the engine's business and
// the path is the project's, and the two stay in step because every way on and
// off the stack goes through the blocks below.
//
// GOING BACK FROM AN EMPTY STACK DOES NOTHING, and that is the whole of the
// floor. It used to keep one screen back as well, on the reasoning that the
// engine would happily close the last one and leave an empty world.
//
// WHICH STOPPED BEING TRUE when a world got a main map. An app's home screen
// is the world's own arrangement — it is never pushed, never popped, and
// always under everything (specs/MAIN_MAP_PLAN.md) — so the floor is the
// world itself, and a rule keeping a second one meant the last screen a
// project put up could never be taken down. A form you cannot close.
//
// A project that pushes ALL of its screens, home included, can now pop the
// last of them and see whatever its world holds under it. That is the honest
// answer: what is underneath is the world's business, and it is a thing that
// can be looked at rather than a state the rule pretends is impossible.`,
});

rule.doc(`The screens showing, deepest first. The last one is in front.

A project reads this to ask where it is — \`the screen showing\`, or how deep
it has gone — and every way on and off the stack keeps it in step with what is
actually loaded.`);

const showing = rule.property({
  name: 'screens',
  type: 'words',
  value: [],
  readonly: true,
});

const opened = rule.event(['a screen opens', param('screen', MAP)]);
const closed = rule.event(['a screen closes', param('screen', MAP)]);

/** `load the map named ⟨path⟩`. */
const loadNamed = path => ({
  type: 'world_load_map_named',
  inputs: {PATH: {block: path}},
});
/** `unload the newest map`. */
const unloadNewest = () => ({type: 'world_unload_newest_map'});

rule.block({
  returns: 'none',
  description: 'Put a screen in front of whatever is showing.',
  say: ['go to screen', param('screen', MAP)],
  body: ({screen}) => [
    doc(
      'The map goes on over what is there, and the path goes on the end of the list — in that order, so a handler for `a screen opens` already sees it as the one showing.',
    ),
    loadNamed(screen.get()),
    showing.push(screen.get()),
    opened({screen: screen.get()}),
  ],
});

rule.block({
  returns: 'none',
  description: 'Close the screen in front and go back to the one behind.',
  say: ['go back'],
  body: () => [
    doc(
      'Nothing happens when no screen is showing. An app\u2019s home is usually its world\u2019s own map, which is under every screen and is never one of them \u2014 so going back from the last screen shows home.',
    ),
    when([
      [
        moreThan(countIn(showing.of()), n(0)),
        [
          closed({screen: lastOf(showing.of())}),
          unloadNewest(),
          showing.takeLast(),
        ],
      ],
    ]),
  ],
});

rule.block({
  returns: 'none',
  description: 'Swap the screen in front for another one.',
  say: ['replace the screen with', param('screen', MAP)],
  body: ({screen}) => [
    doc(
      'Back and then forward, so the one behind stays where it was. Used for a step in a flow that should not pile up: three questions in a row are three replacements and one Back.',
    ),
    closed({screen: lastOf(showing.of())}),
    unloadNewest(),
    showing.takeLast(),
    loadNamed(screen.get()),
    showing.push(screen.get()),
    opened({screen: screen.get()}),
  ],
});

rule.block({
  returns: 'string',
  description: 'Which screen is in front.',
  say: ['the screen showing'],
  body: () => [{type: 'world_return', inputs: {VALUE: lastOf(showing.of())}}],
});

rule.block({
  returns: 'number',
  description: 'How many screens are stacked up.',
  say: ['how many screens'],
  body: () => [
    {type: 'world_return', inputs: {VALUE: countIn(showing.of())}},
  ],
});

export default () => moduleFor(rule, 'screens');
