import {position} from './builtins.mjs';
import {CanCollide} from './collisions.mjs';
import {
  add,
  axisOf,
  both,
  countOf,
  defineRule,
  doc,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  no,
  not,
  note,
  over,
  pick,
  thisActor,
  time,
  times,
  vector,
  vectorLength,
  vectorTimes,
  when,
  yes,
} from './dsl.mjs';
import {CanMove, velocity} from './motion.mjs';

const rule = defineRule({
  name: 'Flapping',
  ability: 'Flaps and Glides',
  purpose: `**Flapping** is the enemy that comes at you across the room.

A rolling ball and a climbing robot are things you learn and then avoid. This
one flies: it beats upward, glides down, and is never quite where you last saw
it — a different *shape* of enemy rather than a faster one.

Give an actor **Flaps and Glides**, and set how hard and how often it beats.`,
  header: `// "Flaps and Glides" — the enemy that is never where you last saw it.
//
// The other two enemies in the platformer are things you learn and then avoid:
// a ball rolls its floor, a robot takes the ladder you are on. Both of them are
// solvable, and a level made only of those is a level you eventually walk
// through. This is the one that comes at you across the room, and it is a
// different SHAPE of enemy rather than a faster one.
//
// It has two phases and they alternate:
//
//     the flaps   a few short flutters, each one upward and a little towards
//                 you. This is the only way it gains height, and it is slow.
//     the glide   two seconds in a straight line, aimed at where you were
//                 when it began, and always at least a little downwards.
//
// THE GLIDE COMMITS, and that is the whole design. It takes its aim once and
// then does not look again — so a player who moves while it is gliding is not
// where it is going, and the way past a bat is to wait for the glide and walk
// under it. A continuous chaser cannot be dodged like that: it re-aims every
// frame, so there is no moment at which moving is the right answer, and the
// only counter to one is being faster than it. That is the same argument
// \`Prowling\` makes about junctions, in the air rather than on the floor.
//
// THE FLAPS ARE WHY IT IS SLOW GOING UP. Height is bought a flutter at a time,
// and each flutter is smaller than the glide that follows it — so a bat below
// you takes a while to arrive, which is the time a player has to move.
//
// IT DOES NOT FALL, and that is not an oversight. Gravity would make the glide
// a parabola, which means the aim is a lie: the thing it was pointed at is not
// where it arrives. Worse, the arc's steepness would depend on how far away
// the player was, so the same enemy would read as a different one across the
// room from you. A straight line at a stated speed is a thing a player can
// learn in one viewing, and learning it is the point.
//
// A GLIDE IS ALWAYS AT LEAST A LITTLE DOWNWARDS, however high the quarry is.
// Otherwise a bat under a player on a ledge would glide UP at them, which is
// climbing without flapping — and then the flaps have no job and the two
// phases collapse into one chaser. \`least dive\` is what keeps them apart: the
// glide may aim almost flat, and never above flat, so a bat that wants height
// has to flap for it.
//
// WALLS ARE NOT THIS RULE'S BUSINESS. Something that can move and can collide
// is already pushed out of anything solid (\`rules/solid\`), and a body pushed
// out of a wall while still traveling along it slides — which is what
// JETPACK.md asks a bat to do at a wall, and it is had by electing nothing.`,
});
rule.uses('Physics');
rule.uses('Collisions');

const flaps = rule.trait('Flaps and Glides');
flaps.uses(CanMove);
flaps.uses(CanCollide);

export const FlapsAndGlides = rule.traitRef('Flaps and Glides');

/**
 * Who it is after.
 *
 * An actor rather than a kind, which is `Steering`'s shape and `Prowling`'s: a
 * project points it at `first actor in ⟨any Player⟩` and the bat never learns
 * the word "player".
 */
const quarry = flaps.actor('actor to hunt');

/** Units a second sideways during a flutter — a drift, not a chase. */
const flapAcross = flaps.number('flap speed', 0.8);
/** …and upward, which is the only way this actor ever gains height. */
const flapUp = flaps.number('flap lift', 1.6);
/** How many flutters between one glide and the next. */
const flapsBetween = flaps.number('flaps between glides', 3);
/** Seconds from one flutter to the next. */
const flapBeat = flaps.number('seconds between flaps', 0.35);

/** Units a second along the glide's line. */
const glideSpeed = flaps.number('glide speed', 1.1);
/** How long it commits to that line — see the header on why it commits. */
const glideSeconds = flaps.number('glide seconds', 2);
/**
 * The least downward part of a glide, as a fraction of its direction.
 *
 * Zero would let a glide aim exactly level, and a negative number would let it
 * aim upwards, which is the one thing that must not happen — see the header.
 * A sixth is a shallow descent: a bat aimed at something far above it still
 * makes ground towards it, and still has to flap for the height.
 */
