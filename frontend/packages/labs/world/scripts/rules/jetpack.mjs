import {velocity} from './builtins.mjs';
import {
  add,
  atMost,
  axisOf,
  both,
  defineRule,
  doc,
  frameTime,
  give,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  no,
  not,
  note,
  over,
  param,
  thisActor,
  times,
  vector,
  when,
  yes,
} from './dsl.mjs';
import {AffectedByGravity, directionOfGravity} from './gravity.mjs';

const rule = defineRule({
  name: 'Jetpack',
  ability: 'Flies with a Jetpack',
  header: `// "Flies with a Jetpack" — held down rather than pressed, and it runs out.
//
// Jumping is the other half of this and answers a different question. A jump is
// a PRESS: one impulse, spent from a tally, and the whole of it is decided in
// the frame the key goes down. Flight is a STATE — a force applied for as long
// as the jetpack is on, fighting gravity rather than beating it once.
//
// IT IS SWITCHED, NOT PUMPED, and that is the one design decision here worth
// arguing about. The thrust has to happen every frame, so the obvious block is
// one that thrusts once and has to be called sixty times a second. But a
// learner has no good way to say "every frame this key is held": the keyboard
// gives them \`presses\` and \`releases\`, which are moments, and asking every
// frame means writing a step of their own and a \`key is down\` test inside it —
// four blocks to say what the key already said twice. Meanwhile the rule HAS a
// step, running every frame, which is where the thrust belongs anyway.
//
// So the two moments the keyboard actually offers are the two blocks:
//
//     when ⟨player⟩ presses ⟨space⟩   →   start ⟨player⟩ flying
//     when ⟨player⟩ releases ⟨space⟩  →   stop ⟨player⟩ flying
//
// and the frames in between are the rule's business. The fallback jump goes on
// the same press, under the question the rule answers:
//
//     when ⟨player⟩ presses ⟨space⟩   →   if ⟨player⟩ has fuel? is false
//                                            → make ⟨player⟩ jump
//
// which is the whole of "flies while it has fuel, and manages a weak hop when
// it does not". Neither rule had to learn about the other.
//
// STARTING IS NOT A REQUEST TO BE GRANTED LATER. \`start … flying\` with an
// empty tank does nothing at all rather than arming something that would fire
// on the next pickup — so the press that could not fly is free for the jump to
// answer, and a tank filled mid-hold waits for the next press.
//
// THE THRUST IS AN ACCELERATION, not a speed, which is the part that makes a
// jetpack feel like one. Setting the speed directly would be a lift, rising
// the instant the key went down and stopping dead when it came up. An
// acceleration has to overcome gravity first — so the actor sinks for a moment,
// then hangs, then climbs, and keeps climbing for a moment after the key is
// released. That lag is the mechanic. It is why the default thrust is twice
// gravity rather than a little over it: at 10 against 9 the climb is so slow
// the game reads as broken.
//
// A TOP SPEED, because an acceleration with no cap reaches the ceiling of a
// sixteen-tile room in under a second and the player has no time to aim. It
// caps the speed AGAINST gravity only: falling is Gravity's business, and a
// jetpack that also limited the fall would be a parachute.
//
// STRAIGHT AGAINST GRAVITY, and vertical with a sign — the same world Gravity
// itself models, 1 normally and -1 when gravity has been turned over. An
// upside-down world's jetpacks push down, and nothing here has to know more
// about direction than Gravity does.
//
// WHAT IT DOES NOT DO is spawn a flame, play a sound, or choose an animation.
// Those are the project's, and \`starts flying\`, \`stops flying\` and \`runs out
// of fuel\` are how it hears about them — the same seam Zaps draws between
// having zapped and what the zap looks like.`,
});
rule.uses('Gravity');

const flies = rule.trait('Flies with a Jetpack');
flies.uses(AffectedByGravity);

// Units a second squared, against gravity. Twice the default gravity of 9, so
// the net climb is one gravity: an actor holding the key rises as fast as it
// would otherwise fall. Under about 12 the climb is slow enough to read as a
// bug rather than as weight.
const thrust = flies.number('thrust', 18);
// Units a second, against gravity — a hundred pixels each (engine/core/units).
// Three is a little under ten tiles a second, which crosses a sixteen-tile room
// in about a second and a half: fast enough to feel like thrust, slow enough to
// steer while it happens.
const topSpeed = flies.number('top flying speed', 3);
// What is in the tank, and what it holds. Both settable: filling a tank is what
// a pickup does, and a level that wants a bigger one says so.
const fuel = flies.number('fuel', 100);
const capacity = flies.number('most fuel', 100);
// A quarter of a full tank a second, so a full one is four seconds of held
// flight. Long enough to cross a room and think about it, short enough that
// the pickups are worth going out of the way for.
const burnRate = flies.number('fuel per second', 25);
// Whether the jetpack is on — the state, and what an animation reads. Read-only
// so that it is only ever changed through the two blocks below, which is what
// keeps `starts flying` and `stops flying` honest: a project that could set
// this by hand could turn the thrust on without anything ever being said.
const flying = flies.boolean('flying', 'false', {readonly: true});

export const FliesWithAJetpack = rule.traitRef('Flies with a Jetpack');

/** Raised on the frame thrust begins — not every frame it continues. */
const startedFlying = flies.event(['starts flying']);
/** …and on the frame it ends, however it ended: key up, or tank empty. */
const stoppedFlying = flies.event(['stops flying']);
/** Raised once, on the frame the tank reaches nothing. */
const ranOut = flies.event(['runs out of fuel']);

