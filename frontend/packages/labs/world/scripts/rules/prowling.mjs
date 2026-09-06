import {position} from './builtins.mjs';
import {
  climbDown,
  climbUp,
  climbing,
  Climbs,
  goingUp,
  onLadder,
} from './climb.mjs';
import {
  absolute,
  axisOf,
  both,
  countOf,
  defineRule,
  doc,
  either,
  equals,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  no,
  not,
  note,
  thisActor,
  times,
  vector,
  when,
  yes,
} from './dsl.mjs';
import {AffectedByGravity, falling} from './gravity.mjs';
import {held, velocity} from './motion.mjs';

const rule = defineRule({
  name: 'Prowling',
  ability: 'Prowls',
  header: `// "Prowls" — an enemy that thinks rarely.
//
// Steering already chases: it reads where you are, every frame, and points
// itself at you. In an open field that is the whole of pursuit. In a PLATFORMER
// it is useless — the thing you are chasing is usually up a ladder or across a
// gap, and an enemy that turns towards it every frame walks into the wall
// underneath it and stays there, twitching, for the rest of the level.
//
// What a platformer enemy does instead is commit. It goes the way it is going,
// and it reconsiders only where reconsidering is possible:
//
//     when it lands            — the floor it is on is a new floor
//     when it reaches a ladder — there is now an up and a down to choose from
//     when a climb ends        — it is somewhere new, on top of or under one
//     when it stops getting anywhere — the way it chose has run out
//
// The fourth was not in the plan and a level put it there. A robot that has
// decided is committed until the next junction, and a robot committed to a
// direction with a wall in it walks into the wall and stays there for the rest
// of the game — which is precisely the failure this rule was written to avoid
// in Patrol. So being stopped is a junction: the same "did I get anywhere"
// question \`Turning\` asks, and for the same reason.
//
// AND A WALL RULES OUT THE WAY IT WAS GOING. Making being stopped a junction
// is not enough on its own, which the same level showed a minute later: the
// quarry is still over there, so the robot chooses the same direction, fails
// again, and is stuck in a loop of deciding rather than a loop of walking.
// So a decision arrived at by being stopped cannot come out the way it went
// in — the direction it was going is the one direction now known not to work.
// That is what lets a robot get round a wall to a ladder rather than pressing
// itself against the wall the quarry happens to be behind.
//
// Between those it does not think at all, and that is what makes it READABLE.
// A player can watch it for two seconds and know what it will do, which is the
// difference between an enemy you avoid and an enemy you are hit by.
//
// IT IS ALSO WHY IT GETS ANYWHERE. Deciding every frame means changing your
// mind at the moment you are half-way on to a ladder, which is how a
// continuous chaser ends up oscillating at the foot of one for ever. Deciding
// at a junction means the decision survives long enough to be carried out.
//
// THE CHOICE ITSELF IS THREE LINES, in this order, and the order is the
// design. Up or down first, because a ladder is the only way to change which
// floor you are on and an enemy that preferred sideways would never take one.
// Then left or right. Then, if neither says anything, keep going — which is
// what makes a robot that has lost you carry on rather than stop.
//
// IT TAKES THE LADDER RATHER THAN KNOWING ABOUT LADDERS. \`Climbs\` is the same
// trait a player elects, so what a robot can climb is exactly what a player
// can, and a level that adds a ladder has added it for both of them.
//
// STRICTLY LEFT OR RIGHT, with a tolerance, because "the player is at the same
// x as me" is a thing that is almost never exactly true and almost always
// nearly true. Without it a robot standing under the player flips direction
// every frame and vibrates.
//
// AND IT DOES NOT DECIDE WITH NOTHING TO HUNT. A quarry that has not been set
// yet — the handler naming it runs on the frame the robot arrives, and the
// robot's first landing can beat it — reads as a position of nothing, which
// compares false against everything and leaves the robot with whatever
// direction it was born with. That is a decision taken on no information, and
// it is worse than none: it uses up the junction. So there is nothing to
// decide until there is something to decide about.`,
});
rule.uses('Gravity');
rule.uses('Climbing');
rule.uses('Physics');

const prowls = rule.trait('Prowls');
prowls.uses(AffectedByGravity);
prowls.uses(Climbs);

