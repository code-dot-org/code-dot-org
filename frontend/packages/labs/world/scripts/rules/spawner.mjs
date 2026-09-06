import {
  add,
  allWithTrait,
  atLeast,
  both,
  defineRule,
  doc,
  either,
  forEach,
  lessThan,
  moduleFor,
  n,
  no,
  note,
  thisActor,
  time,
  times,
  when,
  yes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Spawner',
  ability: 'Sends Things',
  purpose: `**Spawner** is a source of enemies — waves that keep coming.

It owns the *when* and not the *what*: it raises an event on a schedule, and
your handler places whatever a wave means in your game. That is what lets a
stock rule send actors it has never heard of.

Give an actor **Sends Things**, and set the gap between waves.`,
  header: `// "Sends Things" — a source of enemies, and the two facts that make it a game.
//
// NOT WHAT IT SENDS. A property holds a number, a vector or a set of actors,
// and there is no kind that holds an actor TEMPLATE — so a stock rule cannot
// name a Rock a project invented (rules/shoots says the same, at length). This
// raises an event and the project's handler places whatever a wave means to it:
// a rock, a bird, a car. One handler, and the rule never learns what it sends.
//
// NOT A TIMER, THOUGH IT KEEPS TIME. \`Keeps Time\` is a clock you drive: it goes
// off, you decide what that means, and it goes off again exactly as often. A
// wave is two more facts on top of that, and both of them are what makes an
// arcade game an arcade game rather than a metronome:
//
//   HOW MANY. Twenty and then stop, which a repeating timer cannot say — it
//     repeats or it fires once, and "twenty" is a number nothing counts.
//   AND CLOSER EACH TIME. The gap shrinking is the whole difficulty curve. A
//     learner writes it by hand first (\`arcade/waves\`) and it is four blocks of
//     arithmetic on a clock reading; here it is a number.
//
// Take those two away and this rule should not exist. That is why it owns a
// clock of its own rather than depending on Time's: a rule cannot handle
// another rule's event, so a spawner built ON a timer could not count what the
// timer sent. The clock it duplicates is one comparison and one addition.
//
// \`seconds apart\` IS THE LIVE GAP, not the gap it started at. The rule
// multiplies it, so a learner can watch the number itself close — and so
// \`start again\` cannot put it back, which is the honest cost of showing the
// working. A wave that should start slow again sets it.
//
// The clock is \`time\`, which counts ticks rather than reading a wall clock, so
// a paused game sends nothing and a wave means the same thing on a 30Hz screen
// as on a 120Hz one.`,
});

const sends = rule.trait('Sends Things');

export const SendsThings = rule.traitRef('Sends Things');

/**
 * Seconds between one and the next — and the LIVE one, written by the step.
 *
 * Writable, unlike the bookkeeping below, because it is the setting a project
 * makes and then the thing a project watches. See the header.
 */
const gap = sends.number('seconds apart', 1);
/**
 * What the gap is multiplied by after each one: 1 never changes, 0.8 closes.
 *
 * A factor rather than a subtraction, so it cannot walk the gap to zero and
 * then to a negative — which is a spawner that sends everything it has in one
 * frame, and reads as the game crashing.
 */
const closer = sends.number('closer each time', 1);
/** How many in all; zero means keep going. */
const total = sends.number('how many to send', 0);
/** How many have gone. Read-only: the step counts them. */
const sent = sends.number('how many sent', 0, {readonly: true});
/**
 * The world time the next one is due at.
 *
 * Read-only and a TIME rather than a countdown, as Time's is and for the same
 * reason: nothing has to tick it down. Zero means the next frame, so a fresh
 * spawner sends one straight away — `start again` is how to wait a gap first.
 */
const nextAt = sends.number('next one at', 0, {readonly: true});
/**
 * Whether it is sending at all.
 *
 * A plain property, so stopping is `set sending of ⟨Spawner⟩ to ⟨no⟩` — the
 * setter every property already has — rather than a block saying it again.
 */
const sending = sends.boolean('sending', true);

/** `when ⟨any Spawner⟩ sends something` — the seam the rule exists for. */
const sendsSomething = sends.event(['sends something']);

/**
 * `⟨Spawner⟩ start again` — none sent, and the first one a full gap from now.
 *
 * Also how a stopped spawner is restarted, since one that resumed with a due
 * time in the past would send the instant it was switched back on.
 *
 * It does NOT put `seconds apart` back, because the rule has not kept what it
 * was — see the header.
 */
sends.block({
  returns: 'none',
  description: 'Send none so far, and wait a full gap before the next.',
  say: ['start again'],
  body: () => [
    sent.set(thisActor(), n(0)),
    nextAt.set(thisActor(), add(time(), gap.of(thisActor()))),
    sending.set(thisActor(), yes()),
  ],
});

/** `⟨Spawner⟩ stop` — no more, until something starts it again. */
sends.block({
  returns: 'none',
  description: 'Send no more of them, leaving the count where it is.',
  say: ['stop sending'],
  body: () => [sending.set(thisActor(), no())],
});

const each = rule.local('each', 'Actor');

// A RULE step rather than a trait's, and in `sense`, for the reason Time's step
// gives at length: `sense` is the world moment where clocks are read, and
// `phasesFor` never offers a trait step a world phase.
rule.step('tick', 'sense', [
  doc(
    '**One clock, walked over every spawner in the world.**\n\nThree questions have to be yes: it is switched on, its `next` time has arrived, and it has some left to send. A total of 0 means "keep going", so a limit only bites once it is set.\n\nLike Patrol\'s beat, the next time is booked from when this one was DUE rather than from now, so a slow frame does not push the whole wave later. And what is raised is an EVENT: the rule owns the *when* and your handler owns the *what*, which is what lets a stock rule send an actor it has never heard of.\n\nA rule step rather than a trait\'s, and in `sense` — the world moment where clocks are read, before anything has decided or moved.',
  ),
  note('Sending, due, and with some left to send?'),
  forEach(each, {
    from: allWithTrait(rule.traitRef('Sends Things')),
    body: [
      when([
        [
          both(
            both(
              sending.of(each.get()),
              atLeast(time(), nextAt.of(each.get())),
            ),
            // Zero is "keep going", so a limit only bites when it is set.
            either(
              lessThan(total.of(each.get()), n(1)),
              lessThan(sent.of(each.get()), total.of(each.get())),
            ),
          ),
          [
            note(
              'Schedule and count BEFORE saying anything, so a handler that',
            ),
            note('stops or restarts it has the last word, not this.'),
            nextAt.set(each.get(), add(time(), gap.of(each.get()))),
            gap.set(
              each.get(),
              times(gap.of(each.get()), closer.of(each.get())),
            ),
            sent.set(each.get(), add(sent.of(each.get()), n(1))),
            sendsSomething({}, each.get()),
          ],
        ],
      ]),
    ],
  }),
]);

export default () => moduleFor(rule, 'spawner');
