import {position, setPosition} from './builtins.mjs';
import {CanCollide, contacts} from './collisions.mjs';
import {
  axisOf,
  add,
  defineRule,
  doc,
  equals,
  filter,
  forEach,
  frameTime,
  hasTrait,
  moduleFor,
  moreThan,
  n,
  no,
  not,
  note,
  pixelsPerUnit,
  thisActor,
  times,
  vector,
  when,
  yes,
} from './dsl.mjs';
import {CanMove, velocity} from './motion.mjs';

const rule = defineRule({
  name: 'Surfaces',
  ability: 'Has Special Floors',
  purpose: `**Surfaces** is floors that do something to you.

A floor in this library holds you up and nothing else, and a platformer is
built out of several: a belt that carries you along, ice you cannot stop on,
sludge that drags.

Give a tile **Conveys**, **Slippery** or **Slows**, and anything that should
notice them **Stands on Surfaces**.`,
  header: `// "Has Special Floors" — three kinds of floor that do something to you.
//
// A floor in this library holds you up and nothing else. That is one floor,
// and a platformer is built out of several: a belt that carries you along, ice
// you cannot stop on, sludge that drags. Each is a different thing for a TILE
// to be, and none of them is a different thing for a PLAYER to be — which is
// why this is one rule with three tile traits and one walker trait rather than
// three rules.
//
//     Conveys     moves whoever stands on it along, like a floor going somewhere
//     Slippery    holds you at the speed you arrived at
//     Slows       keeps a fraction of the speed you asked for
//
// A tile takes one of the three (or none, and stays an ordinary floor); the
// walker takes "Stands on Surfaces" once and meets all of them.
//
// TWO OF THEM ARE ABOUT YOUR SPEED AND ONE IS ABOUT THE FLOOR'S, which is why
// there are two steps rather than one, and it took getting it wrong to see.
//
// Sludge and ice change a speed the walker chose, so they run in \`push\`, one
// moment after \`decide\`: Arrow Keys SETS the sideways speed rather than adding
// to it, so anything running before it is overwritten and lost, and running
// after is what having the last word means.
//
// A BELT IS NOT A SPEED YOU HAVE, it is a floor going somewhere underneath
// you, and the difference is not a nicety. Written as "add the belt's speed to
// the walker's" it worked — for a walker with Arrow Keys, whose velocity is
// wiped and rewritten every frame. Give the same belt an actor without arrows
// and the addition has nothing to reset it: two units a frame, forever, and
// the actor leaves the level at a speed no belt ever had.
//
// So the belt moves the POSITION, in \`adjust\`, which is exactly what
// \`Carrying\` does with a moving platform and for exactly the same reason —
// standing on something that moves is being moved by it. It composes with
// anything, needs nothing from the walker, and cannot accumulate.
//
// EACH KIND ACTS ONCE, however many tiles of it are underfoot, and that is not
// an optimisation either. A floor is made of tiles and a walker is a tile
// wide, so standing anywhere but exactly on a seam means touching two of them
// — and a belt applied once per tile carries a player at double speed on the
// seams and single speed between, which reads as a belt that stutters. So each
// step gathers what the floor SAYS and acts once, outside the loop.
//
// ICE IS THE ONE WITH MEMORY, and it has to be. "You cannot stop or change
// direction" is a statement about a speed the player is no longer choosing, so
// the speed has to be kept from the frame they last chose it: stepping on to
// ice records what they were doing and every frame after that repeats it.
//
// EXCEPT AT A STANDSTILL, which is the one case worth spelling out. A walker
// that arrives on ice at rest has given it nothing to carry, and a floor
// cannot invent a direction — so ice goes on listening until it is given one,
// and locks on the first frame there is something to lock. Otherwise a player
// who stopped moving in the instant they stepped on would be stuck to it for
// the rest of the level, which reads as the game having broken rather than as
// a floor being slippery.
//
// AND THE MEMORY IS FORGOTTEN ON THE WAY OUT, which is the half that was
// missing. "Take the speed when you arrive" was written as "take it when there
// is no speed recorded yet", and those are the same sentence exactly once: the
// first patch of ice a walker ever touches. Every patch after that still held
// the number from the first, so a player who slid right across one patch was
// still sliding right on the next one however they came on to it — walking
// left, jumping on from the right, it made no difference. It reads as ice that
// has decided which way you are going, which is the opposite of the rule.
//
// JUMPING STILL WORKS on all three, because none of them touches the vertical
// speed. That is not a concession; it is what makes ice playable.
//
// WHAT COUNTS AS STANDING ON IT is the simplest thing that is true, and it is
// the same test \`Carrying\` makes: something this actor is touching whose middle
// is below its own. Gravity asks a harder question because it has to decide
// where to PUT a lander; this only has to decide whose opinion to take.`,
});
rule.uses('Physics');
rule.uses('Collisions');

