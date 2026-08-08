import {Positional, position, setPosition} from './builtins.mjs';
import {
  add,
  axisOf,
  defineRule,
  give,
  lessThan,
  mapSize,
  minus,
  moduleFor,
  moreThan,
  n,
  note,
  param,
  thisActor,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Screen Wrap',
  ability: 'Wraps at the Edges',
  header: `// "Wraps at the Edges" — walk off one side, come back on the other.
//
// TWO traits, one per direction, because wanting one is not wanting the other.
// A side-scroller wraps across and would be broken by wrapping down: walk off a
// ledge and you would reappear in the sky. Asteroids wants both. Electing them
// separately is the difference between saying what you mean and switching off
// half of something afterwards.
//
// They run in \`adjust\`, which is the moment that exists for exactly this: after
// \`move\` has turned velocity into a position, and before \`touch\` works out what
// is against what. Both halves matter. Wrapping before the move would correct a
// position nothing had changed yet, and wrapping after collisions would mean an
// actor spent a frame being solid at the far edge of the map from where it
// appears to be.
//
// The two steps share a moment, and a moment is unordered — so they have to
// commute, and they do: each reads the axis it writes and passes the other
// through untouched, so an actor leaving through a corner arrives at the
// opposite corner whichever step ran first.
//
// Neither asks HOW the actor got out of bounds, only where it ended up, so both
// compose with anything that moves it: arrow keys, gravity, a knock from a
// collision.
//
// Their steps are NAMED apart — "come back across", "come back down" — and not
// because it reads better. A step's name becomes an exported identifier in the
// generated module, so two steps called the same thing in one rule is a module
// with two exports of one name, and the whole project stops compiling.
//
// WHERE the actor is, not how big it is: it wraps when its middle passes the
// edge, so a wide one vanishes and reappears rather than sliding across. Doing
// better means knowing its size, and size lives in Collisions — which would
// make every wrapping world a colliding one. Not worth it for a pop most games
// hide at a screen edge anyway.`,
});
rule.uses('Space');

const across = rule.trait('Wraps Across');
across.uses(Positional);
const down = rule.trait('Wraps Down');
down.uses(Positional);

export const WrapsAcross = rule.traitRef('Wraps Across');
export const WrapsDown = rule.traitRef('Wraps Down');

/**
 * One axis of it, on the RULE rather than on either trait: it is the same
 * arithmetic both ways round, and a copy per trait is a place for the two to
 * disagree. It is also the block a learner would reach for to wrap anything
 * else — a score, an angle, a frame number.
 */
export const wrapped = rule.block({
  returns: 'number',
  description:
    'Where this ends up after coming back on the other side: below 0 it gains the size, past the size it loses it.',
  say: ['wrap', param('value'), 'within', param('size')],
  body: ({value, size}) => [
    note('Off the near side? Come back on the far side, a whole map along.'),
    when([[lessThan(value.get(), n(0)), [give(add(value.get(), size.get()))]]]),
    note('Off the far side? The same the other way.'),
    when([
      [
        moreThan(value.get(), size.get()),
        [give(minus(value.get(), size.get()))],
      ],
    ]),
    note('Still inside, so leave it exactly where it is.'),
    give(value.get()),
  ],
});

across.step('come back across', 'adjust', [
  note(
    'Across only: the down position is read and written back unchanged, which is what lets this and "Wraps Down" share a moment.',
  ),
  setPosition(
    thisActor(),
    wrapped({
      value: position.x(thisActor()),
      size: axisOf('x', mapSize()),
    }),
    position.y(thisActor()),
  ),
]);

down.step('come back down', 'adjust', [
  note('Down only, and the across position passes through untouched.'),
  setPosition(
    thisActor(),
    position.x(thisActor()),
    wrapped({
      value: position.y(thisActor()),
      size: axisOf('y', mapSize()),
    }),
  ),
]);

export default () => moduleFor(rule, 'wrap');
