import {position, rotation} from './builtins.mjs';
import {CanCollide} from './collisions.mjs';
import {
  absolute,
  add,
  axisOf,
  both,
  either,
  defineRule,
  doc,
  frameTime,
  lessThan,
  minus,
  moreThan,
  moduleFor,
  n,
  not,
  note,
  pick,
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
import {CanMove, held, positionBefore, velocity} from './motion.mjs';

const rule = defineRule({
  name: 'Turning',
  ability: 'Turns at Walls',
  header: `// "Turns at Walls" — the enemy that needs no brain at all.
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
 * Whether it reflects off what stopped it instead of turning by a fixed amount.
 *
 * `turn by` is a number and a mirror is not one, which is why this is a switch
 * rather than another value for that dial. What it buys is the one enemy the
 * fixed turn cannot make: a thing that comes off a wall the way a ball does,
 * at the angle it arrived, so that its path is a fact about the room's shape
 * rather than about its own number (JETPACK.md, phase seven's shuriken).
 *
 * WHICH WALL IT WAS is worked out from the movement rather than from the wall,
 * and that is the whole trick — the same trick this rule already plays to
 * notice a wall at all. A body stopped by something upright got nowhere ACROSS
 * and somewhere down; one stopped by a floor got nowhere down and somewhere
 * across. So the axis that failed names the mirror: across flips the heading
 * about the vertical, down flips it about the horizontal, and both at once is
 * a corner, which is the reversal `turn by 180` would have given anyway.
 */
const mirrors = turns.boolean('bounces off what stops it', 'false');
/**
 * Whether Physics has seen this body yet.
 *
 * How this rule notices a wall is to compare where the body ended up against
 * `position before` — where Physics saw it at the top of the frame — and that
 * record is only written for bodies present when the frame began. A body added
 * in the middle of one reads the default place, the origin, until the next
 * frame starts; and every position is somewhere an actor might really be, so
 * there is no value the record could hold that would mean "not yet". Hence a
 * bit that does mean it.
 *
 * Without it such a body measures its distance from the origin, which is not a
 * distance it travelled, and turns on the frame it appears.
 *
 * This rule kept its own copy of the starting place until Physics recorded
 * one. The copy is gone; the bit is what was never about the position.
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
  doc(
    'ALONG the heading only, leaving the speed across it alone — see the header. Whatever gravity has built up downwards is not this rule’s to throw away, and throwing it away is a fall of a quarter of a pixel a frame that reads as a slow leak rather than as a bug. The part of the current speed that is along the heading…',
  ),
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
  doc(
    'The drawing, if it was asked for. Here rather than after the turn so that the picture and the movement are the same frame’s: a nose that points where the actor went LAST frame is a nose that lags visibly at every corner.',
  ),
  when([
    [
      points.of(thisActor()),
      [rotation.set(thisActor(), heading.of(thisActor()))],
    ],
  ]),
]);

const got = rule.local('got', 'Number');
const asked = rule.local('asked', 'Number');
/** Per axis, for the mirror: what it asked for and what it got. */
const askedX = rule.local('askedX', 'Number');
const askedY = rule.local('askedY', 'Number');
const stuckX = rule.local('stuckX', 'Boolean');
const stuckY = rule.local('stuckY', 'Boolean');
const turnedTo = rule.local('turnedTo', 'Number');

turns.step('turn if it got nowhere', 'react', [
  doc(
    'How far along its heading did it actually travel? The movement, projected on to the direction it meant to go — so a ball dragged sideways by a belt, or dropped by gravity, is not credited with progress it did not make and not blamed for it either.',
  ),
  got.set(
    add(
      times(
        minus(position.x(thisActor()), positionBefore.x(thisActor())),
        axisOf('x', facing()),
      ),
      times(
        minus(position.y(thisActor()), positionBefore.y(thisActor())),
        axisOf('y', facing()),
      ),
    ),
  ),
  asked.set(times(times(speed.of(thisActor()), pixelsPerUnit()), frameTime())),
  doc(
    'HALF, not all of it. A body Solid has pushed part of the way out of a wall has travelled a little, and a body sliding along a slope travels less than it asked for without being stopped by anything. Nothing turns on the first frame: `measured` is false until the other step has run once, and the distance from the origin is not a distance anything travelled. A body somebody is holding is not a body that was stopped — see `held still` in Physics. Without this a ball waiting out a teleport turns round every frame it waits.',
  ),
  when([
    [
      both(measured.of(thisActor()), not(held.of(thisActor()))),
      [
        doc(
          'WHICH WAY IT WOULD HAVE GONE, per axis, so that a mirror knows which wall it met — see `bounces off what stops it`. Worked out from the movement rather than from the wall, which is the same trick that notices a wall at all.',
        ),
        askedX.set(times(axisOf('x', facing()), asked.get())),
        askedY.set(times(axisOf('y', facing()), asked.get())),
        stuckX.set(
          both(
            moreThan(absolute(askedX.get()), n(0.01)),
            lessThan(
              absolute(
                minus(position.x(thisActor()), positionBefore.x(thisActor())),
              ),
              times(absolute(askedX.get()), n(0.5)),
            ),
          ),
        ),
        stuckY.set(
          both(
            moreThan(absolute(askedY.get()), n(0.01)),
            lessThan(
              absolute(
                minus(position.y(thisActor()), positionBefore.y(thisActor())),
              ),
              times(absolute(askedY.get()), n(0.5)),
            ),
          ),
        ),
        doc(
          'A MIRROR ASKS PER AXIS AND A TURN ASKS ALONG THE HEADING, and they are different questions. Something crossing a floor at forty-five degrees still makes seven tenths of the progress it asked for, so the along-heading test never fires and the shuriken slides along the floor for ever instead of coming off it. What stopped it is exactly the axis that failed.',
        ),
        when([
          [
            pick(
              mirrors.of(thisActor()),
              either(stuckX.get(), stuckY.get()),
              lessThan(got.get(), times(asked.get(), n(0.5))),
            ),
            [
              doc(
                'A fixed turn, or a reflection: across the vertical when something upright stopped it, across the horizontal when a floor did, and a reversal in a corner — which is what the fixed turn would have said there anyway.',
              ),
              turnedTo.set(
                pick(
                  not(mirrors.of(thisActor())),
                  add(heading.of(thisActor()), turnBy.of(thisActor())),
                  pick(
                    both(stuckX.get(), stuckY.get()),
                    add(heading.of(thisActor()), n(180)),
                    pick(
                      stuckX.get(),
                      minus(n(180), heading.of(thisActor())),
                      pick(
                        stuckY.get(),
                        times(heading.of(thisActor()), n(-1)),
                        add(heading.of(thisActor()), n(180)),
                      ),
                    ),
                  ),
                ),
              ),
              doc(
                'Modulo 360 so a heading stays a number a person can read in the inspector rather than growing for ever — and plus 360 first, because a mirror can make it negative.',
              ),
              heading.set(
                thisActor(),
                remainder(add(turnedTo.get(), n(360)), n(360)),
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
