import {CanMove, position, velocity} from './builtins.mjs';
import {
  add,
  addToList,
  allWithTrait,
  atLeast,
  atMost,
  axisOf,
  both,
  countIn,
  countOf,
  defineRule,
  doc,
  emptyOut,
  equals,
  firstActor,
  forEach,
  forEachPlace,
  listHolds,
  makeList,
  mapSize,
  moduleFor,
  over,
  n,
  no,
  not,
  note,
  remainder,
  repeatTimes,
  stopLoop,
  takeFirstOf,
  time,
  times,
  vector,
  vectorLength,
  vectorMinus,
  vectorPlus,
  vectorTimes,
  when,
  withTraitNear,
  yes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Path',
  ability: 'Finds a Way',
  header: `// "Finds a Way" — the next step toward something, around what is in between.
//
// Steering walks INTO things. It works out a direction from two positions and
// goes that way, which is right in the open and wrong the moment there is a
// wall: an actor pinned against the corner of a room, walking on the spot,
// while the thing it wants is three tiles past the corner. That is not a bug in
// Steering; going toward something is all it claims to do.
//
// THIS SEARCHES. It floods outward from the GOAL a square at a time, skipping
// squares something solid is standing in, until the flood reaches the actor —
// and the square the flood arrived FROM is the way to go. One step, recomputed
// on a beat, rather than a route kept and followed: a route needs somewhere to
// remember which square came from which, and a list of places cannot say that.
// One step is also all a chaser needs, because it asks again a moment later.
//
// FROM THE GOAL, NOT FROM THE ACTOR, which is the difference between a search
// per chaser and a search per quarry. Twenty guards after one player flood the
// same ground twenty times either way today; the day this is shared they will
// not, and the flood is already the right way round for it.
//
// THE LATTICE IS THE SEARCH'S, NOT THE WORLD'S. \`step size\` is how far apart the
// squares it considers are, and nothing about the world has to be square: it
// asks what is solid at a PLACE (\`the actors with ⟨Solid⟩ within ⟨…⟩ of ⟨…⟩\`,
// which goes through the spatial index), so a room built of tiles and a room
// built of scattered crates search the same way. A grid game sets the step to
// its tile and the squares land on tile middles.
//
// IT THINKS ON A BEAT. A flood is hundreds of questions, and asking them every
// frame for every chaser is a frozen game — so \`think every\` is a knob, each
// actor's own clock is its own, and what a project sees between two thoughts is
// the same next step held for a moment. Half a second is slower than an eye can
// see and a hundred times cheaper than a frame.
//
// IT SETS A SPEED, exactly as Steering does, which is what makes it compose:
// solid bodies still stop it, drag still slows it, gravity still owns the
// vertical when a project says so. A game that would rather drive the walking
// itself reads \`next place\` and ignores the step.`,
});

rule.uses('Physics');

const finder = rule.trait('Finds a Way');
// It sets a SPEED, which is what makes it compose with everything else that
// does: solid bodies still stop it, drag still slows it. See the header.
finder.uses(CanMove);

export const FindsAWay = rule.traitRef('Finds a Way');

/** What it is heading for. Empty means it stands still, which is a state. */
const goal = finder.actors('going to');
/** How far apart the squares it considers are. A grid game's tile. */
const step = finder.number('step size', 32);
/** How fast it walks a step, in units a second. */
const speed = finder.number('walking speed', 1.5);
/** Seconds between one search and the next. */
const rethink = finder.number('think every', 0.5);
/**
 * How many squares out it will look before giving up.
 *
 * A bound and not a preference: there is no `while` in the language, so the
 * flood is a `repeat`, and this is the number it repeats. Twelve squares is a
 * room and a bit; a hundred is most of a map and most of a frame.
 */
const reach = finder.number('how far to look', 12);
/**
 * The square to walk to, worked out by the last search.
 *
 * Read-only: the step owns it. A project may read it and do its own walking,
 * which is the whole of what "get next position" means.
 */
const next = finder.vector('next place', {x: 0, y: 0}, {readonly: true});
/** Whether the last search found one. Read-only, and the step sets it. */
const found = finder.boolean('has a way', false, {readonly: true});
/** When it last searched. Read-only, and its own, so twenty do not think together. */
const thoughtAt = finder.number('thought at', -1000, {readonly: true});

/** `when ⟨Guard⟩ finds no way` — the cue to give up, go home, stand still. */
const noWay = finder.event(['finds no way']);

/** A direction of length one, or nothing at all for a zero-length one. */
const normalised = v =>
  vectorTimes(v, over(n(1), add(vectorLength(v), n(0.0001))));

/**
 * Whether a place is in the world at all.
 *
 * Without it the flood spreads over the edge and comes back round the outside,
 * which is a way that exists only in the arithmetic: the walker set off upward,
 * left the map, and stood there.
 */
const insideMap = place =>
  both(
    both(
      atLeast(axisOf('x', place), n(0)),
      atMost(axisOf('x', place), axisOf('x', mapSize())),
    ),
    both(
      atLeast(axisOf('y', place), n(0)),
      atMost(axisOf('y', place), axisOf('y', mapSize())),
    ),
  );

/** An actor's middle, as a place. */
const posOf = who => vector(position.x(who), position.y(who));

/** A place snapped onto the search's lattice, so two of them can meet. */
const snapped = (place, size) =>
  vector(
    minusRemainder(axisOf('x', place), size),
    minusRemainder(axisOf('y', place), size),
  );

