import {position, setPosition} from './builtins.mjs';
import {CanCollide, passable} from './collisions.mjs';
import {
  absolute,
  add,
  allWithTrait,
  axisOf,
  both,
  countOf,
  defineRule,
  doc,
  extremeActor,
  forEach,
  lessThan,
  minus,
  moduleFor,
  pick,
  pixelsPerUnit,
  frameTime,
  moreThan,
  n,
  no,
  not,
  param,
  thisActor,
  time,
  times,
  vector,
  when,
  withTraitNear,
  yes,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Digging',
  ability: 'Digs Holes',
  purpose: `**Digging** lets the player make a hole in the floor that fills itself back in.

You choose where the hole goes, you get a few seconds of it, and then the floor
returns whether or not you are standing in it — which is what makes it a
mechanic rather than a tool.

Give the player **Digs** and the diggable tiles **Can Be Dug**. How long a hole
lasts is yours to set.`,
  header: `// "Digs Holes" — a hole you make, and one that fills itself in.
//
// The other way of changing a room in this library is a switch: you walk over
// a plate and walls elsewhere come and go. This is the same idea put in the
// player's hands and given a fuse. You choose where the hole goes, you get a
// few seconds of it, and then the floor comes back whether or not you are
// standing in it — which is what makes it a mechanic rather than a tool. Lode
// Runner is the game that found it and JETPACK.md's phase six is asking for it.
//
// IT IS CALLED DIGGING AND THE DOC CALLS IT ZAPPING, and the difference is not
// a disagreement. \`Zapping\` is already a rule here — the one that owns a
// firing RATE and lets a project decide what a shot is — and two rules cannot
// share a name. What this does to a block is nearer to digging anyway: the
// block does not go anywhere, it stops being in the way and then stops not
// being.
//
// A HOLE IS \`passes through things\`, the same lever a switched wall uses
// (\`rules/collisions\`), and reusing it is the point rather than a saving. A
// hole has to stop blocking AND stop holding you up AND stop being a floor
// with an opinion, and all three are the same sentence: it is not there.
//
// THE BLOCK OWNS THE CLOCK, not the digger. How long a hole lasts is a fact
// about the ground — soil closes slowly, packed earth quickly — and a level
// with two kinds of diggable floor wants two answers without giving the player
// two shovels. The digger owns only how long it takes to make one.
//
// IT FILLS IN ON WHOEVER IS THERE and does nothing about it, which is the seam
// \`Zapping\` itself argues for: a rule can raise the moment and cannot know
// what a project wants it to cost. Lode Runner kills what it catches; another
// game might push it out, or score it, or open a door. So the block says
// \`fills in\` and the project decides.
//
// AND ONE BLOCK AT A TIME, the nearest to where you aimed. The alternative is
// a radius, and a radius is a bomb rather than a shovel.`,
});
rule.uses('Collisions');

// ── The ground ───────────────────────────────────────────────────────────────

const diggable = rule.trait('Can Be Dug');
diggable.uses(CanCollide);

/**
 * How long a hole in this block lasts, in seconds.
 *
 * On the BLOCK rather than on the digger — see the header. Soil closes slowly
 * and packed earth quickly, and a level with both wants two answers without
 * handing the player two shovels.
 */
const closesAfter = diggable.number('closes after', 4);
/** The world time this block fills itself back in at. */
const closesAt = diggable.number('closes at', 0, {readonly: true});
/** Whether it is a hole right now. */
const open = diggable.boolean('is a hole', 'false', {readonly: true});

export const CanBeDug = rule.traitRef('Can Be Dug');

/** Raised when it goes. */
const dug = diggable.event(['is dug']);
/**
 * …and when it comes back, whoever is standing in it.
 *
 * The rule raises the moment and does nothing about it — see the header. Lode
 * Runner kills what it catches and another game might not.
 */
const filled = diggable.event(['fills in']);

// ── The digger ───────────────────────────────────────────────────────────────

const digger = rule.trait('Digs');
digger.uses(CanCollide);

/**
 * How far to look for something to dig, in pixels.
 *
 * A tile and a half: far enough to reach the block under the one you are
 * standing on, and near enough that "the nearest to where I aimed" is a block
 * a player would point at.
 */
const reach = digger.number('dig reach', 48);
/**
 * Whether digging lines this actor up with the block it is digging.
 *
 * A HOLE IS EXACTLY AS WIDE AS THE THING THAT DUG IT, which is the whole
 * problem: one block is one body, so getting into one means being lined up
 * with it to the pixel, and a digger a few across from its own hole stands on
 * the lip and does not fall in. `Climbing` met the same wall — a ladder in a
 * gap one tile wide is a thing you have to be lined up with — and answered it
 * the same way, by taking the lining-up off the player.
 *
 * ON THE BLOCK IT IS DIGGING, and no other. Pulling a body towards any hole it
 * happens to be near is a floor that grabs at you: a player walking past a gap
 * they made earlier has not asked to go down it. Digging is the asking, so
 * that is where the line-up belongs — and once it is centered there, falling in
 * needs no help at all.
 *
 * (Being TOLERANT of a hole you walk or jump into off-center is a different
 * mechanic and a real one; it belongs to whatever notices the edge, not here.)
 *
 * EASED RATHER THAN SNAPPED, unlike the ladder, and the difference is what
 * each is for. A climb is a commitment: you have taken hold of the ladder, and
 * being put on its middle reads as gripping it. A dig happens mid-stride, and
 * being moved sideways in one frame reads as the floor grabbing you.
 */
