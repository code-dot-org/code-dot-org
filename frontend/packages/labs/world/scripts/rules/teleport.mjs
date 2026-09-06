import {position, setPosition} from './builtins.mjs';
import {CanCollide, collisionSizeOf, contacts} from './collisions.mjs';
import {
  absolute,
  add,
  allWithTrait,
  anyActor,
  axisOf,
  both,
  countOf,
  defineRule,
  doc,
  equals,
  filter,
  firstActor,
  hasTrait,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  no,
  not,
  over,
  sameActor,
  thisActor,
  time,
  vector,
  when,
  yes,
} from './dsl.mjs';
import {HasHealth, staySafe} from './health.mjs';
import {CanMove, held, placed, velocity} from './motion.mjs';

const rule = defineRule({
  name: 'Teleport',
  ability: 'Has Teleport Pads',
  purpose: `**Teleport** is a way across a room that is not a way through it.

Every other way of getting somewhere here is continuous — you walk, you fall,
you climb. A pad breaks that: two pads of the same colour are one place,
however far apart they are.

Give pads **Is a Teleport Pad** and travellers **Uses Teleport Pads**.`,
  header: `// "Has Teleport Pads" — a way across a room that is not a way through it.
//
// Every other way of getting somewhere in this library is CONTINUOUS: you walk,
// you fall, you climb, you fly. A room built out of those is a room whose shape
// is its difficulty, and a level designer's only lever is the distance between
// things. A pad breaks that. Two pads of the same colour are one place, however
// far apart they are drawn, and a room can be folded.
//
// THE COLOUR IS THE LINK, and it is a colour rather than a number or a name
// because it is a thing the PLAYER has to read at a glance from across the
// room. \`pad colour\` is a real colour: its socket takes a swatch and the map
// editor draws a picker, so a level author paints the network rather than
// remembering that channel two is the blue one.
//
// ANOTHER PAD, NOT THIS ONE, and picked afresh every time — which is what
// \`any actor in ⟨…⟩\` is for, and writing this rule is what found that gap.
// The language could say "the first actor in" and could not say "one of them":
// three red pads with \`first\` in them are two pads and a decoration, because
// the answer never changes. With one pad of a colour there is nowhere to go and
// nothing happens, which is the right answer rather than a special case.
//
// IT TAKES TIME, and the time is the point. An instant swap reads as a glitch —
// the eye does not accept that the thing on the left and the thing on the right
// are the same thing — so a traveller stops where it is, waits, and arrives.
// That gap is somewhere for an animation to go (\`starts travelling\` says when),
// and it is also what makes the trip fair: a body held still on a pad with an
// enemy walking towards it would be a punishment for using the mechanic, so it
// cannot be damaged while it is in transit. That is Health's ordinary mercy
// window, asked for by name (\`be safe for ⟨n⟩ seconds\`) rather than a second
// idea of invulnerability living here.
//
// TWO WAYS TO STEP ON ONE, because a player and an enemy want opposite things.
// A player wants to choose: standing on a pad is not using it, or the mechanic
// takes the level away from them. An enemy wants no choice at all, which is
// what makes a room with pads in it unpredictable to move through — JETPACK.md
// asks for exactly that, and it is one boolean.
//
// AND IT DOES NOT LOOP. A traveller that arrived somewhere is standing on the
// pad it arrived at, so a robot that takes any pad it touches would leave, land
// and leave again for ever. \`came from\` is not enough on its own to stop that:
// what stops it is that arriving does not count as touching, which is what the
// wait after landing is — a traveller must step OFF a pad before that pad, or
// any other, can take it again.`,
});
rule.uses('Physics');
rule.uses('Collisions');
rule.uses('Health');

// ── The pad ──────────────────────────────────────────────────────────────────

const pad = rule.trait('Is a Teleport Pad');
pad.uses(CanCollide);

/**
 * Which network this pad belongs to.
 *
 * A colour rather than a number, because it is the thing a player reads from
 * across the room — and because a level author should paint the network rather
 * than remember which channel is which. Pads match on this exactly.
 */
const padColour = pad.color('pad colour', '#4da3ff');

export const IsATeleportPad = rule.traitRef('Is a Teleport Pad');

// ── The traveller ────────────────────────────────────────────────────────────

const travels = rule.trait('Uses Teleport Pads');
travels.uses(CanMove);
travels.uses(CanCollide);

export const UsesTeleportPads = rule.traitRef('Uses Teleport Pads');

/**
 * How long the trip takes, in seconds.
 *
 * Not nothing, and not much: long enough that a player sees a departure and an
 * arrival rather than a jump, and short enough that it is not a punishment.
 * The traveller is safe for exactly this long — see the header.
 */
const travelSeconds = travels.number('travel seconds', 0.4);
/**
 * Whether it steps on to any pad it touches, without being asked.
 *
 * Off for a player, because a mechanic that fires whenever you stand somewhere
 * is a mechanic that has taken the level away from you. On for an enemy, which
 * is what makes a room with pads in it a room you cannot plan a route through.
 */
const takesAny = travels.boolean('takes any pad it touches', 'false');

