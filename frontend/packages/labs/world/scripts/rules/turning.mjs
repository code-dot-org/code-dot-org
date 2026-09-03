import {position, rotation} from './builtins.mjs';
import {CanCollide} from './collisions.mjs';
import {
  add,
  axisOf,
  defineRule,
  frameTime,
  lessThan,
  minus,
  moduleFor,
  n,
  note,
  pixelsPerUnit,
  remainder,
  thisActor,
  times,
  vectorFromAngle,
  vectorMinus,
  vectorPlus,
  vectorTimes,
  when,
  yes,
} from './dsl.mjs';
import {CanMove, velocity} from './motion.mjs';

const rule = defineRule({
  name: 'Turning',
  ability: 'Turns When It Hits Something',
  header: `// "Turns When It Hits Something" — the enemy that needs no brain at all.
//
// Patrol already walks back and forth, and it turns on a CLOCK: a beat is a
// speed and a period, and a guard walking one has no idea there is a wall in
// front of it. That is the right answer for a guard on a fixed beat and the
// wrong one for anything in a room whose shape it should respect — put a
// patrolling actor in a corridor half as long as its beat and it spends half
// its life pressed against the end.
//
// So this turns on the WORLD instead, and one number decides what kind of
// enemy it is:
//
//     turn by 180   a ball rolling along the floor, back and forth for ever
//     turn by 90    a rocket that takes the next turning every time it stops
//     turn by 120   something that paces out a triangle
//
// Nothing here knows which of those it is, which is the point: three enemies
// out of one trait and one dial (JETPACK.md, phases 3 and 7).
//
// IT ASKS WHETHER IT GOT THERE, rather than what is in front of it. Looking
// ahead means asking which of the things being touched is on the side the
// actor is going, which is a dot product and a threshold and gets the corners
// wrong; and it means being told about the wall a frame before hitting it,
// while Solid is still pushing. Whereas "I asked to travel this far along my
// heading and I did not" is one subtraction, is true of every way of being
// stopped — a solid wall, a body being pushed apart, an actor that walked into
// it — and is asked after all of them have happened.
//
// GRAVITY STILL WORKS, and that is what makes the rolling ball a rolling ball
// — but only because of one line that looks like arithmetic for its own sake.
//
// Writing the whole velocity from the heading, which is the obvious thing,
// wipes the vertical speed every frame. Gravity then gets to add exactly one
// frame of itself before it is thrown away again, so a "falling" ball sinks a
// quarter of a pixel a frame: fifteen pixels a second instead of four hundred
// and fifty. It looks like a slow leak rather than a bug.
//
// So the heading writes only the part of the velocity that is ALONG it, and
// leaves the part across it alone. A ball rolling sideways keeps whatever
// gravity has given it downwards and lands; a rocket with no gravity has
// nothing across its heading to keep and flies straight. Neither had to be
// told which it is.
//
// THE HEADING IS SETTABLE, because which way an enemy starts is a fact about
// where a level put it, and a room full of these all setting off rightwards is
// a room that reads as one enemy copied.
//
// AND IT CAN POINT THE DRAWING, which is a separate switch because whether a
// picture should turn is a fact about the picture and not about the movement.
// A ball is round and turning it does nothing; a rocket that takes a corner
// and keeps flying nose-east is the one thing in the room that reads as broken.
// So \`points where it goes\` is off by default — nothing that already works
// starts spinning — and the rocket in the jetpack level turns it on.
//
// The heading IS the rotation, with no conversion between them, because both
// are the same compass: zero points right and ninety points down, which is
// what \`vector direction\` answers and how the stock rocket is drawn. A rule
// that had to correct for the artwork would be a rule with a number in it that
// only one drawing could explain.`,
});
rule.uses('Physics');
rule.uses('Collisions');

const turns = rule.trait('Turns When It Hits Something');
turns.uses(CanMove);
turns.uses(CanCollide);

/**
 * Which way it is going, in degrees: 0 is right, 90 is down.
 *
 * The same compass every other rule here uses (`vector direction`), and
 * settable, so a level can aim one.
 */
const heading = turns.number('heading', 0);
/** Units a second along that heading — a hundred pixels each. */
const speed = turns.number('travel speed', 1);
/**
 * How far to turn when it is stopped, in degrees.
 *
 * A hundred and eighty is a reversal, which is what a rolling ball does;
 * ninety is a rocket taking the next turning. Signed, so -90 turns the other
 * way and a room can hold both.
 */
