import {position, setPosition} from './builtins.mjs';
import {
  add,
  allWithTrait,
  anyOf,
  atMost,
  axisOf,
  both,
  defineRule,
  doc,
  filter,
  firstActor,
  frameTime,
  give,
  hasTrait,
  minus,
  moduleFor,
  n,
  no,
  not,
  note,
  over,
  param,
  thisActor,
  time,
  vector,
  vectorLength,
  vectorMinus,
  vectorPlus,
  vectorTimes,
  when,
  yes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Grid',
  ability: 'Moves on a Grid',
  purpose: `**Grid** moves things a whole tile at a time instead of by pixels.

Every other kind of movement here is continuous — a speed, applied every frame.
That is right for a platformer and wrong for Sokoban, Pac-Man, Snake or
anything on a board, where a thing is *on* a square rather than between two.

Give the mover **Steps on the Grid**, anything occupying a square **Fills a
Tile**, and anything shovable **Can Be Pushed**.`,
  header: `// "Moves on a Grid" — a world of whole tiles instead of pixels.
//
// Every other way of moving in this library is CONTINUOUS: Physics gives an
// actor a speed and moves it by that speed every frame, and Arrow Keys, Drive,
// Patrol and Steering all work by setting one. That is right for a platformer
// and wrong for a whole family of games that were never expressible here —
// Sokoban, Pac-Man, Snake, a roguelike, anything on a board. In those the
// question is never "how fast", it is "which square next".
//
// So this moves an actor ONE TILE AT A TIME, and refuses a step it cannot
// finish. An actor is either standing on a tile or crossing to the next one,
// and never anywhere else — which is what makes a board game a board game: the
// state is countable, and two things cannot half-share a square.
//
// IT DOES NOT USE PHYSICS, and that is deliberate rather than an omission. A
// velocity would let a step be interrupted mid-tile by anything else that
// writes one, and an actor stopped between squares is a game with no legal
// answer to "where is it". This writes \`position\` directly, in \`move\`, and
// owns the actor's whereabouts for the length of a step.
//
// THREE TRAITS, because a board has three kinds of thing on it:
//
//   Steps on the Grid  — a thing that moves a square at a time. The player.
//   Fills a Tile       — a thing a step cannot enter. A wall.
//   Can Be Pushed      — a wall that gives way. A crate.
//
// A wall is the second alone; a crate is all three, because a crate blocks you
// AND moves AND yields. That is the whole of Sokoban's rule set, and it falls
// out of naming the three kinds separately rather than inventing a "sokoban
// mode".
//
// PUSHING IS PART OF STEPPING, not a thing the project writes. It has to be:
// deciding whether a step is legal means looking at what is in the target
// square, and if that thing can be pushed the answer depends on the square
// BEYOND it. A project that had to write that would be writing the rule's own
// refusal logic in blocks, and getting it subtly wrong — the classic bug being
// a crate pushed into another crate.
//
// A STEP TAKES TIME so the eye can follow it, and the timing is a deadline
// rather than a speed. Each frame covers the fraction of what is left that
// this frame is of the time left, which arrives exactly on the deadline
// whatever the frame rate does, and needs no memory of where the step began.
// A slow frame makes a longer jump rather than a late arrival.
//
// TILE SIZE IS THE ACTOR'S, not the world's. The engine has a tile size and the
// map editor draws that grid, but an actor is the thing that has to agree with
// its own neighbours, and a project with two grids in it (a board and a
// sidebar) is a project this does not have to argue with. The default is the
// map editor's, so an actor placed on the grid steps along it.`,
});

// ── The three kinds of thing on a board ──────────────────────────────────────

/**
 * A thing a step cannot enter.
 *
 * No properties: filling a tile is a fact about a thing, not a setting. A wall
 * is an actor that has this and nothing else, which is as small as a wall
 * should be.
 */
rule.trait('Fills a Tile');
export const FillsATile = rule.traitRef('Fills a Tile');

const mover = rule.trait('Steps on the Grid');

/**
 * How big a square is, in pixels.
 *
 * The map editor's tile by default, so an actor dropped on the grid steps
 * along it. An actor's own rather than the world's, so two boards at two
 * scales can share a project.
 */
