import {velocity} from './builtins.mjs';
import {
  add,
  axisOf,
  both,
  defineRule,
  equals,
  give,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  not,
  note,
  param,
  thisActor,
  time,
  times,
  vector,
  when,
} from './dsl.mjs';
import {AffectedByGravity, directionOfGravity, falling} from './gravity.mjs';

const rule = defineRule({
  name: 'Jumping',
  ability: 'Jumps',
  header: `// "Jumps" — the verb a platformer is missing without it.
//
// Gravity already knows whether an actor is standing on something: its landing
// step keeps \`falling\` up to date and offers "is on the ground?" to read it.
// What was missing was the other half — a push away from the ground that knows
// when it is allowed. A learner could always write
//
//     when ⟨player⟩ presses ⟨space⟩   →   set ⟨player⟩'s velocity to …
//
// and that is a jump in the sense that the actor goes up. It is also a jump
// that works in mid-air, works twice, and works while falling down a pit.
//
// ASKING IS SEPARATE FROM JUMPING, the way it is in Shooting and for the same
// reason: the answer is sometimes no. \`make ⟨who⟩ jump\` is a statement, so
// there is no way to be told yes and then forget to write down that you
// jumped — which would be a jump with no limit at all.
//
//     when ⟨player⟩ presses ⟨space⟩   →   make ⟨player⟩ jump
//     when ⟨player⟩ jumps             →   play sound ⟨boing⟩
//
// COYOTE TIME is why the bookkeeping is a step rather than a line in the
// action. Walking off a ledge and pressing jump a frame later is the single
// most common thing a player does that a naive platformer refuses, and the fix
// everyone uses is to keep the ground jump available for a moment after the
// ground is gone. Written into the action it would be a condition; written as
// a step it is a fact — the ground jump is spent when the grace runs out, and
// the action only ever asks "have I one left?".
//
// That is also what makes DOUBLE JUMP fall out for free. A second jump is not
// a different rule, it is \`jumps allowed\` being two; and because the coyote
// grace spends the FIRST jump when it lapses, walking off a ledge costs the
// ground jump rather than silently granting an extra air one.
//
// The bookkeeping runs in \`sense\`, before anything decides anything, and reads
// the standing state gravity left at the end of the last frame — landing
// happens in \`react\`, which is after \`decide\`. One frame of latency, and the
// grace period swallows it whole.
//
// STRAIGHT AGAINST GRAVITY, and vertical with a sign, which is the same world
// Gravity itself models: 1 normally, -1 when gravity has been inverted. An
// upside-down world's jumps go down, and nothing here has to know more about
// direction than Gravity does.`,
});
rule.uses('Gravity');

const jumps = rule.trait('Jumps');
jumps.uses(AffectedByGravity);

// Units a second, upward. With the default gravity of 9 this clears about
// three tiles and hangs for a little under a second — a jump you can steer.
const strength = jumps.number('jump strength', 4);
// Seconds of grace after the ground goes. A tenth is the number most
// platformers land on: long enough to forgive a late press, short enough that
// nobody notices it as flight.
const coyote = jumps.number('coyote time', 0.1);
// Two is a double jump. There is no third thing to build.
const allowed = jumps.number('jumps allowed', 1);
// Spent so far since last standing. Read-only: the rule's own action and its
// bookkeeping step are what write it, and a project setting it by hand would
// be setting a tally, which is never a thing to mean.
const used = jumps.number('jumps used', 0, {readonly: true});
// When this actor was last standing on something. Long before the game began,
// which matters only until the first frame: the bookkeeping step reads the
// standing state gravity left last frame, and on frame one that is still its
// default of "not falling". So an actor spawned in mid-air has its ground jump
// available for one sixtieth of a second. That is inside the grace period this
// rule already grants on purpose, and the alternative is a "have we ticked
// yet" flag on every jumper.
const lastGround = jumps.number('last on ground', -1000, {readonly: true});

export const Jumps = rule.traitRef('Jumps');

/** Raised when a jump actually happens — not when one is asked for. */
export const jumped = jumps.event(['jumps']);

jumps.block({
  returns: 'boolean',
  description:
    'Whether this actor has a jump left — on the ground, inside the coyote grace, or with an air jump unspent.',
  say: ['can jump?'],
  body: () => [give(lessThan(used.of(thisActor()), allowed.of(thisActor())))],
});

jumps.step('watch the ground', 'sense', [
  note('Standing on something? Then every jump is available again.'),
  when(
    [
      [
        not(falling.of(thisActor())),
        [lastGround.set(thisActor(), time()), used.set(thisActor(), n(0))],
      ],
    ],
    [
      note('In the air, and the grace has run out with the ground jump'),
      note('unspent: spend it. Walking off a ledge costs the ground jump,'),
      note('so a double jumper gets ONE air jump rather than two.'),
      when([
        [
          both(
            equals(used.of(thisActor()), n(0)),
            moreThan(
              minus(time(), lastGround.of(thisActor())),
              coyote.of(thisActor()),
            ),
          ),
          [used.set(thisActor(), n(1))],
        ],
      ]),
    ],
  ),
]);

const sign = rule.local('sign', 'Number');

/**
 * Ask to jump. Jumps if one is available, and does nothing if not.
 *
 * On the RULE with the actor as a parameter, not on the trait, for the reason
 * Shooting's `make … fire` is: a trait's block carries an implicit subject, so
 * declaring one here as well would give the block two ways to say who was
 * jumping and two chances to disagree.
 */
export const makeJump = rule.block({
  returns: 'none',
  description:
    'Jump, if this actor has a jump left. Does nothing if it is in the air with none — handle "jumps" to say what a jump sounds or looks like.',
  say: ['make', param('who', 'actor'), 'jump'],
  body: ({who}) => [
    note('A jump left? Then this one happens.'),
    when([
      [
        lessThan(used.of(who.get()), allowed.of(who.get())),
        [
          note('Write it down BEFORE telling anyone: the handler may jump'),
          note('again, and a tally written afterwards would miss it.'),
          used.set(who.get(), add(used.of(who.get()), n(1))),
          note('Which way is up? The opposite of wherever gravity pulls.'),
          sign.set(n(1)),
          when([
            [
              lessThan(axisOf('y', directionOfGravity.of()), n(0)),
              [sign.set(n(-1))],
            ],
          ]),
          note('REPLACE the vertical speed rather than adding to it: a second'),
          note('jump out of a long fall has to go as high as the first.'),
          velocity.set(
            who.get(),
            vector(
              axisOf('x', velocity.of(who.get())),
              times(times(strength.of(who.get()), n(-1)), sign.get()),
            ),
          ),
          jumped({}, who.get()),
        ],
      ],
    ]),
  ],
});

export default () => moduleFor(rule, 'jump');
