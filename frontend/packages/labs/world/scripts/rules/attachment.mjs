import {Positional, position, setPosition} from './builtins.mjs';
import {
  add,
  anyOf,
  defineRule,
  moduleFor,
  note,
  thisActor,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Attachment',
  ability: 'Rides Along with an Actor',
  header: `// "Rides Along with an Actor" — two things that move as one.
//
// CAMERA FOLLOW, ONE LEVEL DOWN. That rule points the VIEW at an actor and
// keeps it there with an offset; this points an ACTOR at another and does the
// same. The two are the same sentence about different subjects, and this one
// is written the way that one is on purpose — an actor property to name the
// subject, a point to say where relative to it, and a guard for the ordinary
// case of being attached to nobody yet.
//
// What it is FOR is everything a game hangs off something else: a health bar
// over an enemy, a name tag over a player, a shield around a ship, a shadow
// under a jumper. Each of those is otherwise a handler that copies a position
// every frame, written once per thing that needs it.
//
// IT RUNS IN \`react\`, the last moment an actor has, and that is a choice with
// a cost. Everything that moves the subject has moved it by then — velocity in
// \`move\`, the edges in \`adjust\`, solids pushing apart in \`settle\` — so what
// this copies is where the subject ended up rather than where it was going.
// The cost is Gravity, which SNAPS a lander to its rest height in \`react\` too:
// steps in one phase are unordered, so a rider may copy the position from
// before that snap and be a frame behind on the one frame somebody lands. For
// a bar floating overhead that is invisible. For a turret it would not be, and
// the answer then is a moment of its own after \`react\` rather than a rule that
// guesses.
//
// THE OFFSET DOES NOT ROTATE with the subject, which is what a bar wants and
// not what a turret wants. Screen-space is the common case and the simple one;
// turning it with the subject is the obvious next knob and is deliberately not
// guessed at here.
//
// It moves the rider and never the subject, so two actors attached to each
// other is a thing you can write and it settles rather than fighting: each
// reads where the other ENDED UP last frame.`,
});
rule.uses('Space');

const attached = rule.trait('Attached');
attached.uses(Positional);

/**
 * Who to ride. ONE actor, and the type says so — `attached to` is not a set of
 * things to be in the middle of, and saying `actor` is what stops `add … to
 * attached to` being generated (`rules/cameraFollow` makes the same choice).
 */
const to = attached.actor('attached to');

/**
 * Where to sit relative to it. Up the level is NEGATIVE y, so the default puts
 * a rider a little above whatever it is on — which is where a bar or a name
 * goes, and the commonest thing anyone attaches.
 */
const offset = attached.point('offset', {x: 0, y: -24});

export const Attached = rule.traitRef('Attached');

attached.step('ride along', 'react', [
  note('Attached to nobody is the ordinary state of a rider nothing has'),
  note('pointed yet, so it stays where it was put rather than at the origin.'),
  when([
    [
      anyOf(to.of(thisActor())),
      [
        setPosition(
          thisActor(),
          add(position.x(to.of(thisActor())), offset.x(thisActor())),
          add(position.y(to.of(thisActor())), offset.y(thisActor())),
        ),
      ],
    ],
  ]),
]);

export default () => moduleFor(rule, 'attachment');