// ── The three floors ─────────────────────────────────────────────────────────

const conveys = rule.trait('Conveys');
conveys.uses(CanCollide);
/**
 * Units a second, signed: positive carries to the right.
 *
 * The floor's own speed, not the walker's, so walking against a belt is slow
 * and walking with it is fast without either number knowing about the other —
 * which is what a belt is. Two, against the standard walk of 1.5, means a
 * player who stops on one is carried away and a player who fights it makes
 * headway. Faster than a walk would be a belt nobody can cross.
 */
const beltSpeed = conveys.number('belt speed', 2);

/**
 * Ice: what you cannot stop on.
 *
 * No properties at all. Everything about how fast you go on ice is a fact
 * about YOU — it is the speed you arrived with — so there is nothing for the
 * tile to carry, and a `slipperiness` number would be a dial with no
 * behavior behind it.
 */
const slippery = rule.trait('Slippery');
slippery.uses(CanCollide);

const slows = rule.trait('Slows');
slows.uses(CanCollide);
/**
 * The fraction of the walker's own speed that survives, per frame.
 *
 * A multiplier rather than a subtraction, because a subtraction has to decide
 * what to do when it would push a slow walker backwards. Two fifths is
 * noticeably wading and still crossable; zero would be a wall drawn as a
 * floor.
 */
const slowedTo = slows.number('slowed to', 0.4);

export const Conveys = rule.traitRef('Conveys');
export const Slippery = rule.traitRef('Slippery');
export const Slows = rule.traitRef('Slows');

// ── The walker ───────────────────────────────────────────────────────────────

const stands = rule.trait('Stands on Surfaces');
stands.uses(CanMove);
stands.uses(CanCollide);

/**
 * Whether this actor is currently being carried by ice.
 *
 * Read-only, and the only bookkeeping in the rule: it is what tells arriving
 * on ice from being on it, which is when the speed is taken.
 */
const sliding = stands.boolean('sliding', 'false', {readonly: true});
/**
 * …and the speed it arrived at, which is what every frame after repeats.
 *
 * Cleared on the way off, so that the next patch of ice reads the walker
 * rather than the last patch. Zero doubles as "nothing recorded", which is
 * what lets a walker that arrived at a standstill go on listening — see the
 * header on both.
 */
const slideSpeed = stands.number('slide speed', 0, {readonly: true});

export const StandsOnSurfaces = rule.traitRef('Stands on Surfaces');

/** Raised on the frame a walker steps on to ice — not every frame it is on it. */
const startedSliding = stands.event(['starts sliding']);
/** …and on the frame it steps off. */
const stoppedSliding = stands.event(['stops sliding']);

const floor = rule.local('floor', 'Actor');
/** What the floor said, gathered before any of it is acted on. */
const belt = rule.local('belt', 'Number');
const drag = rule.local('drag', 'Number');
const onIce = rule.local('onIce', 'Boolean');