/**
 * Who it is after.
 *
 * An actor rather than a kind, which is `Steering`'s shape: a project points
 * it at `first actor in ⟨any Player⟩` and the robot never learns the word
 * "player".
 */
const quarry = prowls.actor('actor to hunt');
/** Units a second along the floor. */
const speed = prowls.number('prowl speed', 1);
/**
 * How far off centre counts as "over there", in pixels.
 *
 * Half a tile. Without it a robot standing under its quarry flips direction
 * every frame and vibrates on the spot — "exactly the same x" is a thing that
 * is almost never true and almost always nearly true.
 */
const tolerance = prowls.number('close enough', 16);
/**
 * Which way it is going: -1 for left, 1 for right.
 *
 * SETTABLE, for the reason `Turning`'s heading is: which way an enemy sets off
 * is a fact about where a level put it. It matters more here than there,
 * because a robot's first junction can arrive before the handler naming its
 * quarry has — and a robot with nothing to hunt yet keeps whatever it was
 * born with until the next one.
 */
const going = prowls.number('going', 1);

// What the last frame looked like, so this one can tell a moment from a state.
// Three booleans and no other bookkeeping: a junction is a CHANGE, and a
// change is the only thing a step running every frame cannot see by itself.
const wasFalling = prowls.boolean('was falling', 'false', {readonly: true});
const wasOnLadder = prowls.boolean('was on a ladder', 'false', {
  readonly: true,
});
const wasClimbing = prowls.boolean('was climbing', 'false', {readonly: true});
/**
 * Where it was at the top of the LAST frame — both axes.
 *
 * The fourth junction: a robot that asked to go somewhere and did not is a
 * robot whose direction has run out. `Turning` asks the same question of its
 * own heading, and for the same reason — a wall is not something to look for,
 * it is something you notice by not getting past it.
 *
 * IT IS NOT `position before`, and the difference is which frame. Physics
 * records where a body stood at the top of THIS frame, which is the right
 * answer for anything asked afterwards — `Turning` and `Climbing` both ask in
 * `react`, once the frame's moving is over. This rule asks in `decide`, before
 * any of it has happened, so the record and the position are the same place
 * and the distance between them is zero. What a chooser needs is the frame
 * that just finished, which nothing but a note taken last time can give.
 *
 * A POINT rather than a sideways distance, and that is the fix for two things
 * at once. A climber pinned against a floor moves in neither axis and was
 * previously not stuck at all, because the test excluded anything climbing —
 * which is how a robot came to spend a level frozen on the bottom rung. And a
 * robot in free fall moves only downwards, which the sideways test read as
 * stuck, so it re-decided on every frame of every fall.
 */
const wasAt = prowls.point('was at', {x: 0, y: 0}, {readonly: true});

export const Prowls = rule.traitRef('Prowls');

/** Raised when it stops to think — which is rarely, and is worth hearing. */
const chose = prowls.event(['chooses']);

const here = rule.local('here', 'Boolean');
/** Which way, if either, a climb that got nowhere was going. */
const noUp = rule.local('noUp', 'Boolean');
const noDown = rule.local('noDown', 'Boolean');
const ladder = rule.local('ladder', 'Boolean');
const junction = rule.local('junction', 'Boolean');
const stuck = rule.local('stuck', 'Boolean');
const was = rule.local('was', 'Number');
const dy = rule.local('dy', 'Number');
const dx = rule.local('dx', 'Number');

