import {Positional, intrinsicSize, position, scale} from './builtins.mjs';
import {
  absolute,
  add,
  axisOf,
  both,
  clearActors,
  defineRule,
  equals,
  forEach,
  give,
  hasTrait,
  isIn,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  not,
  note,
  over,
  param,
  pushActor,
  thisActor,
  vector,
  vectorTimes,
  yes,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Collisions',
  ability: 'Notices Collisions',
  header: `// "Notices Collisions" — who is touching whom, worked out once.
//
// It only NOTICES. What to do about a contact — push apart, land, take damage,
// collect a coin — belongs to whoever reads the list, which is why this rule
// and Solid Bodies are two rules rather than one.
//
// It runs in \`touch\`, after positions have been integrated and before anything
// responds: an overlap is a fact about where things ARE, so it has to be worked
// out from where they ended up.`,
});
rule.uses('Physics');

const canCollide = rule.trait('Can Collide');
canCollide.uses(Positional);

/** Set it yourself, or leave it at zero and let the picture decide. */
const box = canCollide.point('size', {x: 0, y: 0});
/** Everything this actor is touching, as of this tick. Written by the step. */
const contacts = canCollide.actors('contacts', {readonly: true});

export const CanCollide = rule.traitRef('Can Collide');
export {box as size, contacts};

const working = rule.local('box', 'Vector');

/**
 * How big an actor is for bumping.
 *
 * Three answers in order of preference, because an actor may have said nothing:
 * what you set, what its picture is, and failing both a 32 by 32 square.
 */
export const collisionSizeOf = rule.block({
  returns: 'vector',
  description:
    'How big this actor is for bumping: its size, its picture, or 32 by 32.',
  say: ['collision size of', param('sizeActor', 'actor')],
  body: ({sizeActor}) => {
    /** Whether we have a real box yet — zero on either axis means we do not. */
    const decided = both(
      moreThan(axisOf('x', working.get()), n(0)),
      moreThan(axisOf('y', working.get()), n(0)),
    );
    return [
      note('How big is this actor for bumping into things?'),
      note('First choice: the size you set on the actor yourself.'),
      working.set(vector(box.x(sizeActor.get()), box.y(sizeActor.get()))),
      note('If you left it at 0, use the size of the picture instead.'),
      when([
        [
          not(decided),
          [
            working.set(
              vector(
                intrinsicSize.x(sizeActor.get()),
                intrinsicSize.y(sizeActor.get()),
              ),
            ),
          ],
        ],
      ]),
      note('And if there is no picture either, use a 32 by 32 square.'),
      when([[not(decided), [working.set(vector(n(32), n(32)))]]]),
      note(
        'Bigger or smaller actors get bigger or smaller boxes: multiply by scale.',
      ),
      give(
        vectorTimes(
          working.get(),
          vector(
            absolute(scale.x(sizeActor.get())),
            absolute(scale.y(sizeActor.get())),
          ),
        ),
      ),
    ];
  },
});

const boxA = rule.local('boxA', 'Vector');
const boxB = rule.local('boxB', 'Vector');

/** Whether two boxes overlap: their middles are close on both axes. */
export const isTouching = rule.block({
  returns: 'boolean',
  description: 'Whether these two actors’ boxes are overlapping right now.',
  say: [param('a', 'actor'), 'is touching', param('b', 'actor')],
  body: ({a, b}) => {
    const closeOn = which =>
      lessThan(
        absolute(
          minus(position.axis(which, a.get()), position.axis(which, b.get())),
        ),
        over(add(axisOf(which, boxA.get()), axisOf(which, boxB.get())), n(2)),
      );
    return [
      note(
        'Two boxes overlap when their middles are close on BOTH directions.',
      ),
      note(
        'Close enough means: less than half of one box plus half of the other.',
      ),
      boxA.set(collisionSizeOf({sizeActor: a.get()})),
      boxB.set(collisionSizeOf({sizeActor: b.get()})),
      give(both(closeOn('x'), closeOn('y'))),
    ];
  },
});

const body = rule.local('body', 'Actor');
const other = rule.local('other', 'Actor');
const found = rule.local('found', 'Actor');

rule.step('find', 'touch', [
  note('Who is touching whom, worked out once and written down.'),
  note('What to DO about it belongs to whoever reads this.'),
  forEach(body, {
    where: hasTrait(body.get(), CanCollide),
    body: [
      clearActors(found),
      forEach(other, {
        where: both(
          hasTrait(other.get(), CanCollide),
          not(equals(other.get(), body.get())),
        ),
        body: [
          when([
            [
              isTouching({a: body.get(), b: other.get()}),
              [pushActor(found, other.get())],
            ],
          ]),
        ],
      }),
      contacts.set(body.get(), found.get()),
    ],
  }),
]);