const tileSize = mover.number('tile size', 32);

/** How long one square takes. Short enough to feel responsive, long enough to see. */
const stepTime = mover.number('step time', 0.12);

/**
 * Whether a step is in progress.
 *
 * Read-only, and the guard on everything: a second step cannot begin while one
 * is running, which is what stops a held key from sliding an actor smoothly
 * across the board and turning it back into Physics.
 */
const stepping = mover.boolean('is stepping', false, {readonly: true});

/**
 * The square being crossed to. Meaningless while not stepping.
 *
 * A vector rather than a point, so it can be added to and subtracted from in
 * one expression — `position` is a point and reports one axis at a time, which
 * is right for a learner reading "the x of" and wrong for arithmetic.
 */
const target = mover.vector('step target', {x: 0, y: 0}, {readonly: true});

/** The moment the step is due to finish. A deadline, not a speed — see the header. */
const arriveAt = mover.number('step ends at', 0, {readonly: true});

/**
 * A wall that gives way.
 *
 * Uses both of the others, and has to: something pushed must block you (or
 * stepping into it would not push it) and must move (or it could not go
 * anywhere).
 */
const pushable = rule.trait('Can Be Pushed');
pushable.uses(FillsATile);
pushable.uses(rule.traitRef('Steps on the Grid'));
export const CanBePushed = rule.traitRef('Can Be Pushed');
export const StepsOnTheGrid = rule.traitRef('Steps on the Grid');

// ── Events ───────────────────────────────────────────────────────────────────

/** `when ⟨Player⟩ finishes a step` — raised on arrival, once per square. */
const arrives = mover.event(['finishes a step']);

/**
 * `when ⟨Player⟩ is blocked` — raised when a step was asked for and refused.
 *
 * Worth an event of its own because it is the moment a game wants a sound, a
 * bump animation, or a hint. Silence would leave a project unable to tell
 * "walked into a wall" from "never pressed anything".
 */
const blocked = mover.event(['is blocked']);

// ── Reading the board ────────────────────────────────────────────────────────

const found = rule.local('found', 'Actor');

/** Half a tile: near enough the same square, whatever floating point did. */
const half = () => over(tileSize.of(thisActor()), n(2));

/**
 * `⟨Player⟩ is stepping?` — for a project that wants to wait for an arrival.
 */
mover.block({
  returns: 'boolean',
  description: 'Whether this actor is part-way between two squares.',
  say: ['is stepping?'],
  body: () => [give(stepping.of(thisActor()))],
});

/** An actor's position as one value, for arithmetic. */
const posOf = who => vector(position.x(who), position.y(who));

/** Put an actor exactly on a point. */
const moveTo = (who, where) =>
  setPosition(who, axisOf('x', where), axisOf('y', where));

/** One square along `by` (a tile offset like 0,-1), from a point. */
const oneOver = (from, by) =>
  vectorPlus(from, vectorTimes(by, tileSize.of(thisActor())));

/**
 * The actor filling the square at `where`, if any.
 *
 * A JS helper rather than a block: it is used three times inside one step, and
 * a project never needs to ask it — what a project wants to know is whether it
 * may step, which the step itself answers by refusing.
 *
 * WITHIN HALF A TILE counts as the same square. Positions are floats and a
 * step lands on its target exactly, but an actor placed by hand in the map
 * editor is only as square as the person who dragged it.
 */
const fillerAt = where =>
  firstActor(
    filter(found, {
      from: allWithTrait(FillsATile),
      where: atMost(
        vectorLength(vectorMinus(posOf(found.get()), where)),
        half(),
      ),
    }),
  );

// ── Stepping ─────────────────────────────────────────────────────────────────

const into = rule.local('into', 'Actor');
const beyond = rule.local('beyond', 'Actor');

/** Book a step: where it ends, and when. */
const begin = (who, by) => [
  target.set(who, oneOver(posOf(who), by)),
  arriveAt.set(who, add(time(), stepTime.of(who))),
  stepping.set(who, yes()),
];

