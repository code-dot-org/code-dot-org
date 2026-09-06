import {position, setPosition} from './builtins.mjs';
import {CanCollide, collisionSizeOf, contacts} from './collisions.mjs';
import {
  absolute,
  add,
  allWithTrait,
  atLeast,
  atMost,
  axisOf,
  both,
  defineRule,
  doc,
  filter,
  forEach,
  frameTime,
  give,
  hasTrait,
  lessThan,
  minus,
  moduleFor,
  n,
  no,
  not,
  note,
  over,
  param,
  rotated,
  shadow,
  thisActor,
  times,
  vector,
  vectorPlus,
  vectorTimes,
  when,
  yes,
} from './dsl.mjs';
import {CanMove, positionBefore, velocity} from './motion.mjs';

const rule = defineRule({
  name: 'Gravity',
  ability: 'Has Gravity',
  header: `// "Has Gravity" — things fall, and land on what is under them.
//
// Two steps in two moments, which is why a phase belongs to a step and not to a
// rule. Adding to velocity is a FORCE, so it runs in \`push\`, before Physics
// turns velocity into position. Landing is a CONSEQUENCE: it looks at where
// everything ended up, so it runs in \`react\`, after contacts are found and
// after solid bodies have been pushed apart.
//
// It used to say both of those by naming other rules' steps — "before Physics >
// reposition" and "after Solid Bodies > resolve" — which is two references to
// say what kind of work this is.
//
// Gravity has a DIRECTION, not just a strength, so it can be turned upside
// down or sideways. Everything that cares about which way is down reads it,
// which is what the \`sign\` in these blocks is doing: 1 normally, -1 inverted.`,
});
rule.uses('Physics');
rule.uses('Solid Bodies');

export const directionOfGravity = rule.vector('direction of gravity', {
  x: 0,
  y: 1,
});
const amountOfGravity = rule.number('amount of gravity', 9);

const sign = rule.local('sign', 'Number');
const restY = rule.local('restY', 'Number');

/** 1 when down is down, -1 when gravity has been turned over. */
const decideSign = [
  sign.set(n(1)),
  when([
    [lessThan(axisOf('y', directionOfGravity.of()), n(0)), [sign.set(n(-1))]],
  ]),
];

/** Half of each box added together — how far apart two middles rest. */
const halfBoxes = (which, faller, ground) =>
  over(
    add(
      axisOf(which, collisionSizeOf({sizeActor: faller})),
      axisOf(which, collisionSizeOf({sizeActor: ground})),
    ),
    n(2),
  );

const restHeightOf = rule.block({
  returns: 'number',
  description: 'The height this actor rests at when it lands on that ground.',
  say: [param('faller', 'actor'), 'rest height of', param('ground', 'actor')],
  body: ({faller, ground}) => [
    doc(
      'Where does this faller stop when it lands on this ground? Boxes are measured from the middle, so the top of the ground is its middle minus half its height — and the faller sits half its own height above that. Upside-down gravity flips which side that is, so we multiply by sign: 1 for normal gravity, -1 for upside-down.',
    ),
    ...decideSign,
    give(
      minus(
        position.y(ground.get()),
        times(halfBoxes('y', faller.get(), ground.get()), sign.get()),
      ),
    ),
  ],
});

const isRestingOn = rule.block({
  returns: 'boolean',
  description:
    'Whether this actor is standing on that ground right now, this frame.',
  say: [param('faller', 'actor'), 'is resting on', param('ground', 'actor')],
  body: ({faller, ground}) => [
    doc(
      'Standing on this ground means three things are all true: 1. we are over it, not off to one side, 2. we are moving toward it (falling, not rising away), 3. we were above its surface last frame and are at or past it now.',
    ),
    restY.set(restHeightOf({faller: faller.get(), ground: ground.get()})),
    ...decideSign,
    give(
      both(
        both(
          // Over it, not beside it.
          lessThan(
            absolute(minus(position.x(faller.get()), position.x(ground.get()))),
            halfBoxes('x', faller.get(), ground.get()),
          ),
          // Moving toward it rather than away.
          atLeast(
            times(axisOf('y', velocity.of(faller.get())), sign.get()),
            n(0),
          ),
        ),
        both(
          // Above the surface last frame…
          atMost(
            times(
              minus(positionBefore.y(faller.get()), restY.get()),
              sign.get(),
            ),
            n(0),
          ),
          // …and at or past it now.
          atLeast(
            times(minus(position.y(faller.get()), restY.get()), sign.get()),
            n(0),
          ),
        ),
      ),
    ),
  ],
});

const ground = rule.local('ground', 'Actor');
const landed = rule.local('landed', 'Boolean');

const landOnGround = rule.block({
  returns: 'boolean',
  description:
    'Lands this actor on any ground it has reached, and says whether it did.',
  say: [param('faller', 'actor'), 'land on ground?'],
  body: ({faller}) => [
    doc(
      'Collisions already worked out what this actor is touching, so this only looks at those — not at every actor in the world. Look at every ground in the world and ask: am I resting on it? If I am, put me exactly on its surface and stop falling.',
    ),
    landed.set(no()),
    forEach(ground, {
      from: filter(ground, {
        from: contacts.of(faller.get()),
        where: hasTrait(ground.get(), rule.traitRef('Acts as Ground')),
      }),
      body: [
        when([
          [
            isRestingOn({
              faller: faller.get(),
              ground: ground.get(),
            }),
            [
              restY.set(
                restHeightOf({faller: faller.get(), ground: ground.get()}),
              ),
              setPosition(faller.get(), position.x(faller.get()), restY.get()),
              velocity.set(
                faller.get(),
                vector(axisOf('x', velocity.of(faller.get())), n(0)),
              ),
              landed.set(yes()),
            ],
          ],
        ]),
      ],
    }),
    give(landed.get()),
  ],
});