const centers = digger.boolean('centers on what it digs', 'true');
/** How fast that glide is, in units a second. */
const centeringSpeed = digger.number('centering speed', 3);
/** The block it is lining itself up with. */
const liningUpWith = digger.actor('lining up with', {readonly: true});
/**
 * …and whether it has finished doing so.
 *
 * The pull ends on arrival rather than lasting: a digger still bound to its
 * own hole could not walk away from it. A flag rather than forgetting the
 * block, because "no actor" is not a value an actor property can be given —
 * and the block is worth keeping anyway, for anything that wants to ask what
 * this last dug.
 */
const linedUp = digger.boolean('lined up', 'true', {readonly: true});

export const Digs = rule.traitRef('Digs');

const target = rule.local('target', 'Vector');
const block = rule.local('block', 'Actor');
const found = rule.local('found', 'Actor');
const closing = rule.local('closing', 'Actor');

/**
 * `⟨who⟩ dig towards ⟨direction⟩` — the whole of the player's half.
 *
 * A direction rather than a key, because which key means which way is a
 * project's business and this rule has no opinion about keyboards. Does
 * nothing when there is no diggable block that way, so a handler can call it
 * on every press without asking first.
 */
export const digTowards = digger.block({
  returns: 'none',
  description:
    'Open a hole in the nearest diggable block in this direction. Does nothing if there is none.',
  say: ['dig towards', param('direction', 'vector')],
  body: ({direction}) => [
    doc(
      'Where the digger is pointing, one reach away — the place a block has to be near to count as the one that was aimed at.',
    ),
    target.set(
      vector(
        add(
          position.x(thisActor()),
          times(axisOf('x', direction.get()), reach.of(thisActor())),
        ),
        add(
          position.y(thisActor()),
          times(axisOf('y', direction.get()), reach.of(thisActor())),
        ),
      ),
    ),
    doc(
      'THE NEAREST ONE, asked of the index rather than of every actor — and one block, not a radius, because a radius is a bomb rather than a shovel.',
    ),
    found.set(
      extremeActor(block, {
        from: withTraitNear(CanBeDug, reach.of(thisActor()), target.get()),
        end: 'least',
        key: add(
          absolute(minus(position.x(block.get()), axisOf('x', target.get()))),
          absolute(minus(position.y(block.get()), axisOf('y', target.get()))),
        ),
      }),
    ),
    when([
      [
        both(moreThan(countOf(found.get()), n(0)), not(open.of(found.get()))),
        [
          doc(
            'A hole is `passes through things` — the same lever a switched wall uses, because "it is not there" is one sentence and not four (`rules/collisions`).',
          ),
          passable.set(found.get(), yes()),
          open.set(found.get(), yes()),
          closesAt.set(found.get(), add(time(), closesAfter.of(found.get()))),
          doc(
            '…and line up with it — see `centers on what it digs`. A hole is exactly as wide as the body that made it, so being a few pixels across from your own hole is standing on its lip.',
          ),
          liningUpWith.set(thisActor(), found.get()),
          linedUp.set(thisActor(), no()),
          dug({}, found.get()),
        ],
      ],
    ]),
  ],
});

const across = rule.local('across', 'Number');
const step = rule.local('step', 'Number');

digger.step('line up with what it dug', 'adjust', [
  when([
    [
      both(
        centers.of(thisActor()),
        both(
          not(linedUp.of(thisActor())),
          both(
            moreThan(countOf(liningUpWith.of(thisActor())), n(0)),
            open.of(liningUpWith.of(thisActor())),
          ),
        ),
      ),
      [
        doc(
          'How far off center, and how far this frame may close it — never past the middle, or a glide becomes a wobble.',
        ),
        across.set(
          minus(
            position.x(liningUpWith.of(thisActor())),
            position.x(thisActor()),
          ),
        ),
        step.set(
          times(
            times(centeringSpeed.of(thisActor()), pixelsPerUnit()),
            frameTime(),
          ),
        ),
        when(
          [
            [
              lessThan(absolute(across.get()), n(0.5)),
              [
                doc(
                  'Arrived, and let go: a digger still pulled towards its own hole could not walk away from it.',
                ),
                linedUp.set(thisActor(), yes()),
              ],
            ],
          ],
          [
            setPosition(
              thisActor(),
              add(
                position.x(thisActor()),
                pick(
                  lessThan(absolute(across.get()), step.get()),
                  across.get(),
                  times(
                    step.get(),
                    pick(moreThan(across.get(), n(0)), n(1), n(-1)),
                  ),
                ),
              ),
              position.y(thisActor()),
            ),
          ],
        ),
      ],
    ],
  ]),
]);

rule.step('fill the holes back in', 'sense', [
  doc(
    'The block owns its own clock, so this asks every hole rather than every digger: a hole outlives whoever made it, and closes on time whether or not that actor is still in the world.',
  ),
  forEach(closing, {
    from: allWithTrait(CanBeDug),
    body: [
      when([
        [
          both(
            open.of(closing.get()),
            not(lessThan(time(), closesAt.of(closing.get()))),
          ),
          [
            passable.set(closing.get(), no()),
            open.set(closing.get(), no()),
            doc(
              'And whoever is standing in it is told about — see the header on why this rule does not decide what that costs.',
            ),
            filled({}, closing.get()),
          ],
        ],
      ]),
    ],
  }),
]);

export default () => moduleFor(rule, 'digging');