/**
 * The step, once.
 *
 * `across` and `down` are TILE offsets, not pixels: -1, 0 or 1 each. The four
 * named actions below are this with the numbers filled in, and they exist
 * because `step ⟨Player⟩ up` is what a learner means. This one exists because
 * they are all the same dozen blocks, and four copies is four places for the
 * answer to differ — Patrol's argument, and the reason this rule is a quarter
 * of the size it was when they were four copies.
 *
 * It is also useful on its own: a diagonal is `across 1 down 1`, and a knight
 * moves `across 1 down 2`, neither of which anybody had to think about here.
 *
 * THE ORDER OF THE TESTS IS THE GAME. Nothing there, go. Something there that
 * cannot be pushed, refuse. Something there that can, look one further: a free
 * square moves both, an occupied one refuses both. That last case is the one a
 * project would get wrong by hand, and it is the difference between Sokoban
 * and a game where crates eat each other.
 */
const stepBy = mover.block({
  returns: 'none',
  description:
    'Move a whole number of squares across and down, if the way is clear. Pushes what can be pushed, and raises “is blocked” when it cannot.',
  say: ['step', param('across', 'number'), param('down', 'number')],
  body: ({across, down}) => {
    const by = () => vector(across.get(), down.get());
    return [
      note('One step at a time: a held key must not slide us off the grid.'),
      when([
        [
          not(stepping.of(thisActor())),
          [
            into.set(fillerAt(oneOver(posOf(thisActor()), by()))),
            when([
              [
                not(anyOf(into.get())),
                [note('Nothing in the way.'), ...begin(thisActor(), by())],
              ],
              [
                both(
                  hasTrait(into.get(), CanBePushed),
                  not(stepping.of(into.get())),
                ),
                [
                  doc(
                    'A crate. It goes only if the square past it is free — the test a project writes wrong by hand, and the difference between Sokoban and crates eating crates.',
                  ),
                  beyond.set(fillerAt(oneOver(posOf(into.get()), by()))),
                  when([
                    [
                      not(anyOf(beyond.get())),
                      [...begin(into.get(), by()), ...begin(thisActor(), by())],
                    ],
                    [yes(), [blocked({}, thisActor())]],
                  ]),
                ],
              ],
              [yes(), [blocked({}, thisActor())]],
            ]),
          ],
        ],
      ]),
    ];
  },
});

/**
 * `step ⟨Player⟩ up` and its three siblings.
 *
 * Thin: each is the general step with its numbers filled in. What they buy is
 * that a learner writing a keyboard handler says the direction rather than
 * spelling it as a pair of numbers whose sign convention they have to know.
 */
const named = (which, across, down) =>
  mover.block({
    returns: 'none',
    description: `Move one square ${which}, if the way is clear.`,
    say: ['step', which],
    body: () => [stepBy({across: n(across), down: n(down)}, thisActor())],
  });

named('up', 0, -1);
named('down', 0, 1);
named('left', -1, 0);
named('right', 1, 0);

// ── Crossing ─────────────────────────────────────────────────────────────────

const remaining = rule.local('remaining', 'Number');

mover.step('cross the square', 'move', [
  when([
    [
      stepping.of(thisActor()),
      [
        remaining.set(minus(arriveAt.of(thisActor()), time())),
        when([
          [
            atMost(remaining.get(), n(0)),
            [
              doc(
                'Due, or overdue. Land exactly on the square — an actor a pixel off its tile is a board that stops adding up.',
              ),
              moveTo(thisActor(), target.of(thisActor())),
              stepping.set(thisActor(), no()),
              arrives({}, thisActor()),
            ],
          ],
          [
            yes(),
            [
              doc(
                'Cover the fraction of what is left that this frame is of the time left. Arrives on the deadline at any frame rate, and needs no memory of where the step began.',
              ),
              moveTo(
                thisActor(),
                vectorPlus(
                  posOf(thisActor()),
                  vectorTimes(
                    vectorMinus(target.of(thisActor()), posOf(thisActor())),
                    over(frameTime(), remaining.get()),
                  ),
                ),
              ),
            ],
          ],
        ]),
      ],
    ],
  ]),
]);

export default () => moduleFor(rule, 'grid');
