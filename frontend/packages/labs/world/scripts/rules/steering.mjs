import {CanMove, position, velocity} from './builtins.mjs';
import {
  add,
  anyOf,
  axisOf,
  both,
  defineRule,
  give,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  note,
  param,
  pick,
  power,
  root,
  times,
  thisActor,
  vector,
  vectorOver,
  vectorTimes,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Steering',
  ability: 'Chases and Flees',
  header: `// "Chases and Flees" — an actor that goes after another one.
//
// Nothing in the library made an actor BEHAVE. Every other rule is about what
// happens to a thing — it falls, it bumps, it is carried by the arrow keys —
// and an enemy that follows the player had to be written by hand, per frame, in
// the learner's own blocks. This is the smallest rule that changes that.
//
// The camera has had this since it existed ("Follows an Actor", with easing and
// a deadzone beside it). This is the same idea one level down, and the same
// shape: a property naming what to follow, a step that reads it, and nothing
// clever in between.
//
// TWO abilities, because chasing and fleeing want different numbers. A chaser
// stops when it is close enough; a fleer only runs when the thing is too near.
// The same actor may elect both — a wolf that hunts the sheep and runs from the
// farmer — and the two steps compose the way any two do, which is to say the
// last one to run wins the frame. That is worth knowing and is not worth
// preventing: an actor told to do two contradictory things is a thing a learner
// can see and fix.
//
// IT SETS VELOCITY, so it composes with everything Physics already does —
// solid bodies stop a chaser at a wall, drag slows it, and \`position before\`
// still means what it meant. It does not move anything itself.
//
// \`chases up and down\` is what lets one rule serve two genres. In a top-down
// game a chaser should move on both axes; in a platformer it should walk toward
// you and let gravity own the vertical, which is exactly what Arrow Keys does
// ("we only set sideways speed — up and down belongs to gravity"). Turning it
// off leaves the vertical alone.
//
// WHAT IS NOT HERE, and why: \`turn to face ⟨actor⟩\`. Rotation is a number of
// degrees and the direction to a point is an arctangent, and the block language
// has no arctangent — no angle-of-a-vector block of any kind. It is a small gap
// with a wide reach (aiming, thrust, look-at) and it belongs in the maths
// blocks rather than in this rule.`,
});
rule.uses('Physics');

const chases = rule.trait('Chases');
chases.uses(CanMove);
const flees = rule.trait('Flees');
flees.uses(CanMove);

export const Chases = rule.traitRef('Chases');
export const Flees = rule.traitRef('Flees');

/**
 * How far apart two actors are, in pixels.
 *
 * Here rather than in the maths blocks because steering is what wants it, and
 * because it had nowhere else to live: the language could ask for "the actor
 * with the least ⟨something⟩" and had no way to say the something a game
 * actually sorts by (specs/ACTOR_LISTS.md). `the actor ⟨e⟩ in ⟨any Enemy⟩ with
 * the least ⟨distance from ⟨this actor⟩ to ⟨e⟩⟩` is the sentence this makes
 * possible, and it is the one every game with an enemy wants first.
 *
 * PIXELS, like every other length here — positions are pixels and speeds are
 * units (engine/core/units), and a distance is a position thing.
 */
const distance = rule.block({
  returns: 'number',
  description: 'How far apart two actors are, in pixels.',
  say: ['distance from', param('a', 'actor'), 'to', param('b', 'actor')],
  body: ({a, b}) => [
    note('Pythagoras: the long side of the triangle between them.'),
    give(
      root(
        add(
          power(minus(position.x(b.get()), position.x(a.get())), n(2)),
          power(minus(position.y(b.get()), position.y(a.get())), n(2)),
        ),
      ),
    ),
  ],
});

/** Who to go after. Empty until something says, which is the usual first frame. */
const quarry = chases.actor('actor to chase');
/** How fast, in units per second — `1.5` is a brisk walk. */
const chaseSpeed = chases.number('chase speed', 1.5);
/**
 * How close is close enough, in pixels.
 *
 * Zero means "stand on top of it", which is what a homing missile wants and
 * what a wolf does not: a chaser with no gap jitters on the spot, overshooting
 * and turning round every frame. Anything with a body wants a gap about as big
 * as the two bodies.
 */
