import {position} from './builtins.mjs';
import {Aimed, goal} from './camera.mjs';
import {
  defineRule,
  frameTime,
  minus,
  moduleFor,
  n,
  param,
  power,
  thisCamera,
  times,
  add,
  give,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Camera Ease',
  ability: 'Eases the Camera',
  header: `// "Eases the Camera" — the camera catches up instead of snapping.
//
// It reads the goal something else proposed and hands back a nearer one, so the
// camera drifts toward what it is aiming at over a few frames and a player who
// stops moving is centred a moment later rather than instantly. Smaller
// smoothness, lazier camera; 1 is no easing at all.
//
// It runs in \`smooth\`, between whatever aimed and whatever confines, and names
// no other rule. Nothing here knows that Camera Follow exists — anything that
// writes the goal in \`aim\` is eased by this, and a camera with no aiming trait
// eases toward where it already is, which is nowhere.
//
// THE FRACTION IT TRAVELS DEPENDS ON THE FRAME TIME. Moving \`smoothness\` of the
// way each frame is the obvious form and is wrong: it eases twice as fast at
// 120fps as at 60, and lags on a slow frame. What stays constant instead is how
// much of the gap is left after a SECOND, so the same number feels the same
// however fast the game is running — and easing compounds, so the correction is
// a power rather than a multiply.`,
});
rule.uses('Camera');

const caughtUp = rule.block({
  returns: 'number',
  description:
    'How far to travel toward the goal in one frame, so the same smoothness feels the same however fast the game is running.',
  say: [param('smoothness'), 'caught up over', param('seconds'), 'seconds'],
  // 1 - (1 - smoothness) ^ (seconds x 60): what is LEFT of the gap after this
  // frame, taken away from all of it.
  body: ({smoothness, seconds}) => [
    give(minus(n(1), power(minus(n(1), smoothness), times(seconds, n(60))))),
  ],
});

const eases = rule.trait('Eases', 'camera');
eases.uses(Aimed);
const smoothness = eases.number('smoothness', 0.2);

/** position + (goal - position) x the fraction to travel this frame. */
const eased = which =>
  add(
    position.axis(which, thisCamera()),
    times(
      minus(goal.axis(which, thisCamera()), position.axis(which, thisCamera())),
      caughtUp({
        smoothness: smoothness.of(thisCamera()),
        seconds: frameTime(),
      }),
    ),
  );

eases.step('ease toward the goal', 'smooth', [
  goal.set(thisCamera(), eased('x'), eased('y')),
]);

export default () => moduleFor(rule, 'cameraEase');
