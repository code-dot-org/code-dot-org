import {position} from './builtins.mjs';
import {Aimed, goal} from './camera.mjs';
import {
  defineRule,
  doc,
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
  ability: 'Catches Up Smoothly',
  purpose: `**Camera Ease** makes the camera catch up smoothly instead of snapping.

Whatever the camera is aiming at, this drifts it there over a few frames — so a
player who stops running is centred a moment later rather than instantly.

Give a camera **Eases** and set the smoothness. Smaller is lazier; 1 is no
easing at all.`,
  header: `// "Catches Up Smoothly" — the camera catches up instead of snapping.
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
    doc(
      '**How much of the gap to close this frame.**\n\nSmoothness is the fraction of the remaining gap to close in one frame *at sixty frames a second* — `0.2` means a fifth of what is left, every frame. After `n` such frames the part still uncovered is `(1 - smoothness)^n`, so the part covered is `1 - (1 - smoothness)^n`. That is this block, with `n = seconds x 60`.\n\nWorking it out this way, rather than just multiplying by the frame time, is what makes the same smoothness feel the same whether the game runs at thirty frames a second or two hundred. The curve is the same shape; a faster machine only samples it more often.',
    ),
    give(
      minus(
        n(1),
        power(minus(n(1), smoothness.get()), times(seconds.get(), n(60))),
      ),
    ),
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
  doc(
    'Move a **fraction of the way** from where the camera is to where it wants to be: `position + (goal - position) x caught up`.\n\nIt never quite arrives, and that is the point — the closer it gets the less it moves, so the camera glides after a running player instead of snapping to it.',
  ),
  goal.set(thisCamera(), eased('x'), eased('y')),
]);

export default () => moduleFor(rule, 'cameraEase');