/**
 * What was touching this actor at the END of the last tick.
 *
 * The one thing a contact set cannot answer about itself: `contacts` says who
 * is touching now, and "now" is true every frame an overlap lasts. Comparing
 * the two is what turns a state into the moments it begins and ends.
 *
 * Read-only, and written by the step below rather than by `find`: it has to be
 * updated AFTER the comparison, so a rule that wrote it where the contacts are
 * worked out would erase the very thing being compared against.
 */
const contactsBefore = canCollide.actors('contacts before', {readonly: true});

/**
 * Contact as MOMENTS, not as a state — and the sets those moments are about.
 *
 * `is touching` and `contacts` are both polls: true for every frame an overlap
 * lasts. That is the honest answer to the question they ask, and it is the
 * wrong shape for almost everything a game does about a collision — a brick
 * that scores while it is being touched scores sixty times, and a bounce
 * applied every frame of an overlap is not a bounce.
 *
 * So: the same edge pair as everywhere else here. `rules/input` turns held keys
 * into `presses`/`releases`, Gravity turns falling into `starts`/`stops
 * falling`, and this turns an overlap into its two ends.
 *
 * ONE EVENT PER CONTACT, carrying the actor — the same shape `rules/input` uses
 * when it raises its key event once per key it is looping over. A first draft
 * raised one event per FRAME in which anything new arrived, which is a
 * different thing wearing the same name: a ball clipping two bricks in one
 * frame started touching twice and would have been told once.
 *
 * The handler reads what arrived with `event value`, which is untyped for
 * exactly this reason and so plugs into any actor socket:
 *
 *     when ⟨this actor⟩ starts touching
 *       if ⟨event value⟩ is a ⟨Brick⟩ → remove actor ⟨event value⟩
 *
 * The lists stay, because they answer a question the events cannot: what is
 * true NOW, pollable from a step the way `contacts` is. An event is a moment
 * that has passed by the time anything else looks.
 */
const newlyTouching = canCollide.actors('newly touching', {readonly: true});
const noLongerTouching = canCollide.actors('no longer touching', {
  readonly: true,
});

export const startsTouching = canCollide.event([
  'starts touching',
  param('other', 'actor'),
]);
export const stopsTouching = canCollide.event([
  'stops touching',
  param('other', 'actor'),
]);

const met = rule.local('met', 'Actor');
const gone = rule.local('gone', 'Actor');
const arrived = rule.local('arrived', 'Actor');
const left = rule.local('left', 'Actor');
const told = rule.local('told', 'Actor');
const untold = rule.local('untold', 'Actor');

// In `react`, after `touch` has worked out the contacts and `settle` has pushed
// bodies apart. Both halves of that matter. Running before `touch` would compare
// against contacts nobody had computed yet; running before `settle` would raise
// the event while the actors were still overlapping, so a handler setting a
// velocity would have it overwritten by the push-out a moment later — which is
// exactly what steering a ball off a paddle has to survive.
canCollide.step('notice contacts', 'react', [
  note('Touching now and not before: those arrived this frame.'),
  clearActors(arrived),
  forEach(met, {
    from: contacts.of(thisActor()),
    where: not(isIn(met.get(), contactsBefore.of(thisActor()))),
    body: [pushActor(arrived, met.get())],
  }),
  note('Touching before and not now: those left.'),
  clearActors(left),
  forEach(gone, {
    from: contactsBefore.of(thisActor()),
    where: not(isIn(gone.get(), contacts.of(thisActor()))),
    body: [pushActor(left, gone.get())],
  }),
  note(
    'Write the lists down BEFORE raising anything: a handler may read them.',
  ),
  newlyTouching.set(thisActor(), arrived.get()),
  noLongerTouching.set(thisActor(), left.get()),
  note('One event per contact, carrying the actor it is about.'),
  forEach(told, {
    from: arrived.get(),
    where: yes(),
    body: [startsTouching({other: told.get()}, thisActor())],
  }),
  forEach(untold, {
    from: left.get(),
    where: yes(),
    body: [stopsTouching({other: untold.get()}, thisActor())],
  }),
  note('Last of all, move the goalposts for the next comparison.'),
  contactsBefore.set(thisActor(), contacts.of(thisActor())),
]);

export default () => moduleFor(rule, 'collisions');
