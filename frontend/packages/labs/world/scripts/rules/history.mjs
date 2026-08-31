import {Positional, position, setPosition} from './builtins.mjs';
import {
  add,
  allWithTrait,
  defineRule,
  forEach,
  give,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  note,
  pick,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'History',
  ability: 'Can Be Taken Back',
  header: `// "Can Be Taken Back" — a world that remembers where things were.
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
// THE TAPE IS EIGHT MOVES DEEP, and eight is a limit of what a rule can hold
// rather than an opinion about puzzles. A rule's state is a fixed set of named
// properties and there is no list of PLACES in the vocabulary, so the depth is
// eight properties written out. That turned out to be worth having anyway:
// they are readable, so \`three moves ago of ⟨Crate⟩\` is a question a project
// can ask — to draw the ghost of a move, or to tell a player they are going in
// circles. Remembering a ninth move drops the oldest, which is the only thing
// a full tape can do.
//
// PAST \`moves remembered\` A SLOT HOLDS A LEFTOVER. Nothing is cleared when the
// tape shrinks, because clearing would mean writing a place that is a lie
// rather than leaving one that is stale, and neither is worth eight more
// statements. The number is the guard: it says how many of the eight mean
// anything.
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

/** `one move ago` … `eight moves ago`: the tape, one slot per word. */
const WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
const DEPTH = WORDS.length;

/**
 * How many of the eight slots mean anything.
 *
 * World-scoped, because a move is the world's rather than any actor's: every
 * remembering actor is written on the same push, so one number describes them
 * all. Read-only — `remember this move` and `take back a move` are the ways it
 * changes, and a project that set it by hand would be claiming places nothing
 * had stored.
 */
const remembered = rule.number('moves remembered', 0, {readonly: true});

/** Raised once each time a move is taken back, after everything has moved. */
export const takenBack = rule.event(['a move is taken back']);

const remembers = rule.trait('Remembers Where It Was');
remembers.uses(Positional);

const slots = WORDS.map((word, index) =>
  remembers.point(
    `${word} move${index === 0 ? '' : 's'} ago`,
    {x: 0, y: 0},
    {readonly: true},
  ),
);

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
    'Write down where everything is, just before a move happens. The tape is eight moves deep; a ninth drops the oldest.',
  say: ['remember this move'],
  body: () => [
    note('Oldest first: each slot takes the one in front of it, and then the'),
    note('front takes where the actor is now. Going the other way would copy'),
    note('one place into all eight.'),
    forEach(each, {
      from: remembering(),
      body: [
        ...slots
          .slice(1)
          .reverse()
          .map((slot, offset) => {
            const nearer = slots[DEPTH - 2 - offset];
            return slot.set(
              each.get(),
              nearer.x(each.get()),
              nearer.y(each.get()),
            );
          }),
        slots[0].set(
          each.get(),
          position.x(each.get()),
          position.y(each.get()),
        ),
      ],
    }),
    note('One more remembered, up to eight — past that the tape is full and'),
    note('the oldest move has just been written over.'),
    remembered.set(
      pick(
        lessThan(remembered.of(), n(DEPTH)),
        add(remembered.of(), n(1)),
        n(DEPTH),
      ),
    ),
  ],
});

export const takeBackAMove = rule.block({
  returns: 'none',
  description:
    'Put everything back where it was before the last remembered move. Does nothing if there is nothing to take back.',
  say: ['take back a move'],
  body: () => [
    note('Nothing to take back is not a mistake: a player pressing undo on'),
    note('the first move of a level should see nothing happen, not an error.'),
    when([
      [
        moreThan(remembered.of(), n(0)),
        [
          forEach(each, {
            from: remembering(),
            body: [
              setPosition(
                each.get(),
                slots[0].x(each.get()),
                slots[0].y(each.get()),
              ),
              note('And the tape slides forward: what was two moves ago is'),
              note('one move ago now. The last slot keeps its leftover.'),
              ...slots.slice(0, -1).map((slot, index) => {
                const older = slots[index + 1];
                return slot.set(
                  each.get(),
                  older.x(each.get()),
                  older.y(each.get()),
                );
              }),
              isPutBack({}, each.get()),
            ],
          }),
          remembered.set(minus(remembered.of(), n(1))),
          note('Said last, when everything is already back: a handler that'),
          note('puts a tally right should see the board it belongs to.'),
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
    note('The slots keep whatever they held. Nothing reads them while the'),
    note('count says none of them means anything.'),
    remembered.set(n(0)),
  ],
});

export const canTakeBack = rule.block({
  returns: 'boolean',
  description:
    'Whether there is a move on the tape. Ask it to grey out an undo button, or to say "nothing to undo".',
  say: ['is there a move to take back?'],
  body: () => [give(moreThan(remembered.of(), n(0)))],
});

export default () => moduleFor(rule, 'history');