const turnBy = turns.number('turn by', 180);
/**
 * Whether the drawing turns with the heading.
 *
 * Off by default, because whether a picture should point somewhere is a fact
 * about the picture: a ball is round and a crate has a top. On, the rotation
 * IS the heading — same compass, no correction — so a drawing that points
 * right when it is not turned points where it is going, which is how the
 * stock rocket is drawn.
 */
const points = turns.boolean('points where it goes', 'false');
/**
 * Where it was at the top of this frame.
 *
 * Read-only bookkeeping, and a POINT rather than a vector because it is a
 * place. Compared against where it ended up, which is the whole of how this
 * rule notices a wall.
 */
const wasAt = turns.point('was at', {x: 0, y: 0}, {readonly: true});
/**
 * Whether `was at` has been filled in.
 *
 * The same extra bit `Carrying` needs and for the same reason: on the first
 * frame there is no "where I was", and every position is a place an actor
 * might really be, so there is no value that could stand for "not yet". An
 * actor without it turns on its first frame, because the distance from the
 * origin is not a distance it travelled.
 */
const measured = turns.boolean('measured', 'false', {readonly: true});

export const TurnsWhenItHitsSomething = rule.traitRef(
  'Turns When It Hits Something',
);

/** Raised on the frame it turns — what a bounce sounds like. */
const turned = turns.event(['turns']);

const alongNow = rule.local('alongNow', 'Number');

/** The heading as a unit vector, which is what a velocity is made of. */
const facing = () => vectorFromAngle(n(1), heading.of(thisActor()));

turns.step('go the way it is facing', 'decide', [
  note('ALONG the heading only, leaving the speed across it alone — see the'),
  note('header. Whatever gravity has built up downwards is not this rule’s'),
  note('to throw away, and throwing it away is a fall of a quarter of a'),
  note('pixel a frame that reads as a slow leak rather than as a bug.'),
  note('The part of the current speed that is along the heading…'),
  alongNow.set(
    add(
      times(axisOf('x', velocity.of(thisActor())), axisOf('x', facing())),
      times(axisOf('y', velocity.of(thisActor())), axisOf('y', facing())),
    ),
  ),
  note('…taken out of it, and the asked-for speed put in its place.'),
  velocity.set(
    thisActor(),
    vectorPlus(
      vectorMinus(
        velocity.of(thisActor()),
        vectorTimes(facing(), alongNow.get()),
      ),
      vectorTimes(facing(), speed.of(thisActor())),
    ),
  ),
  note('The drawing, if it was asked for. Here rather than after the turn'),
  note('so that the picture and the movement are the same frame’s: a nose'),
  note('that points where the actor went LAST frame is a nose that lags'),
  note('visibly at every corner.'),
  when([
    [
      points.of(thisActor()),
      [rotation.set(thisActor(), heading.of(thisActor()))],
    ],
  ]),
  note('…and where it is starting from, for the other end of the frame to'),
  note('subtract.'),
  wasAt.set(thisActor(), position.x(thisActor()), position.y(thisActor())),
]);

const got = rule.local('got', 'Number');
const asked = rule.local('asked', 'Number');

turns.step('turn if it got nowhere', 'react', [
  note('How far along its heading did it actually travel? The movement,'),
  note('projected on to the direction it meant to go — so a ball dragged'),
  note('sideways by a belt, or dropped by gravity, is not credited with'),
  note('progress it did not make and not blamed for it either.'),
  got.set(
    add(
      times(
        minus(position.x(thisActor()), wasAt.x(thisActor())),
        axisOf('x', facing()),
      ),
      times(
        minus(position.y(thisActor()), wasAt.y(thisActor())),
        axisOf('y', facing()),
      ),
    ),
  ),
  asked.set(times(times(speed.of(thisActor()), pixelsPerUnit()), frameTime())),
  note('HALF, not all of it. A body Solid has pushed part of the way out of'),
  note('a wall has travelled a little, and a body sliding along a slope'),
  note('travels less than it asked for without being stopped by anything.'),
  note('Nothing turns on the first frame: `measured` is false until the'),
  note('other step has run once, and the distance from the origin is not a'),
  note('distance anything travelled.'),
  when([
    [
      measured.of(thisActor()),
      [
        when([
          [
            lessThan(got.get(), times(asked.get(), n(0.5))),
            [
              note('Modulo 360 so a heading stays a number a person can'),
              note('read in the inspector rather than growing for ever.'),
              heading.set(
                thisActor(),
                remainder(
                  add(
                    add(heading.of(thisActor()), turnBy.of(thisActor())),
                    n(360),
                  ),
                  n(360),
                ),
              ),
              turned({}, thisActor()),
            ],
          ],
        ]),
      ],
    ],
  ]),
  measured.set(thisActor(), yes()),
]);

export default () => moduleFor(rule, 'turning');
