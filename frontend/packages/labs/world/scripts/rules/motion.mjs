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
/**
 * Whether solid bodies stop this one.
 *
 * The mirror of `Gravity`'s `ignores ground`, and here rather than on `Solid`
 * for the reason that one is here: it is a fact about the MOVER, and a mover
 * need not elect `Solid` at all — a ghost is not a wall. Every body `Solid`
 * would push has `Can Move`, so this is where such a body can carry it.
 *
 * NOT `passes through things`, which is the other way of not being stopped and
 * the wrong one for a ghost: that takes a body out of every contact, and a
 * thing that walks through walls to reach you still has to be able to reach
 * you. Only `rules/solid` reads this, so a body that ignores walls still
 * touches, still damages, still collects and can still be stood on.
 */
const ignoresWalls = canMove.boolean('ignores walls', 'false');
/**
 * How far off a corner may be and still be slipped round, in pixels.
 *
 * A GAP ONE BLOCK WIDE IS EXACTLY ONE BODY WIDE, which is the shape of the
 * problem: jumping or flying up into a one-tile gap means being lined up with
 * it to the pixel, and a few pixels off a corner catches you — so what a
 * player sees is a jump that plainly fitted and did not go. With this, a body
 * caught only a little way into a corner is nudged clear across instead, and
 * keeps the speed it was going up or down with.
 *
 * ZERO MEANS NO FORGIVENESS and is the default, because this is a trade rather
 * than a fix: what it buys going up it costs coming down, since a body that
 * clips the very edge of a ledge now slips off it instead of landing on the
 * sliver. A game about getting into one-tile gaps wants it and a game about
 * landing on ledges does not, so the level says which and says how much.
 *
 * It lives here for the reason `ignores walls` does — it is a fact about the
 * MOVER, and `Solid Bodies` declares exactly one trait on purpose, the one
 * that says what a WALL is. Only `rules/solid` reads it.
 *
 * Keep it small. Much past a quarter of a tile and it starts letting bodies
 * through gaps a player can see they do not fit.
 */
const cornerReach = canMove.number('corner reach', 0);

export const CanMove = rule.traitRef('Can Move');
export {cornerReach, held, ignoresWalls, velocity};

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
