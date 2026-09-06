import {Positional, position, setPosition} from './builtins.mjs';
import {CanCollide, contacts} from './collisions.mjs';
import {
  add,
  axisOf,
  both,
  defineRule,
  doc,
  filter,
  forEach,
  hasTrait,
  minus,
  moduleFor,
  moreThan,
  not,
  note,
  thisActor,
  vector,
  when,
  yes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Carrying',
  ability: 'Carries Riders',
  header: `// "Carries Riders" — the moving platform.
//
// Solid Bodies stops a body ending up inside a solid one, and Gravity rests a
// faller on whatever it landed on. Between them a platform holds a player up
// perfectly and slides out from under them, because neither rule ever says the
// platform is GOING anywhere. Standing on something that moves is being moved
// by it, and until this rule there was nothing in the library that said so.
//
// TWO TRAITS, and which actor takes which is the whole design. "Carries" is the
// platform: it is the thing that moves and the thing that knows how far.
// "Rides" is whatever should go along with it — a player, a crate, an enemy —
// and it names no platform, so a rider carried by one lift is carried by the
// next without being told about it.
//
// IT MEASURES RATHER THAN ASKING. A platform can be moved by anything: a
// velocity from Patrol, a tween, a handler that sets its position on a
// keypress. Reading its velocity would carry the first and silently drop the
// other two — a rider that works until the day somebody animates the lift. So
// a carrier remembers where it was and subtracts: whatever moved it, the
// difference is the same.
//
// The measurement is a frame behind, and that is a decision rather than an
// oversight. The carrier measures in \`decide\`, at the top of the frame, so what
// it reports is how far it moved during the PREVIOUS one; the rider adds that
// in \`adjust\`, after its own move and before anything works out what is
// touching what. Measuring later would mean the two steps shared a moment, and
// steps in a moment are unordered — the rider would sometimes read this frame's
// movement and sometimes the last one, which is a platform that judders for
// reasons nobody can see. What being a frame late costs is exactly one frame of
// the platform's travel — a pixel at the speed Patrol walks one — and it costs
// the same every frame rather than accumulating, so a rider sits a hair behind
// the floor it is on and never falls further behind.
//
// RIDING HAPPENS IN \`adjust\`, one moment before \`touch\`, so a rider pushed into
// a wall by the platform it is standing on is pushed back out in the same frame
// by Solid Bodies. In \`react\` — after the pushing — it would spend a frame
// inside the wall.
//
// WHAT COUNTS AS STANDING ON IT is deliberately the simplest thing that is
// true: something this actor is touching, that carries, and whose middle is
// below its own. Gravity asks a harder question (\`is resting on\`) because it
// has to decide where to PUT a lander; this only has to decide whose movement
// to copy, and a rider is already touching the thing by the time this runs.`,
});
rule.uses('Collisions');

// ── The platform ─────────────────────────────────────────────────────────────

const carries = rule.trait('Carries');
carries.uses(Positional);
// Collidable, because "standing on it" is answered from the rider's contacts,
// and a platform nothing can touch is a platform nobody can stand on.
carries.uses(CanCollide);

/**
 * How far this platform moved during the last frame.
 *
 * A vector rather than a point: it is a displacement, which is the difference
 * between two places rather than a place of its own. Read-only — a project that
 * set it would be lying to its riders about where the floor went.
 */
const movedBy = carries.vector('moved by', {x: 0, y: 0}, {readonly: true});

/** Where it was when the last frame started. Read-only for the same reason. */
const wasAt = carries.point('was at', {x: 0, y: 0}, {readonly: true});

/**
 * Whether `was at` has ever been filled in.
 *
 * Without it the first frame reports a movement of the whole distance from the
 * origin — a platform at (300, 200) would fling every rider three hundred
 * pixels sideways on the frame the world started. There is no position that
 * could stand for "not yet", because every position is a place a platform might
 * really be, so this is the extra bit that says so.
 */
const measured = carries.boolean('measured', 'false', {readonly: true});

carries.step('measure the carry', 'decide', [
  doc(
    'How far did I move last frame? Wherever I am now, less where I was. On the very first frame there is no "where I was", so start from here and report no movement — see the header.',
  ),
  when([
    [
      not(measured.of(thisActor())),
      [
        wasAt.set(
          thisActor(),
          position.x(thisActor()),
          position.y(thisActor()),
        ),
        measured.set(thisActor(), yes()),
      ],
    ],
  ]),
  movedBy.set(
    thisActor(),
    vector(
      minus(position.x(thisActor()), wasAt.x(thisActor())),
      minus(position.y(thisActor()), wasAt.y(thisActor())),
    ),
  ),
  note('And remember where I am, for the next frame to subtract from.'),
  wasAt.set(thisActor(), position.x(thisActor()), position.y(thisActor())),
]);

// ── The rider ────────────────────────────────────────────────────────────────

const rides = rule.trait('Rides');
rides.uses(Positional);
// The contacts this reads are Collisions' own, so a rider has to be the sort of
// thing that has them.
rides.uses(CanCollide);

const floor = rule.local('floor', 'Actor');

rides.step('ride along', 'adjust', [
  doc(
    'What am I standing on? Something I am touching, that carries, and whose middle is below mine. Collisions already worked out what I am touching, so this looks at those and not at everything.',
  ),
  forEach(floor, {
    from: filter(floor, {
      from: contacts.of(thisActor()),
      where: both(
        hasTrait(floor.get(), rule.traitRef('Carries')),
        moreThan(position.y(floor.get()), position.y(thisActor())),
      ),
    }),
    body: [
      note('Go wherever it went. Not where it IS — a rider is not attached to'),
      note(
        'a platform, it is standing on one, and it may walk about up there.',
      ),
      setPosition(
        thisActor(),
        add(position.x(thisActor()), axisOf('x', movedBy.of(floor.get()))),
        add(position.y(thisActor()), axisOf('y', movedBy.of(floor.get()))),
      ),
    ],
  }),
]);

export const Carries = rule.traitRef('Carries');
export const Rides = rule.traitRef('Rides');

export default () => moduleFor(rule, 'carry');
