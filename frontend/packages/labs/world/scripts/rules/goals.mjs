import {
  allWithTrait,
  defineRule,
  doc,
  either,
  forEach,
  give,
  moduleFor,
  no,
  not,
  note,
  when,
  yes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Goals',
  ability: 'Has an Ending',
  header: `// "Has an Ending" — the two moments every game has and no rule owned.
//
// Everything in this library runs forever. Scoring can say the target has been
// reached, Health can say an actor died, Collection can say you took the last
// coin — and none of those is a GAME being over. Each project has written that
// for itself, out of a world property and a flag it remembered to check, and
// each has written it slightly differently.
//
// So this owns the state and nothing else: won, lost, and the way back to
// neither. What MAKES you win is the project's, and it says so by routing one
// of its own moments in:
//
//     when the target is reached      →   win the game
//     when ⟨any Player⟩ dies          →   lose the game
//     when ⟨any Player⟩ touches ⟨Flag⟩ →  win the game
//
// SCORING SAYS THERE IS NO "lose the game" IN IT, and that is still true and is
// why this exists. A score is a number and the moment it is enough; losing is
// not about the score, so putting it there would have been a second unrelated
// idea in one rule. Here the two belong together, because "won" and "lost" are
// the same fact with a different answer, and a game that could be both at once
// is a bug in whoever wrote it rather than a state anybody wants.
//
// THE FIRST ENDING WINS. Losing after you have won does nothing, winning twice
// raises nothing the second time, and both are guarded in one place rather than
// in every handler that might fire twice. That is the thing every project got
// slightly wrong on its own: a player who reaches the flag as the last spike
// touches them should see one ending, and which one is decided by which
// happened first.
//
// IT STOPS NOTHING. A won game keeps running — the player can still walk, the
// enemies still patrol — because "stop" means something different in every
// game: a puzzle freezes, an arcade game plays a death animation, a story
// carries on talking. What a project writes is what its ending looks like, and
// this only says which ending it is.
//
// THERE IS NO "restart the world" EITHER, for the same reason one level up.
// Starting again is \`clear world\` and putting the level back, which the project
// already knows how to do and this rule cannot: it has never seen the level.
// \`start again\` is the STATE going back to neither, and the event that says so
// is where a project hangs the rebuilding.
//
// IT DECLARES ITS EVENTS TWICE, which is Scoring's shape and is here for its
// reason. A world event registers on the world and an \`.actor\` file has no
// binding for one, so a banner — which is an actor — could not hear the thing
// it exists to show. "Watches the Ending" is what lets it say
//
//     when ⟨this actor⟩ sees the game won  →  set my text to "YOU WIN"`,
});

// Read-only, both of them: `win the game` is the way, and a project that set
// these by hand would move the state without anything being told — which is
// exactly the bug the events exist to prevent.
const won = rule.boolean('won', 'false', {readonly: true});
const lost = rule.boolean('lost', 'false', {readonly: true});

/** Raised the first time the game is won, and only then. */
export const gameWon = rule.event(['the game is won']);
/** Raised the first time the game is lost, and only then. */
export const gameLost = rule.event(['the game is lost']);
/** Raised whenever the state goes back to neither — where a level rebuilds. */
export const gameRestarted = rule.event(['the game starts again']);

/**
 * Elected by whatever shows the ending — a banner, a door, a sound.
 *
 * It carries no properties. What an actor gets by electing it is the right to
 * be told, which is the whole of a display's job (Scoring's is the same).
 */
const watches = rule.trait('Watches the Ending');
export const WatchesTheEnding = rule.traitRef('Watches the Ending');
const seesWon = watches.event(['sees the game won']);
const seesLost = watches.event(['sees the game lost']);
const seesRestart = watches.event(['sees a new game']);

const each = rule.local('each', 'Actor');

/** Tell the world, then the actors that asked to hear it. */
const announce = (worldEvent, actorEvent) => [
  worldEvent({}),
  forEach(each, {
    from: allWithTrait(rule.traitRef('Watches the Ending')),
    body: [actorEvent({}, each.get())],
  }),
];

/** Whether either ending has happened — the guard, and a question worth asking. */
const isOver = () => either(won.of(), lost.of());

export const gameIsOver = rule.block({
  returns: 'boolean',
  description:
    'Whether this game has ended, either way. Ask it before doing something a finished game should not do.',
  say: ['the game is over?'],
  body: () => [
    note('Won or lost: an ending is an ending, whichever one it was.'),
    give(isOver()),
  ],
});

export const winTheGame = rule.block({
  returns: 'none',
  description:
    'End the game as a win, unless it has already ended. Raises "the game is won" — handle that to say what winning looks like.',
  say: ['win the game'],
  body: () => [
    doc(
      'Only if nothing has ended yet: the first ending is the one that counts, so winning after losing does nothing at all.',
    ),
    when([[not(isOver()), [won.set(yes()), ...announce(gameWon, seesWon)]]]),
  ],
});

export const loseTheGame = rule.block({
  returns: 'none',
  description:
    'End the game as a loss, unless it has already ended. Raises "the game is lost".',
  say: ['lose the game'],
  body: () => [
    doc(
      'The same guard, and it is the same reason: a player who reaches the flag as the last spike touches them sees one ending, not two.',
    ),
    when([[not(isOver()), [lost.set(yes()), ...announce(gameLost, seesLost)]]]),
  ],
});

export const startAgain = rule.block({
  returns: 'none',
  description:
    'Put the game back to neither won nor lost. Raises "the game starts again" — handle that to build the level again.',
  say: ['start again'],
  body: () => [
    doc(
      'Both flags, and not one: a game that forgot it had lost but remembered it had won could never be played again.',
    ),
    won.set(no()),
    lost.set(no()),
    doc(
      'The state is back. What a new game LOOKS like is the project’s, and this event is where it puts the level back.',
    ),
    ...announce(gameRestarted, seesRestart),
  ],
});

export default () => moduleFor(rule, 'goals');