flies.block({
  returns: 'boolean',
  description:
    'Whether this actor has any fuel left. False is what makes the fallback ' +
    'jump the right answer.',
  say: ['has fuel?'],
  body: () => [give(moreThan(fuel.of(thisActor()), n(0)))],
});

flies.block({
  returns: 'number',
  description:
    'How full the tank is, from 0 to 1 — what a fuel gauge is drawn from.',
  say: ['fuel fraction'],
  body: () => [
    note('A tank with no capacity is empty rather than a division by zero.'),
    when(
      [
        [
          moreThan(capacity.of(thisActor()), n(0)),
          [give(over(fuel.of(thisActor()), capacity.of(thisActor())))],
        ],
      ],
      [give(n(0))],
    ),
  ],
});

const sign = rule.local('sign', 'Number');

/** 1 when down is down, -1 when gravity has been turned over. */
const decideSign = [
  sign.set(n(1)),
  when([
    [lessThan(axisOf('y', directionOfGravity.of()), n(0)), [sign.set(n(-1))]],
  ]),
];

/**
 * Switch the jetpack on. Does nothing with an empty tank.
 *
 * On the RULE with the actor as a parameter rather than on the trait, for the
 * reason `make … jump` gives: a trait's block carries an implicit subject, so
 * declaring one here as well would give the block two ways to say who was
 * flying and two chances to disagree.
 */
export const startFlying = rule.block({
  returns: 'none',
  description:
    'Switch this actor’s jetpack on. It thrusts every frame until it is ' +
    'switched off or the tank runs dry. Does nothing with an empty tank, so ' +
    'the same key press is free for a jump.',
  say: ['start', param('who', 'actor'), 'flying'],
  body: ({who}) => [
    note('No fuel, no flight — and no promise to fly later either.'),
    when([
      [
        both(moreThan(fuel.of(who.get()), n(0)), not(flying.of(who.get()))),
        [flying.set(who.get(), yes()), startedFlying({}, who.get())],
      ],
    ]),
  ],
});

/** …and off again, which is what the key coming up means. */
export const stopFlying = rule.block({
  returns: 'none',
  description:
    'Switch this actor’s jetpack off. Gravity takes over — though it keeps ' +
    'rising for a moment, because thrust is an acceleration.',
  say: ['stop', param('who', 'actor'), 'flying'],
  body: ({who}) => [
    note('Once, so a key released twice does not say so twice.'),
    when([
      [
        flying.of(who.get()),
        [flying.set(who.get(), no()), stoppedFlying({}, who.get())],
      ],
    ]),
  ],
});

/**
 * Put fuel in the tank, without overfilling it.
 *
 * The pickup's whole body: a half-tank is `give ⟨who⟩ 50 fuel` against the
 * default capacity of a hundred. Written here rather than left to the project
 * because the clamp is the part that is easy to leave out, and a tank over its
 * own capacity is a gauge drawn past the end of its bar.
 */
export const giveFuel = rule.block({
  returns: 'none',
  description:
    'Put fuel in this actor’s tank, up to its capacity. What a fuel pickup does.',
  say: ['give', param('who', 'actor'), param('amount', 'number'), 'fuel'],
  body: ({who, amount}) => [
    fuel.set(who.get(), add(fuel.of(who.get()), amount.get())),
    note('Never past the top of the tank.'),
    when([
      [
        moreThan(fuel.of(who.get()), capacity.of(who.get())),
        [fuel.set(who.get(), capacity.of(who.get()))],
      ],
    ]),
  ],
});

flies.step('thrust', 'push', [
  doc(
    'A FORCE, in the moment forces are added — beside gravity’s own, and the only moment that knows how long a frame is. Every frame the jetpack is on, which is why nothing outside has to count them.',
  ),
  when([
    [
      flying.of(thisActor()),
      [
        doc(
          'Burn. Per SECOND rather than per frame, so a fast screen does not empty the tank quicker than a slow one.',
        ),
        fuel.set(
          thisActor(),
          minus(
            fuel.of(thisActor()),
            times(burnRate.of(thisActor()), frameTime()),
          ),
        ),
        note('Which way is up? The opposite of wherever gravity pulls.'),
        ...decideSign,
        doc(
          'ACCELERATION, not speed: the actor has to out-push gravity before it rises, and keeps rising after the switch goes off.',
        ),
        velocity.set(
          thisActor(),
          vector(
            axisOf('x', velocity.of(thisActor())),
            minus(
              axisOf('y', velocity.of(thisActor())),
              times(times(thrust.of(thisActor()), frameTime()), sign.get()),
            ),
          ),
        ),
        doc(
          'Capped AGAINST gravity only. Falling is Gravity’s business, and a jetpack that slowed the fall would be a parachute.',
        ),
        when([
          [
            lessThan(
              times(axisOf('y', velocity.of(thisActor())), sign.get()),
              times(topSpeed.of(thisActor()), n(-1)),
            ),
            [
              velocity.set(
                thisActor(),
                vector(
                  axisOf('x', velocity.of(thisActor())),
                  times(times(topSpeed.of(thisActor()), n(-1)), sign.get()),
                ),
              ),
            ],
          ],
        ]),
        doc(
          'An empty tank switches itself off, and says both things: the tank is a moment of its own, and the flying stopping is the same moment a released key would have made. A project that handles one and not the other is not caught out either way.',
        ),
        when([
          [
            atMost(fuel.of(thisActor()), n(0)),
            [
              fuel.set(thisActor(), n(0)),
              ranOut({}, thisActor()),
              flying.set(thisActor(), no()),
              stoppedFlying({}, thisActor()),
            ],
          ],
        ]),
      ],
    ],
  ]),
]);

export default () => moduleFor(rule, 'jetpack');
