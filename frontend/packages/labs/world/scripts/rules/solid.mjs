import {position, setPosition} from './builtins.mjs';
import {CanCollide, collisionSizeOf, contacts} from './collisions.mjs';
import {
  absolute,
  add,
  atMost,
  axisOf,
  both,
  defineRule,
  forEach,
  frameTime,
  give,
  hasTrait,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  negated,
  note,
  param,
  pick,
  power,
  times,
  vector,
  vectorOver,
  vectorPlus,
  when,
} from './dsl.mjs';
import {CanMove, positionBefore, velocity} from './motion.mjs';

const rule = defineRule({
  name: 'Solid Bodies',
  ability: 'Has Solid Bodies',
  header: `// "Has Solid Bodies" — a moving body cannot end up inside a solid one.
//
// It runs in \`settle\`, after Collisions has worked out who is touching whom
// and before anything reacts to where things ended up. Noticing a contact and
// doing something about it are two rules on purpose: this one only pushes
// apart, and gravity's landing reads the result.
//
// ONE AXIS AT A TIME, sideways first. Doing both at once is what used to make a
// jump stick to a wall: a body moving up against a wall overlaps it on both
// axes, and resolving them together picks an arbitrary one to undo.
//
// The surface decides what happens to the speed: \`bounciness\` reverses part of
// the speed into the wall, \`drag\` scales the speed along it, and \`friction\`
// takes a fixed amount off — which is what lets a grippy wall HOLD a body
// rather than letting it slide down.`,
});
rule.uses('Physics');
rule.uses('Collisions');

/** How hard friction can hold, in speed per second — the world's own dial. */
const gripStrength = rule.number('grip strength', 9);

const solidTrait = rule.trait('Solid');
solidTrait.uses(CanCollide);
const bounciness = solidTrait.number('bounciness', 0);
const friction = solidTrait.number('friction', 0);
const drag = solidTrait.number('drag', 0);

export const Solid = rule.traitRef('Solid');

/** A 0..1 dial, clamped — these three are meaningless outside that range. */
const kept = rule.block({
  returns: 'number',
  description:
    'A number the way these properties are meant: never below 0, never above 1.',
  say: [param('n', 'number'), 'kept between 0 and 1'],
  body: ({n: amount}) => [
    note('Below zero would push the body the wrong way; above one would'),
    note('give it more speed than it arrived with, every single bounce.'),
    when([[lessThan(amount.get(), n(0)), [give(n(0))]]]),
    when([[moreThan(amount.get(), n(1)), [give(n(1))]]]),
    give(amount.get()),
  ],
});

/** Take a fixed amount off a speed — never past a stop, never reversed. */
const slowedBy = rule.block({
  returns: 'number',
  description:
    'A speed with some taken off it — never turned around, and never past a stop.',
  say: [param('v', 'number'), 'slowed by', param('drop', 'number')],
  body: ({v, drop}) => [
    note('A surface with no grip takes nothing away.'),
    when([[atMost(drop.get(), n(0)), [give(v.get())]]]),
    note('If the grip is stronger than the speed, the speed is gone —'),
    note('not reversed, which is what makes a grippy wall HOLD a body.'),
    when([[atMost(absolute(v.get()), drop.get()), [give(n(0))]]]),
    when([[moreThan(v.get(), n(0)), [give(minus(v.get(), drop.get()))]]]),
    give(add(v.get(), drop.get())),
  ],
});

const reach = rule.local('reach', 'Vector');
const was = rule.local('was', 'Vector');

// ── The pieces both passes are built from ───────────────────────────────────
// Each of these appears three or four times across the two push-out blocks. In
// the workspace they are that many identical block trees, which you can only
// tell apart by reading them; here they are named once.

/** How much a surface can hold onto a body this frame. */
const grip = (solid, frame) =>
  times(
    times(kept({n: friction.of(solid.get())}), gripStrength.of()),
    frame.get(),
  );

/** The speed along the surface after drag has scaled it. */
const slid = (which, body, solid, frame) =>
  times(
    axisOf(which, velocity.of(body.get())),
    power(minus(n(1), kept({n: drag.of(solid.get())})), frame.get()),
  );

/** Whether the grip is strong enough to stop the body sliding at all. */
const heldBy = (which, body, solid, frame) =>
  both(
    moreThan(grip(solid, frame), n(0)),
    atMost(absolute(slid(which, body, solid, frame)), grip(solid, frame)),
  );

/** Held still, it stays where it was; sliding, it keeps what it has. */
const alongSurface = (which, body, solid, frame) =>
  pick(
    heldBy(which, body, solid, frame),
    axisOf(which, was.get()),
    position.axis(which, body.get()),
  );

/** The speed into the surface, reversed by however bouncy it is. */
const bounce = (which, body, solid) =>
  negated(
    times(
      kept({n: bounciness.of(solid.get())}),
      axisOf(which, velocity.of(body.get())),
    ),
  );

/** Whether the boxes overlap on an axis, going by where the body is NOW. */
const overlapsNow = (which, body, solid) =>
  moreThan(
    minus(
      axisOf(which, reach.get()),
      absolute(
        minus(
          position.axis(which, body.get()),
          position.axis(which, solid.get()),
        ),
      ),
    ),
    n(0),
  );