/** Whether it is mid-trip. */
const travelling = travels.boolean('travelling', 'false', {readonly: true});
/** The world time it arrives at. */
const arrivesAt = travels.number('arrives at', 0, {readonly: true});
/** Where it is going — held from the moment it steps on. */
const goingTo = travels.actor('going to', {readonly: true});
/**
 * How it was standing on the pad it left, as an offset from that pad.
 *
 * Carried across, and it has to be. Arriving at the destination pad's own
 * position sounds right and is wrong for the commonest pad there is: one set
 * into the floor. A pad drawn as a plate on the ground has its middle IN the
 * ground, so a traveller put there is inside the floor — and Solid, which
 * cannot know why, does the only thing it can and pushes it out sideways, a
 * tile a frame, until it is somewhere nobody aimed at. Keeping the offset
 * means a traveller that walked on to a pad walks off the other one, standing
 * the same way it was standing.
 */
const cameInAt = travels.point('came in at', {x: 0, y: 0}, {readonly: true});
/**
 * Whether the traveller landed THIS frame, and is therefore still held.
 *
 * A trip ends in `push`, and two rules ask in `react` whether a body got
 * anywhere — Turning, to know whether it hit a wall, and Prowling, to know
 * whether to think again. Both read the distance travelled, and a body that
 * has just been placed has travelled nothing: without this the roller turns
 * round on the frame it arrives.
 *
 * `held still` is the flag that answers both, and Teleport already sets it for
 * the wait. This is what carries it one frame further, to cover the landing —
 * cleared at the top of the next frame's step, so a hold is exactly as long as
 * it needs to be and no rule has to time it.
 */
const landed = travels.boolean('landed', 'false', {readonly: true});
/**
 * Whether it has stepped off a pad since it last arrived on one.
 *
 * The whole of what stops the loop — see the header. Arriving puts a traveller
 * ON a pad, so without this an enemy that takes any pad it touches leaves,
 * lands and leaves again for ever, and a player holding the key never stops.
 */
const clear = travels.boolean('clear of pads', 'true', {readonly: true});

/** Raised when it steps on — which is when an animation should start. */
const startsTravelling = travels.event(['starts travelling']);
/** …and when it gets there. */
const arrives = travels.event(['arrives']);

/**
 * Stop going sideways, and leave the vertical alone.
 *
 * The vertical is gravity's: a traveller standing on a pad on a floor is a
 * standing body, and a standing body's downward speed is what Gravity and
 * Solid use between them to keep it standing. Zeroing it would be a second
 * opinion about how a body rests, taken once a frame for the whole of the
 * wait.
 *
 * This used to be load-bearing for another reason — `position before` was
 * worked out from the velocity, so a body with both components at zero read as
 * one that had always stood exactly here, and Solid pushed it sideways out of
 * the floor it stood in, a tile a frame. That was the traveller whipping
 * across the room. Physics records the position now, and the whip is not a
 * thing this shape prevents any more; the shape stays for the reason above.
 */
const holdStill = () =>
  velocity.set(
    thisActor(),
    vector(n(0), axisOf('y', velocity.of(thisActor()))),
  );

const here = rule.local('here', 'Actor');
const there = rule.local('there', 'Actor');
const other = rule.local('other', 'Actor');

/** The pads this actor is standing on — usually none, sometimes one. */
const padsUnder = () =>
  filter(here, {
    from: contacts.of(thisActor()),
    where: hasTrait(here.get(), IsATeleportPad),
  });

/**
 * Whether this actor's own middle has reached the middle of a pad it is on.
 *
 * Measured against HALF ITS OWN WIDTH rather than a number in this rule: a
 * body has arrived at the middle of something when the middle is inside it,
 * which is true of a coin and of a robot without either being told a distance.
 */
const overTheMiddle = pad =>
  lessThan(
    absolute(minus(position.x(thisActor()), position.x(pad))),
    over(axisOf('x', collisionSizeOf({sizeActor: thisActor()})), n(2)),
  );

/**
 * `⟨who⟩ use the pad` — the player's half, for a key handler to call.
 *
 * Does nothing off a pad, mid-trip, or on the pad it has just arrived at, so a
 * handler can call it on every press without asking any of those questions.
 */
