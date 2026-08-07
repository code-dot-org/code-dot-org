import {position} from './builtins.mjs';
import {Aimed, goal} from './camera.mjs';
import {anyOf, defineRule, moduleFor, thisCamera, when} from './dsl.mjs';

const rule = defineRule({
  name: 'Camera Follow',
  ability: 'Follows an Actor',
  header: `// "Follows an Actor" — the worked example of a camera rule.
//
// One step, in the \`aim\` moment: put the goal where the followed actor is.
// It does not move the camera; Camera's \`take the view\` does that in \`view\`,
// and anything smoothing or confining the goal runs in between. So this rule
// names no other rule's step, and adding easing later changes nothing here.
//
// \`actor to follow\` holds a LIST, as every \`actors\` property does — reading a
// position off it takes the first, which is what a value read of several means
// (specs/ACTOR_LISTS.md). It starts EMPTY, so the step is guarded: a camera
// that has elected the trait and not yet been given anything to follow is the
// state every such camera is in for at least one frame.`,
});
rule.uses('Camera');

const follows = rule.trait('Follows', 'camera');
follows.uses(Aimed);
const target = follows.actors('actor to follow');

follows.step('aim at the actor', 'aim', [
  when([
    [
      anyOf(target.of(thisCamera())),
      [
        goal.set(
          thisCamera(),
          position.x(target.of(thisCamera())),
          position.y(target.of(thisCamera())),
        ),
      ],
    ],
  ]),
]);

export default () => moduleFor(rule, 'cameraFollow');
