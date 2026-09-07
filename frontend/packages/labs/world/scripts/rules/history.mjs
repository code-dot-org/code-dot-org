import {Positional, position, setPosition} from './builtins.mjs';
import {
  add,
  allWithTrait,
  axisOf,
  defineRule,
  doc,
  emptyList,
  forEach,
  give,
  lastOf,
  minus,
  moduleFor,
  moreThan,
  n,
  note,
  vector,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'History',
  ability: 'Undoes Moves',
  purpose: `**History** lets a world remember where things were, so a move can be taken
back.

A puzzle is a game you are meant to get wrong. Killing the player and starting
again is right for an arcade game and hopeless for a sokoban, where the wrong
move was six moves ago. Undo is what makes a puzzle one somebody keeps playing.

Give anything that should be rewindable **Remembers Where It Was**.`,
  header: `// "Undoes Moves" — a world that remembers where things were.
//
// A puzzle is a game you are meant to get wrong. Every other genre here
// forgives a mistake by killing you and starting again, which is right for an
// arcade game and hopeless for a sokoban: the wrong move was six moves ago,
// the board is a mess, and the only ways out are to solve it backwards or to
// throw the level away. Undo is what makes a puzzle a puzzle somebody keeps
// playing, and until this rule no project could write one.
//
// WHAT IT REMEMBERS IS PLACES. One trait, elected by the actors whose
// positions ARE the puzzle — the player, the crates — and taking a move back
// puts every one of them exactly where it was. A wall does not need it. On a
// board, where everything is is the whole of the state, so that is the whole
// of undo.
//
// A MOVE IS NOT A FRAME, so the project says when one happens: \`remember this
// move\` is called just before the move it names. Snapshotting every frame
// would fill the tape in an eighth of a second, and nothing here can tell a
// turn from a tick — a turn is a decision the game makes, and this rule has
// never seen the game. The tape is the rule's; what counts as a move is the
// project's.
//
// THE TAPE GOES BACK TO THE START OF THE LEVEL, and it used to be eight moves
// deep. Eight was never an opinion about puzzles: a rule's state was a fixed
// set of named properties and there was no list of PLACES in the vocabulary, so
// the depth was eight properties written out — \`one move ago\` through \`eight
// moves ago\` — and the limit was documented rather than chosen.
//
// A list is one property (specs/LISTS.md), so there is no depth to choose and
// nothing to explain. A move is a Vector; a hundred moves is a hundred of them,
// which is nothing, and a puzzle that can be taken back to its first move is
// the forgiving thing the tile asked for in the first place.
//
// WHAT WAS LOST WITH THE SLOTS is that they were readable: \`three moves ago of
// ⟨Crate⟩\` was a question a project could ask, to draw the ghost of a move or
// to tell a player they are going in circles. Asking into a list wants an
// index, and there is no index block yet — \`last of\` is the whole of what a
// stack needs, so it is the whole of what was built.
//
// IT PUTS BACK POSITIONS AND NOTHING ELSE — not scores, not health, not
// whether a door was opened. Some of that repairs itself and it is worth
// seeing why: a score kept the way a mark-counting puzzle keeps one, by
// counting crates arriving on marks and leaving them, is right the instant the
// crates move, because it was never a tally — it was a question about the
// world, asked at the moments that could change the answer. A tally is what
// has to be put back by hand, and \`a move is taken back\` is where a project
// does it.
//
// TAKING A MOVE BACK MID-MOVE IS A RACE THIS CANNOT WIN. Grid slides an actor
// across a tile over a tenth of a second and owns its position for the length
// of that step; an undo during one puts the actor back and the slide carries
// on to where it was going. Ask between moves — a project can guard with \`is
// stepping?\` — or, as most games do, put undo on a key the player presses once
// they have stopped.`,
});

/**
 * How many moves are on the tape.
 *
 * World-scoped, because a move is the world's rather than any actor's: every
 * remembering actor is written on the same push, so one number describes them
 * all — and it is still the right answer in a world where nothing remembers
 * anything, which a tape's length is not.
 *
 * Read-only: `remember this move` and `take back a move` are the ways it
 * changes, and a project that set it by hand would be claiming places nothing
 * had stored.
 */