export const usePad = travels.block({
  returns: 'none',
  description:
    'Step through the pad this actor is standing on, if it is standing on one. Does nothing otherwise.',
  say: ['use the pad'],
  body: () => [
    doc(
      'One pad is a pad with nowhere to go, which is the right answer rather than a special case — see the header.',
    ),
    here.set(firstActor(padsUnder())),
    when([
      [
        both(
          both(not(travelling.of(thisActor())), clear.of(thisActor())),
          moreThan(countOf(here.get()), n(0)),
        ),
        [
          doc(
            'Any OTHER pad of the same colour, picked afresh — which is what `any actor in` is for, and what `first actor in` could not say: three red pads read with `first` are two pads and a decoration.',
          ),
          there.set(
            anyActor(
              filter(other, {
                from: allWithTrait(IsATeleportPad),
                where: both(
                  equals(padColour.of(other.get()), padColour.of(here.get())),
                  not(sameActor(other.get(), here.get())),
                ),
              }),
            ),
          ),
          when([
            [
              moreThan(countOf(there.get()), n(0)),
              [
                travelling.set(thisActor(), yes()),
                goingTo.set(thisActor(), there.get()),
                doc(
                  '…and how it was standing on the one it is leaving, so that it arrives standing the same way. See the header.',
                ),
                cameInAt.set(
                  thisActor(),
                  minus(position.x(thisActor()), position.x(here.get())),
                  minus(position.y(thisActor()), position.y(here.get())),
                ),
                arrivesAt.set(
                  thisActor(),
                  add(time(), travelSeconds.of(thisActor())),
                ),
                doc(
                  'HELD, and said so rather than merely being still: see `held still` in Physics. A body that is not moving and a body that has been stopped look identical from outside, and `Turning` and `Prowling` both act on the difference — a ball waiting here would otherwise turn round every frame of the wait, and a robot would reconsider every frame of it.',
                ),
                held.set(thisActor(), yes()),
                holdStill(),
                doc(
                  'And not a target while it is in transit. Health’s own mercy window, asked for by name — a second idea of invulnerability living here would be one nothing else could see (`rules/health`).',
                ),
                when([
                  [
                    hasTrait(thisActor(), HasHealth),
                    [
                      staySafe(
                        {seconds: travelSeconds.of(thisActor())},
                        thisActor(),
                      ),
                    ],
                  ],
                ]),
                startsTravelling({}, thisActor()),
              ],
            ],
          ]),
        ],
      ],
    ]),
  ],
});

// PUSH, one moment before `move`, and the phase is the fix rather than a
// preference. `move` is where velocity becomes position, so a hold written
// there is a hold written after the body has already been moved: the traveller
// slid one frame's worth on the frame it stepped on, every time, which at a
// rolling speed is a visible nudge. Written here the speed is zero before
// anything reads it. Contacts are a frame old at this moment, which costs
// nothing — a pad is somewhere you are standing rather than something you pass
// through, and `Climbing` reads them a frame late for the same reason.
travels.step('travel', 'push', [
  doc(
    'The frame after a landing, which is when the hold ends. Held through the landing itself so that nothing reads a placed body as a stopped one; released here, before anything this frame asks.',
  ),
  when([
    [
      landed.of(thisActor()),
      [landed.set(thisActor(), no()), held.set(thisActor(), no())],
    ],
  ]),
  doc(
    'Standing on nothing? Then whatever pad it last arrived at is behind it, and the next one may take it. See the header: this is what stops an enemy leaving, landing and leaving again for ever.',
  ),
  when([[equals(countOf(padsUnder()), n(0)), [clear.set(thisActor(), yes())]]]),
  when(
    [
      [
        travelling.of(thisActor()),
        [
          holdStill(),
          when([
            [
              not(lessThan(time(), arrivesAt.of(thisActor()))),
              [
                setPosition(
                  thisActor(),
                  add(
                    position.x(goingTo.of(thisActor())),
                    cameInAt.x(thisActor()),
                  ),
                  add(
                    position.y(goingTo.of(thisActor())),
                    cameInAt.y(thisActor()),
                  ),
                ),
                travelling.set(thisActor(), no()),
                doc(
                  'THE RECORD OF WHERE IT STARTED THE FRAME WOULD OTHERWISE BE A LIE. Physics writes `position before` in `sense`, before anything moves, and Solid reads it to work out which face a body came in through so it can push it back out that way. A traveller set down here started the frame at the other pad, so Solid pushed it out along the line between them: for a pad above a floor, straight down through it, and only ever for a body that comes to rest — a rocket flies on and that pass never bites. Told the truth, Solid asks which side of the floor this body is on instead, which is the question a placement leaves.',
                ),
                placed({who: thisActor()}),
                doc(
                  'STILL HELD, for this frame. `held still` is cleared at the top of the next one (see `landed`): a body that has just been placed has travelled nothing, and the two rules that read distance in `react` would take that for having been stopped.',
                ),
                landed.set(thisActor(), yes()),
                doc(
                  'It is standing on the pad it arrived at, and that does not count as touching one.',
                ),
                clear.set(thisActor(), no()),
                arrives({}, thisActor()),
              ],
            ],
          ]),
        ],
      ],
    ],
    [
      doc(
        'An enemy has no choice, which is what makes a room with pads in it one you cannot plan a route through — but it waits until it is OVER THE MIDDLE of one. Touching starts at the edge, half a body before that, and a thing that vanishes on the touch has vanished while it still looks beside the pad rather than on it. The pad is read out first: asking where nothing is is asking an actor that is not there for its position (`rules/prowling` makes the same guard for the same reason).',
      ),
      here.set(firstActor(padsUnder())),
      when([
        [
          both(
            takesAny.of(thisActor()),
            both(
              moreThan(countOf(here.get()), n(0)),
              overTheMiddle(here.get()),
            ),
          ),
          [usePad({}, thisActor())],
        ],
      ]),
    ],
  ),
]);

export default () => moduleFor(rule, 'teleport');
