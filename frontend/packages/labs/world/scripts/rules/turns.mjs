import {
  add,
  allWithTrait,
  defineRule,
  doc,
  equals,
  filter,
  forEach,
  give,
  moduleFor,
  n,
  param,
  remainder,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Turns',
  ability: 'Takes Turns',
  header: `// "Takes Turns" — a game where time is a sequence rather than a rate.
//
// Everything else in this library happens at a RATE. Physics moves an actor so
// many pixels a second, Time fires every so many seconds, and a frame is a
// sixtieth of a second whether or not anything happened in it. A board game is
// not like that: nothing happens until somebody moves, and then everything
// happens at once. An enemy on a timer is a different game — one the player is
// racing — and a puzzle where thinking is free needs a clock only the player
// can wind.
//
// SO THE PROJECT SAYS WHEN A TURN HAPPENS, with \`end the turn\`, and this rule
// says who acts and how often. Nothing here watches for a move: what counts as
// one is exactly the thing that differs between a sokoban (a step that
// finished), a card game (a card played) and a roguelike (a step, or an attack,
// or a wait), and a rule that guessed would be wrong in two of the three.
//
// WHERE TO CALL IT is the whole lesson. On the move that HAPPENED, not on the
// key that asked for one: Grid raises \`finishes a step\` on arrival and \`is
// blocked\` on a refusal, so
//
//     when ⟨Player⟩ finishes a step  →  end the turn
//
// is a game where walking into a wall costs nothing — which is what every
// player expects, and what a handler on the key press gets wrong.
//
// AN ACTOR ACTS BY BEING TOLD, not by asking. A taker hears \`takes its turn\`
// and does whatever it does: step toward the player, open a door, grow. It
// never asks whose turn it is, so an enemy written for one game works in the
// next, and a second enemy can be added without touching the first.
//
// SLOWNESS IS A NUMBER ON THE ACTOR. \`turns per move\` is 1 for something that
// moves every turn and 2 for something that moves every other one, which is
// how a board game says slow: a snail is not an enemy at half speed, it is an
// enemy that misses turns. Zero is never, which freezes one without taking
// anything away from it.
//
// THE ORDER TAKERS ACT IN is the order the world holds them, which is the order
// they were added, and this rule does not sort them. Two enemies stepping into
// one square is Grid's problem and Grid has an answer (the second is refused);
// a game that needs a real initiative order wants more than this and should
// keep its own list.
//
// IT DOES NOT WAIT FOR ANYBODY, and that is a loss taken on purpose. Everything
// asked to move is told in the same frame, and a Grid step animates over the
// tenth of a second after it, so the player's next turn can begin while an
// enemy is still sliding. Waiting would mean knowing when everybody had
// finished, which means every taker reporting back — and a taker that forgets,
// or that was blocked and never moved at all, would freeze the game for good. A
// slide that overlaps the next turn looks alive; a deadlock is unplayable.`,
});

/**
 * How many turns have gone by.
 *
 * Read-only: `end the turn` is the way it moves, because a project that set it
 * by hand would advance the clock without anybody being told to act — which is
 * the whole of what this rule does.
 */
const taken = rule.number('turns taken', 0, {readonly: true});

/** Raised once per turn, after everybody who acts has been told to. */
export const turnPasses = rule.event(['a turn passes']);

const takes = rule.trait('Takes a Turn');

/**
 * One move every this many turns. One is every turn; zero is never.
 *
 * A whole number and nothing checks it: 2.5 turns per move is a thing a
 * learner may type, and what it does (move on turn 0 and then never, since no
 * whole number divides by 2.5 evenly) is strange enough to be its own answer.
 */
const perMove = takes.number('turns per move', 1);

/** `when ⟨Enemy⟩ takes its turn` — where a taker does whatever it does. */
const takesItsTurn = takes.event(['takes its turn']);

export const TakesATurn = rule.traitRef('Takes a Turn');

const each = rule.local('each', 'Actor');

export const endTheTurn = rule.block({
  returns: 'none',
  description:
    'Say that a turn has happened: everything that takes turns is told to act, and the count goes up. Call it on the move that happened — Grid’s "finishes a step" — rather than on the key that asked for one.',
  say: ['end the turn'],
  body: () => [
    doc(
      'Counted first, so a handler that asks how many turns have gone by sees this one. A turn that is happening has happened.',
    ),
    taken.set(add(taken.of(), n(1))),
    doc(
      'Everything that takes turns, except the ones this turn is not theirs: a snail with 2 turns per move acts on the even ones.',
    ),
    forEach(each, {
      from: filter(each, {
        from: allWithTrait(TakesATurn),
        where: equals(remainder(taken.of(), perMove.of(each.get())), n(0)),
      }),
      body: [takesItsTurn({}, each.get())],
    }),
    doc(
      'Said last, when everybody has been told: a world handler that keeps its own books should see the turn already dealt out.',
    ),
    turnPasses({}),
  ],
});

export const startTheTurnsAgain = rule.block({
  returns: 'none',
  description:
    'Put the turn count back to nothing, for a level that has just been built.',
  say: ['start the turns again'],
  body: () => [
    doc(
      'Back to nought turns taken. A new game, a new level, or a puzzle being reset — whatever counts as starting over is the project\u2019s to decide, and this is how it says so.',
    ),
    taken.set(n(0)),
  ],
});

export const everyNTurns = rule.block({
  returns: 'boolean',
  description:
    'Whether the turn just taken is one of every so many — for a project that spawns something on every fifth turn. Ask it while a turn is passing.',
  say: ['every', param('how many', 'number'), 'turns?'],
  body: refs => [
    doc(
      'Turn zero divides by everything, so this is true before the game has begun — ask it in "a turn passes", where turn zero never is.',
    ),
    give(equals(remainder(taken.of(), refs['how many'].get()), n(0))),
  ],
});

export default () => moduleFor(rule, 'turns');
