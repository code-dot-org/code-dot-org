import {
  atLeast,
  defineRule,
  minus,
  moduleFor,
  note,
  param,
  time,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Zapping',
  ability: 'Zaps',
  header: `// "Zaps" — how often a thing may zap, and nothing about what it sends.
//
// The rule owns the RATE and the project owns the ENERGY BALL, and that split
// is forced rather than chosen: a property can hold a number, a vector or a set of
// actors, but there is no kind that holds an actor TEMPLATE. A stock rule
// therefore has no way to name an Energy Ball a project invented, and one that
// tried would either hard-code a kind nobody has or need a knob it cannot type.
//
// So this raises an event instead. \`make … zap\` asks, the recharge answers,
// and if the answer is yes the actor is told it ZAPPED — at which point the
// project's own handler sends whatever zapping means to it. A ship sends an
// energy ball, a dragon sends a spark, a hose sends a droplet; none of that is
// this rule's business, and all of it is one handler.
//
// TWO BLOCKS in the project, not one, and the pairing is what makes the
// cooldown real:
//
//     when ⟨player⟩ presses ⟨space⟩   →   make ⟨this actor⟩ zap
//     when ⟨this actor⟩ zaps          →   add actor ⟨Energy Ball⟩ …
//
// Asking is separate from zapping because the answer is sometimes no. A learner
// who spawned the ball straight from the key press would have written something
// with no rate limit, and adding one later would mean unpicking it.
//
// The clock is \`time\`, which counts ticks rather than reading a wall clock, so
// a paused game does not recharge and the cooldown means the same thing on a
// 30Hz screen as on a 120Hz one.`,
});

const zaps = rule.trait('Zaps');
// Seconds between zaps. A quarter second is about six a second, which is fast
// enough to feel responsive and slow enough that a held key is not a wall.
const recharge = zaps.number('recharge time', 0.25);
// When it last zapped, kept per actor so two ships do not share one cooldown.
//
// Read-only: the rule's own action is what writes it, and a project setting it
// by hand would be setting a clock reading, which is never a thing to mean.
//
// Long before the game began, so the FIRST zap is always ready. Zero would
// leave an actor unable to zap for one recharge at the start — a bug that
// presents as "the key does not work yet", which is the worst kind.
const lastZapped = zaps.number('last zapped', -1000, {readonly: true});

export const Zaps = rule.traitRef('Zaps');

/**
 * Raised when a zap actually happens — not when one is asked for.
 *
 * The seam the whole rule exists for. Everything about WHAT is sent lives in
 * the handler a project writes for this, so the rule never learns what an
 * energy ball is.
 */
export const zapsEvent = zaps.event(['zaps']);

/**
 * Ask to zap. Zaps if the cooldown has elapsed, and does nothing if not.
 *
 * A statement rather than a question so that asking and zapping cannot come
 * apart: there is no way to be told "yes" and then forget to write down that
 * you did, which would be a zapper that recharges instantly.
 *
 * On the RULE with the actor as a parameter, not on the trait. A trait's block
 * already carries an implicit subject, so declaring one here as well gave the
 * block two ways to say who was zapping — an `on ⟨…⟩` socket AND a `who` — which
 * is the same actor asked for twice and two chances to disagree.
 */
export const makeZap = rule.block({
  returns: 'none',
  description:
    'Zap, if enough time has passed since the last one. Does nothing if the actor is still recharging — handle "zaps" to say what a zap actually sends.',
  say: ['make', param('who', 'actor'), 'zap'],
  body: ({who}) => [
    note('Long enough since the last zap? Then this one happens.'),
    when([
      [
        atLeast(
          minus(time(), lastZapped.of(who.get())),
          recharge.of(who.get()),
        ),
        [
          note(
            'Write down when, BEFORE telling anyone: the handler may zap again.',
          ),
          lastZapped.set(who.get(), time()),
          zapsEvent({}, who.get()),
        ],
      ],
    ]),
  ],
});

export default () => moduleFor(rule, 'zaps');