const remembered = rule.number('moves remembered', 0, {readonly: true});

/** Raised once each time a move is taken back, after everything has moved. */
export const takenBack = rule.event(['a move is taken back']);

const remembers = rule.trait('Remembers Where It Was');
remembers.uses(Positional);

/**
 * Everywhere this actor has been, oldest first.
 *
 * The whole of what was eight properties. Read-only, because the two verbs are
 * the way on and off it — a project that wrote the tape by hand would be
 * telling a game it had been somewhere it never was.
 */
const tape = remembers.vectors('where it was', {readonly: true});

export const RemembersWhereItWas = rule.traitRef('Remembers Where It Was');

/**
 * `when ⟨Crate⟩ is put back` — this actor, in particular, has just moved back.
 *
 * The world event says a move was taken back; this says which actors it moved,
 * which is what an actor that wants to flash or squash needs, and is a thing
 * an `.actor` file can hear at all.
 */
const isPutBack = remembers.event(['is put back']);

const each = rule.local('each', 'Actor');

/** Everything that asked to be remembered. */
const remembering = () => allWithTrait(RemembersWhereItWas);

export const rememberThisMove = rule.block({
  returns: 'none',
  description:
    'Write down where everything is, just before a move happens. The tape goes back as far as the game has been played.',
  say: ['remember this move'],
  body: () => [
    note('Where everything is, on the end of its own tape.'),
    forEach(each, {
      from: remembering(),
      body: [
        tape.push(
          each.get(),
          vector(position.x(each.get()), position.y(each.get())),
        ),
      ],
    }),
    doc(
      'One more remembered, and no ceiling to stop at: a move is a place, and a hundred places is nothing to keep.',
    ),
    remembered.set(add(remembered.of(), n(1))),
  ],
});

export const takeBackAMove = rule.block({
  returns: 'none',
  description:
    'Put everything back where it was before the last remembered move. Does nothing if there is nothing to take back.',
  say: ['take back a move'],
  body: () => [
    doc(
      'Nothing to take back is not a mistake: a player pressing undo on the first move of a level should see nothing happen, not an error.',
    ),
    when([
      [
        moreThan(remembered.of(), n(0)),
        [
          forEach(each, {
            from: remembering(),
            body: [
              note('The last place it was, and then that place is spent.'),
              setPosition(
                each.get(),
                axisOf('x', lastOf(tape.of(each.get()))),
                axisOf('y', lastOf(tape.of(each.get()))),
              ),
              tape.takeLast(each.get()),
              isPutBack({}, each.get()),
            ],
          }),
          remembered.set(minus(remembered.of(), n(1))),
          doc(
            'Said last, when everything is already back: a handler that puts a tally right should see the board it belongs to.',
          ),
          takenBack({}),
        ],
      ],
    ]),
  ],
});

export const forgetEverything = rule.block({
  returns: 'none',
  description:
    'Throw the tape away — for a level that has just been built, where there is nothing before the start.',
  say: ['forget everything'],
  body: () => [
    doc(
      'Every tape as well as the count, which the eight slots never had to do: a slot nobody reads is harmless, and a list nobody empties is a level’s worth of places kept for a level that is gone.',
    ),
    forEach(each, {
      from: remembering(),
      body: [tape.set(each.get(), emptyList())],
    }),
    remembered.set(n(0)),
  ],
});

export const canTakeBack = rule.block({
  returns: 'boolean',
  description:
    'Whether there is a move on the tape. Ask it to gray out an undo button, or to say "nothing to undo".',
  say: ['is there a move to take back?'],
  body: () => [
    doc(
      'Whether anything has been remembered yet. Worth asking before offering an undo button, so the first move of a game does not offer to take back a move nobody made.',
    ),
    give(moreThan(remembered.of(), n(0))),
  ],
});

export default () => moduleFor(rule, 'history');
