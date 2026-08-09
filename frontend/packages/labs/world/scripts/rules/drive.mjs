import {CanMove, rotation, velocity} from './builtins.mjs';
import {
  add,
  axisOf,
  defineRule,
  frameTime,
  give,
  keyDown,
  moduleFor,
  moreThan,
  n,
  note,
  param,
  pick,
  rotated,
  thisActor,
  times,
  vector,
  vectorMinus,
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
// like a ship rather than a person, and a game that wants to coast to a stop
// elects "Slows Down" beside this — that rule is the whole difference between
// a ship and a car, and it is a separate election because plenty of things
// want to slow down without being driven.
//
// \`grip\` is the OTHER half of that difference, and it is a knob here rather
// than a rule of its own because it is about the relationship between where an
// actor points and where it is going, which is this rule's business and
// nothing else's. Zero leaves the ship exactly as it was.`,
});
rule.uses('Physics');

const driven = rule.trait('Driven by Arrow Keys');
driven.uses(CanMove);
const turnSpeed = driven.number('turn speed', 180);
const thrust = driven.number('thrust', 6);
// How hard the way it MOVES is pulled toward the way it POINTS, per second.
//
// Zero is a ship: thrust goes where the nose points, but the velocity it built
// up does not care, so it skates. Wind it up and it becomes a car, which cannot
// travel sideways however hard it is shoved.
//
// Zero by default because this rule was the ship first, and a saved project
// that never heard of grip must drive exactly as it did.
const grip = driven.number('grip', 0);

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

/**
 * How fast the actor is travelling along its own nose — negative backing up.
 *
 * The projection of the velocity onto the facing direction, which is what makes
 * grip work in both directions. Measuring the plain SPEED instead would make a
 * reversing car snap round to forwards, because a speed has no sign to say it
 * was going the other way.
 */
export const speedAhead = rule.block({
  returns: 'number',
  description:
    'How fast this actor is moving in the direction it is pointing. Negative when it is backing up, and zero when it is sliding straight sideways.',
  say: ['how fast', param('who', 'actor'), 'is going forward'],
  body: ({who}) => [
    note(
      'The part of the velocity that lies along the nose; sideways counts for nothing.',
    ),
    give(
      add(
        times(
          axisOf('x', velocity.of(who.get())),
          axisOf('x', facing({who: who.get()})),
        ),
        times(
          axisOf('y', velocity.of(who.get())),
          axisOf('y', facing({who: who.get()})),
        ),
      ),
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
  note('Grip: drag the way it is MOVING round toward the way it is POINTING.'),
  note(
    'At zero this does nothing and it skates like a ship. Wound up, it is a car.',
  ),
  note(
    'Whatever is left over is the sideways slide, and that is what gets eaten.',
  ),
  velocity.set(
    thisActor(),
    vectorPlus(
      velocity.of(thisActor()),
      vectorTimes(
        // Where it would be going if it could only go forwards, less where it
        // is actually going: the sideways part, and nothing else.
        vectorMinus(
          vectorTimes(
            facing({who: thisActor()}),
            speedAhead({who: thisActor()}),
          ),
          velocity.of(thisActor()),
        ),
        // Per second, and capped: a grip so strong it would take more than all
        // of the slide in one frame takes exactly all of it, rather than
        // overshooting and swinging back the other way every frame.
        pick(
          moreThan(times(grip.of(thisActor()), frameTime()), n(1)),
          n(1),
          times(grip.of(thisActor()), frameTime()),
        ),
      ),
    ),
  ),
]);

export default () => moduleFor(rule, 'drive');
