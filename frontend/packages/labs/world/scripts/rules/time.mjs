import {
  add,
  atLeast,
  both,
  allWithTrait,
  defineRule,
  forEach,
  give,
  moduleFor,
  no,
  not,
  note,
  thisActor,
  time,
  when,
  yes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Time',
  ability: 'Keeps Time',
  header: `// "Keeps Time" — things that happen every so often, and things you can
// only do every so often.
//
// The library had no scheduling of any kind. \`world time\` gave you a number to
// compare against and that was all, so "spawn a wave every three seconds" was
// an accumulator a learner wrote by hand in a step, and "flash for a moment"
// was not really writable.
//
// A TIMER IS A TRAIT, which is the interesting part of this rule. The obvious
// reading of "every two seconds" is a hat the CLOCK fires — an event belonging
// to nothing, raised by the world. That would have been the first event in the
// language with no subject, and the machinery for one does not exist: an event
// is about an actor, a handler is registered on a kind, and a rule step runs
// per actor holding a trait.
//
// So an actor holds the timer, and "every two seconds" is something a
// SPAWNER does rather than something the world does. Which turns out to be the
// better reading anyway: games have several clocks — a wave timer, a lamp that
// blinks, a bomb — and they start, stop and restart independently. One world
// clock would have needed a way to tell them apart on the very first project
// that had two.
//
// ONE FIRING PER FRAME, and the next is scheduled from NOW rather than from
// when it was due. A frame that ran long does not owe the timer three firings:
// catching up would fire them all in one frame — three waves in one tick — and
// then keep firing while it tried to catch up, which is a spiral rather than a
// game.
//
// IT FIRES ON THE FIRST FRAME. \`every ⟨2⟩ seconds\` with a spawner in it puts
// something on screen straight away and then every two seconds, which is what a
// spawner is for; \`restart the timer\` is how to wait the first two out
// instead.
//
// A COOLDOWN is the same idea with the sides swapped. A timer says "it is time
// again" and a cooldown answers "not yet" — it needs no step at all, just a
// time to compare against and two blocks to ask and to start it. Shooting,
// dashing, drinking a potion: the question is always \`is ready?\` and the
// answer is always \`start the cooldown\`.`,
});

const timed = rule.trait('Has a Timer');
const cooling = rule.trait('Has a Cooldown');

export const HasATimer = rule.traitRef('Has a Timer');
export const HasACooldown = rule.traitRef('Has a Cooldown');

/** Seconds between firings. */
const period = timed.number('timer period', 1);
/** Whether it goes again after it fires, or stops. */
const repeats = timed.boolean('timer repeats', true);
/**
 * Whether it is running at all.
 *
 * A plain property, so stopping and starting a timer is `set timer runs of ⟨…⟩
 * to ⟨no⟩` — the setter every property already has — rather than two blocks
 * that would say the same thing in this rule's own words.
 */
const runs = timed.boolean('timer runs', true);
/**
 * The world time it next goes off at.
 *
 * Read-only: the step owns it. Zero is the default and means "the next frame",
 * because the clock starts at zero — which is what makes a fresh timer fire
 * straight away without a sentinel value standing for "never started".
 */
const nextAt = timed.number('next fire at', 0, {readonly: true});

/** `when ⟨Spawner⟩'s timer fires` — the whole point of the trait. */
const fires = timed.event(['timer fires']);

/**
 * `⟨Spawner⟩ restart the timer` — wait a full period from now.
 *
 * Also how a stopped timer is started again, since a timer that resumed at a
 * time in the past would fire the instant it was switched back on.
 */
timed.block({
  returns: 'none',
  description: 'Wait a full period from now, and run if it was stopped.',
  say: ['restart the timer'],
  body: () => [
    nextAt.set(thisActor(), add(time(), period.of(thisActor()))),
    runs.set(thisActor(), yes()),
  ],
});

const each = rule.local('each', 'Actor');

// A RULE step rather than a trait's, and the phase is why. `sense` is where the
// outside world is read — its own summary says "keys, pointer, timers" — and it
// is a WORLD moment: `phasesFor` offers a trait step only the ACTOR phases, so
// a trait step naming `sense` names something the editor would never have
// offered. It survives a round trip only because a live dropdown keeps a value
// its options lack, and then draws a label for a different phase.
//
// So the loop is written out, the way Gravity's two steps write theirs out, and
// the step goes where the frame says it belongs.
rule.step('tick', 'sense', [
  note('Due, and running? Then it is time.'),
  forEach(each, {
    from: allWithTrait(rule.traitRef('Has a Timer')),
    body: [
      when([
        [
          both(runs.of(each.get()), atLeast(time(), nextAt.of(each.get()))),
          [
            note('Schedule the next one BEFORE saying anything, so a handler'),
            note('that restarts or stops it has the last word, not this.'),
            nextAt.set(each.get(), add(time(), period.of(each.get()))),
            when([[not(repeats.of(each.get())), [runs.set(each.get(), no())]]]),
            fires({}, each.get()),
          ],
        ],
      ]),
    ],
  }),
]);

/** Seconds it takes to be ready again. */
const cooldown = cooling.number('cooldown', 1);
/**
 * The world time it is ready again at.
 *
 * Read-only and a TIME rather than a countdown, so nothing has to tick it down
 * — the same shape Health's mercy window uses, and for the same reason.
 */
const readyAt = cooling.number('ready at', 0, {readonly: true});

/**
 * `⟨Player⟩ is ready?` — whether the cooldown has passed.
 *
 * True to begin with: something you have never done is something you can do.
 */
cooling.block({
  returns: 'boolean',
  description: 'Whether the cooldown has passed and this can go again.',
  say: ['is ready?'],
  body: () => [give(atLeast(time(), readyAt.of(thisActor())))],
});

/** `⟨Player⟩ start the cooldown` — not again until it has passed. */
cooling.block({
  returns: 'none',
  description: 'Begin the wait: not ready again until the cooldown has passed.',
  say: ['start the cooldown'],
  body: () => [readyAt.set(thisActor(), add(time(), cooldown.of(thisActor())))],
});

export default () => moduleFor(rule, 'time');
