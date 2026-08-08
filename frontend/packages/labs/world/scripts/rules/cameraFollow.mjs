import {position} from './builtins.mjs';
import {Aimed, goal} from './camera.mjs';
import {add, anyOf, defineRule, moduleFor, thisCamera, when} from './dsl.mjs';

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
// state every such camera is in for at least one frame.
//
// \`look offset\` shifts where it aims — negative y to look UP the level, which
// is how a camera shows what a player is about to jump onto. It is added HERE,
// into the goal, rather than to the position at the end: everything downstream
// then reads the point actually being framed, so a deadzone measures its
// slack against that point and \`confine\` keeps THAT inside the map. Add it
// last and looking up at the top of a level would show off the top of it.
//
// It has no easing of its own, deliberately. A change to it is a change to the
// goal like any other, so a camera with the Ease trait drifts to the new
// framing for free (see Camera Ease's header) and one without snaps, which is
// the same choice the rest of following already offers. What this cannot do is
// ease the offset at a DIFFERENT rate from the follow — a tight follow with a
// slow look-up ramp — and that is the thing that would make this a trait of
// its own, with a moment between \`aim\` and \`steady\` to run in.`,
});
rule.uses('Camera');

const follows = rule.trait('Follows', 'camera');
follows.uses(Aimed);
const target = follows.actors('actor to follow');
/** Where to look RELATIVE to the actor: up the level is negative y. */
const look = follows.point('look offset', {x: 0, y: 0});

follows.step('aim at the actor', 'aim', [
  when([
    [
      anyOf(target.of(thisCamera())),
      [
        goal.set(
          thisCamera(),
          add(position.x(target.of(thisCamera())), look.x(thisCamera())),
          add(position.y(target.of(thisCamera())), look.y(thisCamera())),
        ),
      ],
    ],
  ]),
]);

export default () => moduleFor(rule, 'cameraFollow');