/**
 * The floors under this actor: something it is touching whose middle is below
 * its own. Both steps ask it, so it is written once.
 */
const standingOn = () =>
  filter(floor, {
    from: contacts.of(thisActor()),
    where: moreThan(position.y(floor.get()), position.y(thisActor())),
  });

/** Set this actor's sideways speed, leaving the vertical one alone. */
const setAcross = across =>
  velocity.set(
    thisActor(),
    vector(across, axisOf('y', velocity.of(thisActor()))),
  );

stands.step('read the floor', 'push', [
  note('Nothing said yet: no drag, no ice.'),
  drag.set(n(1)),
  onIce.set(no()),
  doc(
    'What am I standing on? Something I am touching whose middle is below mine — the same test Carrying makes, and for the same reason. This only GATHERS: see the header on why acting here would double a floor.',
  ),
  forEach(floor, {
    from: standingOn(),
    body: [
      when([
        [hasTrait(floor.get(), Slows), [drag.set(slowedTo.of(floor.get()))]],
      ]),
      when([[hasTrait(floor.get(), Slippery), [onIce.set(yes())]]]),
    ],
  }),
  doc(
    'Sludge MULTIPLIES, so it drags what you were doing rather than deciding for you — and is a no-op when no floor said anything.',
  ),
  setAcross(times(axisOf('x', velocity.of(thisActor())), drag.get())),
  when(
    [
      [
        onIce.get(),
        [
          doc(
            'Ice REPLACES, so it goes last. Arriving is when the speed is taken; after that the walker is no longer choosing it, which is the whole of what ice means.',
          ),
          when([
            [
              not(sliding.of(thisActor())),
              [
                sliding.set(thisActor(), yes()),
                doc(
                  'The speed it came on with, taken HERE — on the frame it arrived — rather than inferred later from there being none recorded. See the header: those two are the same sentence only on the first patch of ice a walker ever touches.',
                ),
                slideSpeed.set(
                  thisActor(),
                  axisOf('x', velocity.of(thisActor())),
                ),
                startedSliding({}, thisActor()),
              ],
            ],
          ]),
          doc(
            '…and a standstill is not a direction, so a walker that arrived at rest is still listening. See the header: locking a zero would glue a player to the ice for good.',
          ),
          when([
            [
              equals(slideSpeed.of(thisActor()), n(0)),
              [
                slideSpeed.set(
                  thisActor(),
                  axisOf('x', velocity.of(thisActor())),
                ),
              ],
            ],
          ]),
          setAcross(slideSpeed.of(thisActor())),
        ],
      ],
    ],
    [
      doc(
        'Off the ice, and the walker has its own speed back — and the ice forgets, so the next patch reads the walker rather than this one.',
      ),
      when([
        [
          sliding.of(thisActor()),
          [
            sliding.set(thisActor(), no()),
            slideSpeed.set(thisActor(), n(0)),
            stoppedSliding({}, thisActor()),
          ],
        ],
      ]),
    ],
  ),
]);

stands.step('ride the belt', 'adjust', [
  doc(
    'A POSITION, not a speed — see the header. In `adjust`, one moment before anything works out what is touching what, so a walker a belt pushed into a wall is pushed back out in the same frame rather than spending one inside it. Carrying makes the same two choices.',
  ),
  belt.set(n(0)),
  forEach(floor, {
    from: standingOn(),
    body: [
      when([
        [hasTrait(floor.get(), Conveys), [belt.set(beltSpeed.of(floor.get()))]],
      ]),
    ],
  }),
  doc(
    'Units a second against a position in pixels, which is the one place the two meet.',
  ),
  setPosition(
    thisActor(),
    add(
      position.x(thisActor()),
      times(times(belt.get(), pixelsPerUnit()), frameTime()),
    ),
    position.y(thisActor()),
  ),
]);

export default () => moduleFor(rule, 'surfaces');