rule.block({
  returns: 'none',
  description:
    'Turns gravity upside down: things fall the other way from now on.',
  say: ['Invert Gravity'],
  body: () => [
    // 180° is the socket's default, not something typed in.
    directionOfGravity.set(rotated(directionOfGravity.of(), shadow(n(180)))),
  ],
});

export const AffectedByGravity = rule.traitRef('Affected by Gravity');

const affected = rule.trait('Affected by Gravity');
affected.uses(CanMove);
affected.uses(CanCollide);
const gravityScale = affected.number('gravity scale', 1);
export const falling = affected.boolean('falling', 'false', {readonly: true});
/**
 * Fall THROUGH what would otherwise hold this actor up.
 *
 * Landing is the half of this rule that is hardest to opt out of from outside:
 * an actor on a one-way platform is re-landed every frame it rests there, so a
 * mechanic that wants to take it downwards has nothing to push against —
 * whatever it sets the position to, the next `handleCollisions` puts it back on
 * the surface. Dropping the trait is not an answer either, since the actor
 * still has to fall.
 *
 * So this is the switch, and it is a switch a project may throw as readily as a
 * rule: "hold down to drop through the platform" is one handler with it, and
 * unwritable without it. `Climbs Ladders` is the other caller — climbing DOWN
 * off the top of a ladder is exactly this problem.
 *
 * It does not make an actor weightless (`gravity scale` is that) and it does
 * not pass through a SOLID body, which is a different rule pushing overlapping
 * bodies apart. It is about the floor under your feet and nothing else.
 */
export const ignoresGround = affected.boolean('ignores ground', 'false');

affected.block({
  returns: 'boolean',
  description:
    'Whether this actor is standing on something, rather than falling.',
  say: ['is on the ground?'],
  body: () => [
    note('The landing step keeps "falling" up to date, so this just reads it.'),
    give(not(falling.of(thisActor()))),
  ],
});

const startsFalling = affected.event(['starts falling']);
const stopsFalling = affected.event(['stops falling']);

/**
 * Something to land ON — and, on its own, something to jump UP THROUGH.
 *
 * That second half is a mechanic nobody had to build, and it is worth saying
 * out loud because it looks like one that is missing. `is resting on` above
 * asks three things, and two of them are about direction: the faller has to be
 * moving TOWARD the ground and to have been above its surface last frame. A
 * body on its way up is neither, so nothing here stops it — a ledge with this
 * trait and nothing else is a ONE-WAY PLATFORM, the kind a platformer is built
 * out of.
 *
 * What makes an ordinary floor ordinary is the second trait beside this one:
 * `Solid` puts a body back out of the face it came in through, whichever face
 * that was, so a floor that is also solid is one you cannot rise through.
 *
 * So the pair says which kind of floor it is, and neither of them had to learn
 * a third word for it:
 *
 *     Acts as Ground            → land on it, pass up through it
 *     Acts as Ground + Solid    → land on it, and it stops you either way
 */
rule.trait('Acts as Ground').uses(CanCollide);

const each = rule.local('each', 'Actor');
const resting = rule.local('resting', 'Boolean');

rule.step('applyVelocity', 'push', [
  forEach(each, {
    from: allWithTrait(rule.traitRef('Affected by Gravity')),
    body: [
      doc(
        'Falling is not one speed: every frame you fall a little faster. So add a bit of speed, in the direction gravity pulls.',
      ),
      velocity.set(
        each.get(),
        vectorPlus(
          velocity.of(each.get()),
          vectorTimes(
            directionOfGravity.of(),
            times(
              times(amountOfGravity.of(), gravityScale.of(each.get())),
              frameTime(),
            ),
          ),
        ),
      ),
    ],
  }),
]);

rule.step('handleCollisions', 'react', [
  forEach(each, {
    from: allWithTrait(rule.traitRef('Affected by Gravity')),
    body: [
      note(
        'Everything has moved by now, so this is where we decide who is standing.',
      ),
      note(
        'Landing (or not) is also when we announce it: started falling, landed.',
      ),
      doc(
        'Unless this actor is on its way THROUGH the floor, in which case there is nothing to land on and nothing to say about it — see `ignores ground`. The ANNOUNCEMENT is inside the guard too, and that is the half it is easy to leave out: a climber whose landing was skipped but whose "not resting" was not is a climber told it has started falling, once, at the foot of every ladder.',
      ),
      when([
        [
          not(ignoresGround.of(each.get())),
          [
            resting.set(landOnGround({faller: each.get()})),
            when(
              [
                [
                  resting.get(),
                  [
                    when([
                      [
                        falling.of(each.get()),
                        [
                          falling.set(each.get(), no()),
                          stopsFalling({}, each.get()),
                        ],
                      ],
                    ]),
                  ],
                ],
              ],
              [
                when([
                  [
                    not(falling.of(each.get())),
                    [
                      falling.set(each.get(), yes()),
                      startsFalling({}, each.get()),
                    ],
                  ],
                ]),
              ],
            ),
          ],
        ],
      ]),
    ],
  }),
]);

export default () => moduleFor(rule, 'gravity');