/**
 * The nearest lattice point to `v` — rounded, not floored.
 *
 * `v - (v mod size)` is the floor, and the floor is wrong here in a way that
 * deadlocks: an actor stops a fraction short of the square it was walking to,
 * the floor puts it in the square BEFORE that one, and the next search answers
 * with the square it is already standing on. It walks nowhere, for ever.
 *
 * Half a size added first is the round, which is what `v` being anywhere IN a
 * square should mean. Written out because there is no `round` block — and it
 * would be the wrong one anyway, since this rounds to the lattice rather than
 * to an integer.
 */
const minusRemainder = (v, size) => {
  const shifted = add(v, over(size, n(2)));
  return add(shifted, times(remainder(shifted, size), n(-1)));
};

const each = rule.local('each', 'Actor');
const quarry = rule.local('quarry', 'Actor');
const here = rule.local('here', 'Vector');
const side = rule.local('side', 'Vector');
const square = rule.local('square', 'Vector');
const mine = rule.local('mine', 'Vector');
const seen = rule.local('seen', 'List');
const queue = rule.local('queue', 'List');

/** The four squares next to `place`, a step apart. */
const neighbours = place => [
  vectorPlus(place, vector(step.of(each.get()), n(0))),
  vectorPlus(place, vector(times(step.of(each.get()), n(-1)), n(0))),
  vectorPlus(place, vector(n(0), step.of(each.get()))),
  vectorPlus(place, vector(n(0), times(step.of(each.get()), n(-1)))),
];

rule.step('think', 'decide', [
  note('One search per actor, on its own beat — never every frame.'),
  forEach(each, {
    from: allWithTrait(FindsAWay),
    body: [
      when([
        [
          atLeast(
            time(),
            add(thoughtAt.of(each.get()), rethink.of(each.get())),
          ),
          [
            thoughtAt.set(each.get(), time()),
            found.set(each.get(), no()),
            note('Nothing to head for is nothing to work out.'),
            when([
              [
                atLeast(countOf(goal.of(each.get())), n(1)),
                [
                  quarry.set(firstActor(goal.of(each.get()))),
                  mine.set(snapped(posOf(each.get()), step.of(each.get()))),
                  doc(
                    'Already standing on it? Then the way is no way at all, which is not the same as not finding one.',
                  ),
                  when([
                    [
                      atMost(
                        vectorLength(
                          vectorMinus(
                            snapped(posOf(quarry.get()), step.of(each.get())),
                            mine.get(),
                          ),
                        ),
                        n(1),
                      ),
                      [
                        next.set(each.get(), mine.get()),
                        found.set(each.get(), yes()),
                      ],
                    ],
                  ]),
                  emptyOut(seen),
                  emptyOut(queue),
                  here.set(snapped(posOf(quarry.get()), step.of(each.get()))),
                  addToList(here.get(), seen),
                  addToList(here.get(), queue),
                  doc(
                    'Flood out from the GOAL until it reaches me. The square it arrived from is the way to walk.',
                  ),
                  repeatTimes(
                    times(
                      times(reach.of(each.get()), reach.of(each.get())),
                      n(4),
                    ),
                    [
                      when([[found.of(each.get()), [stopLoop()]]]),
                      doc(
                        'An empty queue is a way that does not exist — asked BEFORE taking, since what comes off an empty list is not a place to ask about.',
                      ),
                      when([
                        [atMost(countIn(queue.get()), n(0)), [stopLoop()]],
                      ]),
                      here.set(takeFirstOf(queue)),
                      forEachPlace(square, {
                        from: makeList(neighbours(here.get())),
                        body: [
                          when([
                            [
                              both(
                                not(listHolds(seen.get(), square.get())),
                                insideMap(square.get()),
                              ),
                              [
                                addToList(square.get(), seen),
                                note('Am I standing on it? Then this is it.'),
                                when([
                                  [
                                    atMost(
                                      vectorLength(
                                        vectorMinus(square.get(), mine.get()),
                                      ),
                                      n(1),
                                    ),
                                    [
                                      next.set(each.get(), here.get()),
                                      found.set(each.get(), yes()),
                                      stopLoop(),
                                    ],
                                  ],
                                ]),
                                note('Solid there? Then the flood stops here.'),
                                when([
                                  [
                                    equals(
                                      countOf(
                                        withTraitNear(
                                          'Solid Bodies#SolidTrait',
                                          times(step.of(each.get()), n(0.6)),
                                          square.get(),
                                        ),
                                      ),
                                      n(0),
                                    ),
                                    [addToList(square.get(), queue)],
                                  ],
                                ]),
                              ],
                            ],
                          ]),
                        ],
                      }),
                    ],
                  ),
                  when([[not(found.of(each.get())), [noWay({}, each.get())]]]),
                ],
              ],
            ]),
          ],
        ],
      ]),
    ],
  }),
]);

// A SECOND step, in `move`, and separate from the thinking on purpose: a search
// happens twice a second and walking happens sixty times, so they are not the
// same job however close together they read.
rule.step('walk', 'move', [
  note('Walk toward the square the last search picked.'),
  forEach(each, {
    from: allWithTrait(FindsAWay),
    body: [
      when([
        [
          found.of(each.get()),
          [
            side.set(vectorMinus(next.of(each.get()), posOf(each.get()))),
            when(
              [
                [
                  atMost(vectorLength(side.get()), n(1)),
                  [
                    doc(
                      'Standing on it already: the next search will pick the one after, so stop rather than jitter.',
                    ),
                    velocity.set(each.get(), vector(n(0), n(0))),
                  ],
                ],
              ],
              [
                velocity.set(
                  each.get(),
                  vectorTimes(normalised(side.get()), speed.of(each.get())),
                ),
              ],
            ),
          ],
        ],
      ]),
    ],
  }),
]);

export default () => moduleFor(rule, 'path');