/** …and going by where it was before it moved this frame. */
const overlappedBefore = (which, solid) =>
  moreThan(
    minus(
      axisOf(which, reach.get()),
      absolute(
        minus(axisOf(which, was.get()), position.axis(which, solid.get())),
      ),
    ),
    n(0),
  );

/** The two lines every pass opens with. */
const measure = (body, solid, frame) => [
  note('How far apart the two middles must be for the boxes to just touch.'),
  reach.set(
    vectorOver(
      vectorPlus(
        collisionSizeOf({sizeActor: body.get()}),
        collisionSizeOf({sizeActor: solid.get()}),
      ),
      n(2),
    ),
  ),
  note('Where this actor was before it moved this frame.'),
  was.set(positionBefore({subject: body.get(), seconds: frame.get()})),
];

// ── The two passes ──────────────────────────────────────────────────────────

const pushOutSideways = rule.block({
  returns: 'none',
  description:
    'Pushes an actor out of a solid one sideways, if it came in from the side.',
  say: [
    'push',
    param('body', 'actor'),
    'out of',
    param('solid', 'actor'),
    'sideways, over',
    param('frame', 'number'),
  ],
  body: ({body, solid, frame}) => [
    ...measure(body, solid, frame),
    note(
      'Only push sideways if it was ALREADY overlapping vertically before it',
    ),
    note('moved: otherwise it arrived from above or below, and that is the'),
    note('other pass to make.'),
    when([
      [
        both(overlapsNow('x', body, solid), overlappedBefore('y', solid)),
        [
          note('Put it back against the face it came in through, and stop it.'),
          when(
            [
              [
                atMost(axisOf('x', was.get()), position.x(solid.get())),
                [
                  setPosition(
                    body.get(),
                    minus(position.x(solid.get()), axisOf('x', reach.get())),
                    alongSurface('y', body, solid, frame),
                  ),
                ],
              ],
            ],
            [
              setPosition(
                body.get(),
                add(position.x(solid.get()), axisOf('x', reach.get())),
                alongSurface('y', body, solid, frame),
              ),
            ],
          ),
          velocity.set(
            body.get(),
            vector(
              bounce('x', body, solid),
              slowedBy({
                v: slid('y', body, solid, frame),
                drop: grip(solid, frame),
              }),
            ),
          ),
        ],
      ],
    ]),
  ],
});

const pushOutUpOrDown = rule.block({
  returns: 'none',
  description:
    'Pushes an actor out of a solid one up or down, if it came in from above or below.',
  say: [
    'push',
    param('body', 'actor'),
    'out of',
    param('solid', 'actor'),
    'up or down, over',
    param('frame', 'number'),
  ],
  body: ({body, solid, frame}) => [
    ...measure(body, solid, frame),
    note(
      'Only push up or down if it overlaps sideways NOW — the sideways pass',
    ),
    note('has already run, so a body it pushed clear of a wall is clear here'),
    note('and keeps the speed it was climbing with.'),
    when([
      [
        both(overlapsNow('y', body, solid), overlapsNow('x', body, solid)),
        [
          note('Put it back against the face it came in through, and stop it.'),
          when(
            [
              [
                atMost(axisOf('y', was.get()), position.y(solid.get())),
                [
                  setPosition(
                    body.get(),
                    alongSurface('x', body, solid, frame),
                    minus(position.y(solid.get()), axisOf('y', reach.get())),
                  ),
                ],
              ],
            ],
            [
              setPosition(
                body.get(),
                alongSurface('x', body, solid, frame),
                add(position.y(solid.get()), axisOf('y', reach.get())),
              ),
            ],
          ),
          velocity.set(
            body.get(),
            vector(
              slowedBy({
                v: slid('x', body, solid, frame),
                drop: grip(solid, frame),
              }),
              bounce('y', body, solid),
            ),
          ),
        ],
      ],
    ]),
  ],
});

const mover = rule.local('mover', 'Actor');
const solid = rule.local('solid', 'Actor');

rule.step('resolve', 'settle', [
  note('Everything this actor is touching was worked out by Contacts.'),
  note('Push out sideways FIRST, then up and down — one axis at a time.'),
  note('Doing both at once is what used to make a jump stick to a wall.'),
  forEach(mover, {
    where: both(
      hasTrait(mover.get(), CanMove),
      hasTrait(mover.get(), CanCollide),
    ),
    body: [
      forEach(solid, {
        from: contacts.of(mover.get()),
        where: hasTrait(solid.get(), Solid),
        body: [
          pushOutSideways({
            body: mover.get(),
            solid: solid.get(),
            frame: frameTime(),
          }),
        ],
      }),
      forEach(solid, {
        from: contacts.of(mover.get()),
        where: hasTrait(solid.get(), Solid),
        body: [
          pushOutUpOrDown({
            body: mover.get(),
            solid: solid.get(),
            frame: frameTime(),
          }),
        ],
      }),
    ],
  }),
]);

export default () => moduleFor(rule, 'solid');
