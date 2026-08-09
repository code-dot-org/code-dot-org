import {CanMove, rotation, velocity} from './builtins.mjs';
import {
  add,
  defineRule,
  frameTime,
  give,
  keyDown,
  moduleFor,
  n,
  note,
  param,
  pick,
  rotated,
  thisActor,
  times,
  vector,
  vectorPlus,
  vectorTimes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Arrow Drive',
  ability: 'Drives with Arrow Keys',
  header: `// "Drives with Arrow Keys" — turn where you point, thrust where you face.
//
// The other way to read the arrow keys, and the reason it is a second rule
// rather than a setting on the first: it is a different idea of what a key MEANS.
// "Moves with Arrow Keys" says right IS moving right, and letting go IS
// stopping. This says right is TURNING and up is pushing, and letting go of
// everything leaves you coasting exactly as you were.
//
// ELECT ONE OR THE OTHER. Both traits on one actor is two rules writing velocity
// in the same moment, and \`decide\` is unordered — "Moves with Arrow Keys" sets
// the sideways speed outright where this one adds to it, so which of them won
// would be whichever the scheduler happened to run last. That is not a bug to
// fix here; it is what electing two contradictory abilities means.
//
// Both halves are per SECOND, not per frame, and multiplied by the frame time
// for the reason Camera Ease is: a turn rate that is really "degrees per frame"
// spins twice as fast on a 120Hz screen.
//
// Nothing here stops the actor, on purpose. Coasting is what makes this feel
// like a ship rather than a person, and a game that wants drag can subtract
// from velocity in a step of its own.`,
});
rule.uses('Physics');

const driven = rule.trait('Driven by Arrow Keys');
driven.uses(CanMove);
const turnSpeed = driven.number('turn speed', 180);
const thrust = driven.number('thrust', 6);

export const DrivenByArrowKeys = rule.traitRef('Driven by Arrow Keys');

/**
 * Which way an actor is pointing, as a direction one unit long.
 *
 * On the rule rather than inside the step, because it is the thing anything
 * else would want: spawning a bullet in front of a ship, or throwing something
 * the way its thrower faces.
 */
export const facing = rule.block({
  returns: 'vector',
  description:
    'The direction this actor is pointing, one unit long. Multiply it by a speed to move that way.',
  say: ['the way', param('who', 'actor'), 'is facing'],
  body: ({who}) => [
    note(
      'Up the screen is a NEGATIVE y — the top of the picture is 0 and it grows downward — so straight up is (0, -1).',
    ),
    note('Turning that by the actor’s own rotation gives where it points now.'),
    give(rotated(vector(n(0), n(-1)), rotation.of(who.get()))),
  ],
});

/**
 * The same direction, at a given size — the push itself.
 *
 * Separate from `facing` so the step names the amount ONCE. Written inline it
 * appeared twice, as the x and the y of a vector, which is the same reading of
 * the keyboard done twice and two places for it to drift.
 */
export const pushedForward = rule.block({
  returns: 'vector',
  description:
    'A push of this size in the direction the actor is facing. Add it to a velocity to speed up that way.',
  say: [param('who', 'actor'), 'pushed', param('amount'), 'forward'],
  body: ({who, amount}) => [
    give(
      vectorTimes(facing({who: who.get()}), vector(amount.get(), amount.get())),
    ),
  ],
});

driven.step('steer', 'decide', [
  note('Left and right TURN, rather than moving. Holding both cancels out.'),
  rotation.set(
    thisActor(),
    add(
      rotation.of(thisActor()),
      times(
        add(
          pick(keyDown('right arrow'), turnSpeed.of(thisActor()), n(0)),
          pick(
            keyDown('left arrow'),
            times(turnSpeed.of(thisActor()), n(-1)),
            n(0),
          ),
        ),
        // Degrees per SECOND: without this a fast screen spins faster.
        frameTime(),
      ),
    ),
  ),
  note('Up pushes the way the actor is facing, and ADDS to how it was moving.'),
  note('That is what makes it drift: nothing here ever slows it down.'),
  velocity.set(
    thisActor(),
    vectorPlus(
      velocity.of(thisActor()),
      pushedForward({
        who: thisActor(),
        // Per second, and nothing at all while the key is up.
        amount: pick(
          keyDown('up arrow'),
          times(thrust.of(thisActor()), frameTime()),
          n(0),
        ),
      }),
    ),
  ),
]);

export default () => moduleFor(rule, 'drive');