const keepAway = chases.number('keep distance', 0);
/**
 * Whether to chase vertically as well as sideways.
 *
 * On for a top-down game. OFF for a platformer, where walking toward the player
 * and letting gravity own the vertical is the whole of what a ground enemy
 * does — and setting the vertical would be a chaser that flies.
 */
const chaseBothWays = chases.boolean('chases up and down', true);

/** Who to run from. */
const threat = flees.actor('actor to avoid');
/** How fast, in units per second. */
const fleeSpeed = flees.number('flee speed', 1.5);
/**
 * How close is too close, in pixels.
 *
 * A fleer that always ran would leave the level. This is the range it notices
 * the threat at; outside it, it does nothing and whatever else moves it can.
 */
const safeDistance = flees.number('safe distance', 200);

/**
 * The vertical this chaser should take, given the one it is heading with.
 *
 * The whole of `chases up and down` in one expression: take the heading's
 * vertical when it chases that way, and otherwise leave whatever the actor
 * already had — which is gravity's, and is why a ground enemy walks instead of
 * flying at you.
 */
const verticalOf = (heading_, who) =>
  pick(
    chaseBothWays.of(who),
    axisOf('y', heading_),
    axisOf('y', velocity.of(who)),
  );

const gap = rule.local('gap', 'Number');
const heading = rule.local('heading', 'Vector');

/**
 * The unit vector from `here` to `there`, given the distance between them.
 *
 * The distance is passed in rather than measured again: the callers have it
 * already, and it is the one number that must not be recomputed, since dividing
 * by a DIFFERENT measurement than the one that was tested for zero is how a
 * step ends up dividing by zero.
 */
const towards = rule.block({
  returns: 'vector',
  description: 'A one-pixel step from the first actor toward the second.',
  say: [
    'from',
    param('here', 'actor'),
    'toward',
    param('there', 'actor'),
    'over',
    param('apart', 'number'),
  ],
  body: ({here, there, apart}) => [
    give(
      vectorOver(
        vector(
          minus(position.x(there.get()), position.x(here.get())),
          minus(position.y(there.get()), position.y(here.get())),
        ),
        apart.get(),
      ),
    ),
  ],
});

chases.step('chase', 'push', [
  note('Nothing to chase is the state every chaser starts in.'),
  when([
    [
      anyOf(quarry.of(thisActor())),
      [
        gap.set(distance({a: thisActor(), b: quarry.of(thisActor())})),
        when(
          [
            [
              moreThan(gap.get(), keepAway.of(thisActor())),
              [
                note('Head for it at the chase speed.'),
                heading.set(
                  vectorTimes(
                    towards({
                      here: thisActor(),
                      there: quarry.of(thisActor()),
                      apart: gap.get(),
                    }),
                    chaseSpeed.of(thisActor()),
                  ),
                ),
                note('Sideways always; up and down only if it is that kind of'),
                note('chaser — otherwise the vertical is gravity’s.'),
                velocity.set(
                  thisActor(),
                  vector(
                    axisOf('x', heading.get()),
                    verticalOf(heading.get(), thisActor()),
                  ),
                ),
              ],
            ],
          ],
          [
            note('Close enough. Stop, rather than jitter on the spot.'),
            velocity.set(
              thisActor(),
              vector(n(0), verticalOf(vector(n(0), n(0)), thisActor())),
            ),
          ],
        ),
      ],
    ],
  ]),
]);

flees.step('flee', 'push', [
  when([
    [
      anyOf(threat.of(thisActor())),
      [
        gap.set(distance({a: thisActor(), b: threat.of(thisActor())})),
        note('Only when it is too near, and never when it is exactly here:'),
        note('there is no direction to run in from a distance of nothing.'),
        when([
          [
            both(
              lessThan(gap.get(), safeDistance.of(thisActor())),
              moreThan(gap.get(), n(0)),
            ),
            [
              heading.set(
                vectorTimes(
                  towards({
                    here: thisActor(),
                    there: threat.of(thisActor()),
                    apart: gap.get(),
                  }),
                  times(fleeSpeed.of(thisActor()), n(-1)),
                ),
              ),
              velocity.set(thisActor(), heading.get()),
            ],
          ],
        ]),
      ],
    ],
  ]),
]);

export default () => moduleFor(rule, 'steering');
