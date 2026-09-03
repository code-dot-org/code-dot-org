import {Positional, position, setPosition} from './builtins.mjs';
import {
  add,
  allWithTrait,
  axisOf,
  defineRule,
  forEach,
  frameTime,
  give,
  moduleFor,
  note,
  param,
  pixelsPerUnit,
  thisActor,
  times,
  vector,
  vectorMinus,
  vectorPlus,
  vectorTimes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Physics',
  ability: 'Has Physics',
  header: `// "Has Physics" — velocity becomes position, which is the \`move\` moment.
//
// The one every other mechanic is arranged around: gravity and the arrow keys
// add to velocity before it, collision reads the positions after it. They used
// to say so by naming this rule's step, which made its NAME load-bearing —
// four rules broke if it was renamed. They each name a moment now.`,
});
rule.uses('Space');

const canMove = rule.trait('Can Move');
canMove.uses(Positional);
const velocity = canMove.vector('velocity', {x: 0, y: 0});

/**
 * Whether something is deliberately holding this body where it is.
 *
 * NOT "it is not moving", which is a thing anybody can see by looking at the
 * velocity. This says WHY: a body that got nowhere because a wall was in the
 * way and a body that got nowhere because a teleport pad is carrying it
 * between two places look identical from outside, and two rules in this
 * library act on the difference. `Turning` turns when it did not travel as far
 * as it asked, and `Prowling` treats getting nowhere as a moment to think
 * again — both correct about a wall, both wrong about a body somebody is
 * holding on purpose, and neither able to tell without being told.
 *
 * It lives HERE, on the trait every mover already elects, rather than on the
 * rule that happens to set it. `Turning` should not have to hold `Teleport` to
 * ask this question, and the next thing that wants to hold a body still — a
 * cutscene, a stun, a conveyor with a gate on it — should not have to be
 * `Teleport` either.
 *
 * Whoever sets it clears it. Nothing here times it out: a flag that expired on
 * its own would be a second opinion about how long a hold lasts.
 */
const held = canMove.boolean('held still', 'false');

export const CanMove = rule.traitRef('Can Move');
export {held, velocity};

/** Where an actor was, going the speed it is going now. */
export const positionBefore = rule.block({
  returns: 'vector',
  description:
    'Where this actor was that many seconds ago, at the speed it is going now.',
  say: [
    param('subject', 'actor'),
    'position before',
    param('seconds', 'number'),
  ],
  body: ({subject, seconds}) => [
    note(
      'Rewind: where was this actor a moment ago, going the speed it is going?',
    ),
    note(
      'Speed is in units per second, position is in pixels — so we multiply',
    ),
    note('by "pixels per unit" to turn one into the other.'),
    give(
      vectorMinus(
        vector(position.x(subject.get()), position.y(subject.get())),
        vectorTimes(
          velocity.of(subject.get()),
          times(seconds.get(), pixelsPerUnit()),
        ),
      ),
    ),
  ],
});

/** A shove: adds to the speed an actor already has. */
export const applyForce = canMove.block({
  returns: 'none',
  description: 'Gives this actor a shove: adds to the speed it already has.',
  say: ['apply force', param('force', 'vector')],
  body: ({force}) => [
    note('A push does not set the speed, it CHANGES it: add it on.'),
    note(
      'That is why a jump still works while you are already moving sideways.',
    ),
    velocity.set(
      thisActor(),
      vectorPlus(velocity.of(thisActor()), force.get()),
    ),
  ],
});

const each = rule.local('each', 'Actor');
const travel = rule.local('travel', 'Vector');

rule.step('reposition', 'move', [
  forEach(each, {
    from: allWithTrait(CanMove),
    body: [
      note('Moving is speed times time: how far do we get this frame?'),
      travel.set(
        vectorTimes(
          velocity.of(each.get()),
          times(frameTime(), pixelsPerUnit()),
        ),
      ),
      note('Then add that to where the actor already is.'),
      setPosition(
        each.get(),
        add(position.x(each.get()), axisOf('x', travel.get())),
        add(position.y(each.get()), axisOf('y', travel.get())),
      ),
    ],
  }),
]);

export default () => moduleFor(rule, 'motion');
