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
  vector,
  vectorTimes,
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

export default () => moduleFor(rule, 'collisions');
