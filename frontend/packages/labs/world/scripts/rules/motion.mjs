import {Positional, position, setPosition} from './builtins.mjs';
import {
  add,
  allWithTrait,
  axisOf,
  defineRule,
  doc,
  forEach,
  frameTime,
  moduleFor,
  note,
  param,
  pixelsPerUnit,
  thisActor,
  times,
  vectorPlus,
  vectorTimes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Physics',
  ability: 'Has Physics',
  purpose: `**Physics** is what turns a speed into movement.

Almost every other rule here works by setting an actor's *velocity* — arrow
keys, gravity, patrol, steering, drive — and this is the one that then moves
the actor by it, once, in the right moment.

Give anything that moves at all **Can Move**. Most rules in this library need
it.`,
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
/**
 * Where this body was at the top of the frame — RECORDED, not worked out.
 *
 * Half the library asks where a body was: Solid, to tell which face it came
 * in through; Gravity, to tell whether it crossed a surface this frame;
 * Climbing, to measure a climb against where it started. This used to be a
 * query that answered `position − velocity × time`, which is where the body
 * was IF velocity is what moved it — and disagreed with the truth whenever
 * something set the position by hand. A ladder snapping a climber to its
 * rungs, a pad teleporting a traveler, a step parking a speed at zero: each
 * made the query say "it has always been exactly here", and Solid, asked to
 * push such a body out of the floor it stood in, could not tell which way it
 * came from and took the shortest way out. Sideways, a tile a frame. Three
 * rules grew a private record of their own to get round it.
 *
 * So Physics writes it down instead, once a frame, in `sense` — the first
 * moment, before anything decides anything and long before anything moves.
 * From then to the end of the frame the answer is a fact about this frame
 * rather than a guess from its speed, and a rule that moves a body by hand no
 * longer has to lie about its velocity to keep the rest of the library honest.
 *
 * Read-only, because the one thing it means is "where Physics saw you at the
 * top of the frame" and a project writing to it would be writing history.
 *
 * A body added in the MIDDLE of a frame has not been seen yet and reads its
 * default until the next `sense` — one frame, and only for a body that
 * appears already overlapping something solid.
 */
const positionBefore = canMove.point(
  'position before',
  {x: 0, y: 0},
  {readonly: true},
);

export const CanMove = rule.traitRef('Can Move');
export {cornerReach, held, ignoresWalls, positionBefore, velocity};

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

/**
 * `forget how ⟨who⟩ got here` — the record, told the truth about a placement.
 *
 * THE OTHER HALF OF `position before` BEING A RECORD. The record is written in
 * `sense` and is the truth about where a body started the frame. A rule that
 * moves a body BY HAND — a pad setting a traveler down, a ladder snapping a
 * climber to its rungs — makes that truth useless to anything asking which way
 * the body came, because the answer is "from across the room" and there is no
 * line between the two ends to resolve against.
 *
 * Solid is the rule that asks. It pushes a body out of a solid one along the
 * face it came in through and works that face out from this record, so a
 * traveler landing on a floor was pushed out along the line from the pad it
 * left — for a pad above a floor, straight down through it.
 *
 * So a placement says so, and everything downstream reads a body that has
 * always been where it now is. Which is what a discontinuity means: there was
 * no journey, so there is no direction to take from it. Solid's question then
 * becomes "which side of this solid am I on", which is the right one.
 *
 * IT IS NOT ENOUGH ON ITS OWN. Turning asks a different question of the same
 * record — how far did I get along my heading — and reads no movement as
 * having been stopped. A caller that places a body must also hold it still for
 * that frame (`held still`), which is the flag that already exists for exactly
 * this and which `Teleport` already sets for the wait.
 */
export const placed = canMove.block({
  returns: 'none',
  description:
    'Treat this actor as having always been where it is now. For a rule that moves a body by hand: nothing that asks which way it came will answer with the place it left.',
  say: ['forget how', param('who', 'actor'), 'got here'],
  body: ({who}) => [
    positionBefore.set(who.get(), position.x(who.get()), position.y(who.get())),
  ],
});

const each = rule.local('each', 'Actor');
const travel = rule.local('travel', 'Vector');

// The rule's own step rather than the trait's, because `sense` is a moment of
// the WORLD and a trait's step may only name the moments its subject takes
// part in (engine/core/phases). It has to be this early: `push` is where a
// teleport pad sets a traveler down, and a record taken after that would say
// the traveler had always stood at the far pad.
rule.step('note where each body starts', 'sense', [
  forEach(each, {
    from: allWithTrait(CanMove),
    body: [
      doc(
        'Before anything moves: where is everybody? Written down so that the rest of the frame can ask, whatever moves them meanwhile.',
      ),
      positionBefore.set(
        each.get(),
        position.x(each.get()),
        position.y(each.get()),
      ),
    ],
  }),
]);

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
