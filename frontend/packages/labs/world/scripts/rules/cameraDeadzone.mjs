import {position} from './builtins.mjs';
import {Aimed, goal} from './camera.mjs';
import {
  add,
  defineRule,
  doc,
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
  ability: 'Ignores Small Moves',
  purpose: `**Camera Deadzone** lets the subject move about a little without the camera
answering every step.

This is the single biggest difference in how a platformer *feels*. Without it
the view twitches at every hop; with it the player moves freely in the middle
of the screen and the camera only travels when they really go somewhere.

Give a camera **Has a Deadzone** and set how big the still box in the middle
is.`,
  header: `// "Ignores Small Moves" — the camera holds still while the subject moves
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
// next frame's decision starts from there instead of snapping back to center.`,
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
    doc(
      '**A window the target can move about inside without the camera moving at all.**\n\nIf the target has got further ahead than the slack, the camera sits exactly `slack` behind it; if it has fallen further behind, exactly `slack` in front. Anywhere between the two, the camera stays where it is.\n\nSo the camera is dragged along by the EDGE of the window rather than following the target itself, which is what stops a small wobble in the player from shaking the whole screen.',
    ),
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
  doc(
    'Each axis on its own, so a player moving sideways inside the slack does not drag the view up and down with it.',
  ),
  goal.set(thisCamera(), dragged('x'), dragged('y')),
]);

export default () => moduleFor(rule, 'cameraDeadzone');