prowls.step('choose at a junction', 'decide', [
  doc(
    'Nothing to hunt, nothing to do. A robot with no quarry keeps whatever heading it had, which is a robot on patrol.',
  ),
  ladder.set(onLadder({}, thisActor())),
  doc(
    'Stopped? A robot that asked to go somewhere and did not has run out of the direction it chose — a quarter of a pixel of tolerance in each axis, so that a body Solid has nudged is not read as one that got somewhere. Both axes, because a climber pinned against a floor gets nowhere in either and a falling robot gets somewhere in one. …and nothing at all counts while something is holding it: a robot waiting out a teleport has not run out of anywhere to go, it is being carried (`held still` in Physics).',
  ),
  stuck.set(
    both(
      not(held.of(thisActor())),
      both(
        lessThan(
          absolute(minus(position.x(thisActor()), wasAt.x(thisActor()))),
          n(0.25),
        ),
        lessThan(
          absolute(minus(position.y(thisActor()), wasAt.y(thisActor()))),
          n(0.25),
        ),
      ),
    ),
  ),
  doc(
    'The four moments, and each is a CHANGE rather than a state: landing, arriving at a ladder, a climb ending, and getting nowhere.',
  ),
  junction.set(
    either(
      either(
        both(wasFalling.of(thisActor()), not(falling.of(thisActor()))),
        both(not(wasOnLadder.of(thisActor())), ladder.get()),
      ),
      either(
        both(wasClimbing.of(thisActor()), not(climbing.of(thisActor()))),
        stuck.get(),
      ),
    ),
  ),
  doc(
    '…and nothing at all to decide with no quarry to decide about. See the header: a choice made on no information uses up the junction.',
  ),
  when([
    [
      both(junction.get(), moreThan(countOf(quarry.of(thisActor())), n(0))),
      [
        was.set(going.of(thisActor())),
        dy.set(
          minus(position.y(quarry.of(thisActor())), position.y(thisActor())),
        ),
        dx.set(
          minus(position.x(quarry.of(thisActor())), position.x(thisActor())),
        ),
        doc(
          'A CLIMB THAT GOT NOWHERE RULES ITSELF OUT, which is the same sentence as the wall below and cost the same bug. A robot on the bottom rung with its quarry beneath it asks to climb down, the floor refuses, the climb ends having moved nothing — and that ending is a junction, at which the robot asks to climb down. It stood there for the rest of the level. So the direction a failed climb was going is the one direction now known not to work, and this junction may not choose it.',
        ),
        noUp.set(
          both(
            stuck.get(),
            both(wasClimbing.of(thisActor()), goingUp.of(thisActor())),
          ),
        ),
        noDown.set(
          both(
            stuck.get(),
            both(wasClimbing.of(thisActor()), not(goingUp.of(thisActor()))),
          ),
        ),
        doc(
          'UP OR DOWN FIRST — see the header. A ladder is the only way to change which floor you are on, so an enemy that preferred sideways would never take one.',
        ),
        here.set(no()),
        when([
          [
            both(
              both(ladder.get(), not(noUp.get())),
              lessThan(dy.get(), times(tolerance.of(thisActor()), n(-1))),
            ),
            [climbUp({who: thisActor()}), here.set(yes())],
          ],
          [
            both(
              both(ladder.get(), not(noDown.get())),
              moreThan(dy.get(), tolerance.of(thisActor())),
            ),
            [climbDown({who: thisActor()}), here.set(yes())],
          ],
        ]),
        doc(
          '…then left or right, and only if the quarry is STRICTLY one side or the other. Otherwise keep going: a robot that has lost you carries on rather than stopping.',
        ),
        when([
          [
            not(here.get()),
            [
              when([
                [
                  lessThan(dx.get(), times(tolerance.of(thisActor()), n(-1))),
                  [going.set(thisActor(), n(-1))],
                ],
                [
                  moreThan(dx.get(), tolerance.of(thisActor())),
                  [going.set(thisActor(), n(1))],
                ],
              ]),
            ],
          ],
        ]),
        doc(
          'A wall rules out the way it was going — see the header. This is the one place a robot moves AWAY from its quarry, and it is what gets it round a wall rather than pressed against one.',
        ),
        when([
          [
            both(stuck.get(), equals(going.of(thisActor()), was.get())),
            [going.set(thisActor(), times(was.get(), n(-1)))],
          ],
        ]),
        chose({}, thisActor()),
      ],
    ],
  ]),
  doc(
    'Where it is going, whether or not it just decided. Not while it is climbing: a ladder is the climb’s to steer, and writing a sideways speed over one would pull the robot off it.',
  ),
  when([
    [
      not(climbing.of(thisActor())),
      [
        velocity.set(
          thisActor(),
          vector(
            times(going.of(thisActor()), speed.of(thisActor())),
            axisOf('y', velocity.of(thisActor())),
          ),
        ),
      ],
    ],
  ]),
  note('And what this frame looked like, for the next one to compare with.'),
  wasFalling.set(thisActor(), falling.of(thisActor())),
  wasOnLadder.set(thisActor(), ladder.get()),
  wasClimbing.set(thisActor(), climbing.of(thisActor())),
  wasAt.set(thisActor(), position.x(thisActor()), position.y(thisActor())),
]);

export default () => moduleFor(rule, 'prowling');
