import {
  add,
  atLeast,
  both,
  defineRule,
  moduleFor,
  moreThan,
  n,
  no,
  not,
  note,
  param,
  when,
  yes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Scoring',
  ability: 'Keeps Score',
  header: `// "Keeps Score" — a number the whole world shares, and the moment it is
// enough.
//
// Every game in this library runs forever. A learner can already count things:
// the starter's player asks how many coins are in what it has collected, and a
// world may declare a property of its own to tally anything at all. What none
// of that gives is a WIN — the instant the tally is enough, which is a fact
// about the game rather than about any actor in it.
//
// WORLD-SCOPED, all of it. A score belongs to nobody: two players share one,
// and an actor that dies takes its own properties with it and must not take
// the score. Gravity's strength is world-scoped for the same reason, and this
// is that shape with an event on the end.
//
// IT OWNS NO POLICY, which is the split every rule here makes. Winning sets a
// flag and says so; it does not stop the world, hide the actors or show a
// banner, because those are decisions a game makes and this rule cannot know
// them. What a project writes is
//
//     when the target is reached   →   set ⟨Banner⟩'s text to "YOU WIN"
//
// and everything after the arrow is the project's.
//
// THERE IS NO "lose the game" HERE, and its absence is deliberate rather than
// an omission. Losing already has a moment: Health raises "dies", and a game
// with no health has nothing to lose. Adding a second way to end would give a
// learner two places to look and two things to keep agreeing.
//
// The target fires ONCE. A score that crosses the line and keeps climbing —
// which is the normal case, since collecting does not stop — would otherwise
// raise the event on every coin after it, and a handler that shows a banner
// would show it again and again. \`won\` is what remembers, and resetting the
// score is what forgets.`,
});

// The tally itself. Writable, because a project may want to set it directly —
// a level that starts you with points, a penalty that takes some away.
const score = rule.number('score', 0);
// What counts as enough. Zero means no target at all, so a game that only
// wants a number on the screen gets one and is never told it has won.
const target = rule.number('target score', 0);
// Whether the target has been reached. Read-only: `add … to the score` is what
// sets it and `reset the score` is what clears it, and a project writing it by
// hand would be claiming a win the score does not support.
const won = rule.boolean('won', 'false', {readonly: true});

/** Raised the first time the score reaches the target, and only then. */
export const targetReached = rule.event(['the target is reached']);
/** Raised whenever the score changes at all, by any amount, including down. */
export const scoreChanged = rule.event(['the score changes']);

export const addToScore = rule.block({
  returns: 'none',
  description:
    'Add to the score. Raises "the target is reached" the first time it is enough — handle that to say what winning looks like.',
  say: ['add', param('points'), 'to the score'],
  body: ({points}) => [
    score.set(add(score.of(), points.get())),
    scoreChanged({}),
    note('Enough, and not already won? Then this is the moment.'),
    note('A target of zero is a game that cannot be won, only played.'),
    when([
      [
        both(
          both(moreThan(target.of(), n(0)), atLeast(score.of(), target.of())),
          not(won.of()),
        ),
        [won.set(yes()), targetReached({})],
      ],
    ]),
  ],
});

export const resetScore = rule.block({
  returns: 'none',
  description:
    'Put the score back to nothing and allow the target to be reached again.',
  say: ['reset the score'],
  body: () => [
    note('Both halves: a score that forgot it had won would win twice, and'),
    note('one that remembered could never win again.'),
    score.set(n(0)),
    won.set(no()),
    scoreChanged({}),
  ],
});

export default () => moduleFor(rule, 'score');