const leastDive = flaps.number('least dive', 0.16);

/** Whether it is in the middle of a glide, rather than flapping. */
const gliding = flaps.boolean('gliding', 'false', {readonly: true});
/** How many flutters it has done since the last glide. */
const flapsDone = flaps.number('flaps done', 0, {readonly: true});
/**
 * The world time the current phase runs out at.
 *
 * Zero is the default and means "now", because the clock starts at zero —
 * which is what makes a fresh bat start flapping on its first frame without a
 * sentinel value standing for "has not begun".
 */
const until = flaps.number('phase ends at', 0, {readonly: true});

/** Raised on each flutter. */
const flapped = flaps.event(['flaps']);
/** …and once, at the top of each glide, which is the moment worth hearing. */
const glided = flaps.event(['starts gliding']);

const toward = rule.local('toward', 'Vector');
const span = rule.local('span', 'Number');
const aimX = rule.local('aimX', 'Number');
const aimY = rule.local('aimY', 'Number');
const aimed = rule.local('aimed', 'Vector');
const scale = rule.local('scale', 'Number');

flaps.step('flap or glide', 'decide', [
  doc(
    'Nothing to hunt, nothing to do — and the phase does not advance either, so a bat whose quarry is named a frame late begins its first flutter then rather than having spent it on nothing (`rules/prowling` makes the same argument about a junction).',
  ),
  when([
    [
      both(
        moreThan(countOf(quarry.of(thisActor())), n(0)),
        not(lessThan(time(), until.of(thisActor()))),
      ),
      [
        doc(
          'The vector to the quarry, in pixels, which both phases want: the flutter for its sign and the glide for its whole direction.',
        ),
        toward.set(
          vector(
            minus(position.x(quarry.of(thisActor())), position.x(thisActor())),
            minus(position.y(quarry.of(thisActor())), position.y(thisActor())),
          ),
        ),
        when(
          [
            [
              lessThan(flapsDone.of(thisActor()), flapsBetween.of(thisActor())),
              [
                doc(
                  'A FLUTTER. Upward always — see the header: this is the only way it climbs, and a flap that could point down would leave the glide with nothing to be different from. Sideways is a drift towards the quarry rather than a chase, so the flapping phase is when a player has time to move.',
                ),
                velocity.set(
                  thisActor(),
                  vector(
                    pick(
                      moreThan(axisOf('x', toward.get()), n(0)),
                      flapAcross.of(thisActor()),
                      times(flapAcross.of(thisActor()), n(-1)),
                    ),
                    times(flapUp.of(thisActor()), n(-1)),
                  ),
                ),
                flapsDone.set(
                  thisActor(),
                  add(flapsDone.of(thisActor()), n(1)),
                ),
                until.set(thisActor(), add(time(), flapBeat.of(thisActor()))),
                gliding.set(thisActor(), no()),
                flapped({}, thisActor()),
              ],
            ],
          ],
          [
            doc(
              'A GLIDE: aimed once, at where the quarry is NOW, and then not looked at again for two seconds. See the header — that commitment is the whole of what makes this dodgeable.',
            ),
            span.set(vectorLength(toward.get())),
            doc(
              'The direction, as a unit vector. A span of zero means the two are exactly on top of each other, which is a division nobody wants the answer to; one stands in for it and the dive below then decides the whole direction.',
            ),
            scale.set(pick(moreThan(span.get(), n(0)), span.get(), n(1))),
            aimX.set(over(axisOf('x', toward.get()), scale.get())),
            aimY.set(over(axisOf('y', toward.get()), scale.get())),
            note('…and never above flat. Down is positive y.'),
            aimed.set(
              vector(
                aimX.get(),
                pick(
                  moreThan(aimY.get(), leastDive.of(thisActor())),
                  aimY.get(),
                  leastDive.of(thisActor()),
                ),
              ),
            ),
            doc(
              'Clamping the dive lengthened the direction, so it is made a unit again before the speed is applied — otherwise a bat aiming at something level with it would glide faster than one aiming down, which is a speed nobody set.',
            ),
            scale.set(
              over(
                glideSpeed.of(thisActor()),
                pick(
                  moreThan(vectorLength(aimed.get()), n(0)),
                  vectorLength(aimed.get()),
                  n(1),
                ),
              ),
            ),
            velocity.set(
              thisActor(),
              vectorTimes(aimed.get(), vector(scale.get(), scale.get())),
            ),
            note('…and the flutters are charged up again for afterwards.'),
            flapsDone.set(thisActor(), n(0)),
            until.set(thisActor(), add(time(), glideSeconds.of(thisActor()))),
            gliding.set(thisActor(), yes()),
            glided({}, thisActor()),
          ],
        ),
      ],
    ],
  ]),
]);

export default () => moduleFor(rule, 'flapping');
