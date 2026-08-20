import {CanMove, velocity} from './builtins.mjs';
import {
  add,
  axisOf,
  defineRule,
  keyDown,
  moduleFor,
  n,
  note,
  pick,
  thisActor,
  times,
  vector,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Arrow Keys',
  ability: 'Moves with Arrow Keys',
  header: `// "Moves with Arrow Keys" — the first mechanic a learner meets.
//
// It turns a held key into velocity, which is what \`decide\` is: intent becomes
// motion, before anything pushes and before Physics turns velocity into
// position. It used to say that as "before Physics > reposition", which meant
// naming another rule in order to describe itself.
//
// TWO traits, one per direction, for the reason Screen Wrap and Boundaries
// have two: wanting one is not wanting the other. A platformer wants across
// and would be broken by down — up would fly, and holding down would beat
// gravity into the floor. A top-down game wants both. An overhead game with a
// ladder wants down on the actors that climb and not on the ones that walk.
//
// It used to be one trait that moved sideways only, with a note in its step
// saying up and down belonged to gravity. That was the platformer's answer
// written into the rule, so a top-down game had no way to ask for the other
// half and a demonstration of the rule recorded a box standing still while the
// down arrow was held.
//
// The two steps share a moment, and a moment is unordered — so they have to
// commute, and they do: each reads the axis it writes and passes the other
// through untouched, the same bargain \`bounds\` strikes. So an actor holding
// two arrows at once moves diagonally whichever step ran first.
//
// Their steps are NAMED apart — "walk across", "walk down" — and not because it
// reads better. A step's name becomes an exported identifier in the generated
// module, so two steps called the same thing in one rule is a module with two
// exports of one name, and the whole project stops compiling.
//
// A SPEED EACH, rather than one shared between them. They are different
// numbers in every game that has both: a top-down character that walks as fast
// up as sideways is the exception, not the rule, and a single knob would have
// to be split the first time anybody wanted a slow climb.`,
});
rule.uses('Physics');

const across = rule.trait('Moves Across');
across.uses(CanMove);
const acrossSpeed = across.number('across speed', 1.5);

const down = rule.trait('Moves Down');
down.uses(CanMove);
const downSpeed = down.number('down speed', 1.5);

export const MovesAcross = rule.traitRef('Moves Across');
export const MovesDown = rule.traitRef('Moves Down');

/** The speed to walk at while `key` is held, and nothing while it is not. */
const whileHeld = (key, speed) => pick(keyDown(key), speed, n(0));

/** How fast to go on one axis, given the two keys that drive it. */
const pushed = (forward, back, speed) =>
  add(
    whileHeld(forward, speed.of(thisActor())),
    whileHeld(back, times(speed.of(thisActor()), n(-1))),
  );

across.step('walk across', 'decide', [
  note('While an arrow is held, walk that way; while it is not, stand still.'),
  note('Holding both at once cancels out, because we add the two amounts.'),
  note('Across only: the down speed is read and written back unchanged, which'),
  note('is what lets this and "Moves Down" share a moment.'),
  velocity.set(
    thisActor(),
    vector(
      pushed('right arrow', 'left arrow', acrossSpeed),
      axisOf('y', velocity.of(thisActor())),
    ),
  ),
]);

down.step('walk down', 'decide', [
  note('Down only, and the across speed passes through untouched.'),
  note('An actor with this and gravity both will fight its own falling, which'),
  note('is why a platformer elects "Moves Across" and leaves this alone.'),
  velocity.set(
    thisActor(),
    vector(
      axisOf('x', velocity.of(thisActor())),
      pushed('down arrow', 'up arrow', downSpeed),
    ),
  ),
]);

export default () => moduleFor(rule, 'arrows');
