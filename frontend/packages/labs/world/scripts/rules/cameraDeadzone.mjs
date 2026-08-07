import {position} from './builtins.mjs';
import {Aimed, goal} from './camera.mjs';
import {
  add,
  defineRule,
  give,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  param,
  thisCamera,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Camera Deadzone',
  ability: 'Ignores Small Movements',
  header: `// "Ignores Small Movements" — the camera holds still while the subject moves
// about inside a box, and only follows once it leaves.
//
// The single biggest difference in how a platform camera FEELS. Without it the
// view answers every hop and wobble the player makes; with it the player moves
// freely in the middle of the screen and the camera only travels when they
// really go somewhere.
//
// It runs in \`steady\`, which exists because of it. A deadzone and an easing
// rule both wanted \`smooth\` and do not commute: a deadzone measures how far the
// aim has moved from where the camera IS, so easing first shrinks that gap and
// the deadzone barely ever fires. Adjusting the aim is not the same act as
// deciding how fast to follow it, so they are two moments (engine/core/phases).
//
// Once it does move, it sits exactly \`slack\` behind the target rather than
// jumping to it — so the subject rests on the edge of the box it left, and the
// next frame's decision starts from there instead of snapping back to centre.`,
});
rule.uses('Camera');

const drag = rule.block({
  returns: 'number',
  description:
    'Where to look so the target is no further than the slack away: unmoved while it is closer than that, and trailing it by exactly the slack once it is further.',
  say: [
    'drag',
    param('target'),
    'to within',
    param('slack'),
    'of',
    param('here'),
  ],
  body: ({target, slack, here}) => [
    when([
      // Further ahead than the slack: sit exactly that far behind it.
      [
        moreThan(target.get(), add(here.get(), slack.get())),
        [give(minus(target.get(), slack.get()))],
      ],
      [
        lessThan(target.get(), minus(here.get(), slack.get())),
        [give(add(target.get(), slack.get()))],
      ],
    ]),
    // Inside the slack: do not move at all.
    give(here.get()),
  ],
});

const deadzone = rule.trait('Has a Deadzone', 'camera');
deadzone.uses(Aimed);
const slack = deadzone.point('slack', {x: 48, y: 32});

const dragged = which =>
  drag({
    target: goal.axis(which, thisCamera()),
    slack: slack.axis(which, thisCamera()),
    here: position.axis(which, thisCamera()),
  });

deadzone.step('ignore small movements', 'steady', [
  goal.set(thisCamera(), dragged('x'), dragged('y')),
]);

export default () => moduleFor(rule, 'cameraDeadzone');
