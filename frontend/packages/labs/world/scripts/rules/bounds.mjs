import {
  Positional,
  intrinsicSize,
  position,
  scale,
  setPosition,
} from './builtins.mjs';
import {
  absolute,
  axisOf,
  defineRule,
  give,
  lessThan,
  mapSize,
  minus,
  moduleFor,
  moreThan,
  n,
  note,
  over,
  param,
  pick,
  thisActor,
  times,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Boundaries',
  ability: 'Stays in the Map',
  header: `// "Stays in the Map" — walk into an edge and stop there.
//
// Screen Wrap's opposite, and deliberately its mirror: the same two edges, the
// same two axes split into the same two traits, the same moment. What differs
// is the answer at the edge — wrap puts you out the other side, this puts you
// back where you were. A paddle wants one, an asteroid the other, and no game
// wants both on one actor.
//
// TWO traits, one per direction, for Screen Wrap's reason. A paddle stays
// across and must NOT stay down — it would hover at the top edge instead of
// falling — and a platformer's player is often the reverse.
//
// They run in \`adjust\`, the moment after \`move\` has turned velocity into a
// position and before \`touch\` works out what is against what. Both halves
// matter, exactly as for wrapping: correcting before the move would clamp a
// position nothing had changed, and correcting after collisions would mean an
// actor spent a frame being solid outside the map.
//
// The two steps share a moment and so must commute, and they do: each reads the
// axis it writes and passes the other through untouched.
//
// THE WHOLE ACTOR, not its middle. Screen Wrap clamps nothing and says its
// middle is what crosses the edge, which is fine for a thing that vanishes and
// reappears. Stopping is different: a paddle whose middle stops at the edge is
// a paddle half off the screen, and that is the one thing this rule exists to
// prevent. So it holds the actor's own half-width back from the edge.
//
// That size is SPACE's — \`intrinsic size\` times \`scale\` — not Collisions'.
// Screen Wrap's header says size lives in Collisions and that taking it would
// make every wrapping world a colliding one; that is true of the collision BOX
// and not of the drawing, which the foundation gives every actor.
//
// But \`intrinsic size\` is only WRITTEN for a spritesheet: the Animation rule
// publishes the largest cell, and leaves it at zero for a single image, which
// is most actors. Taken at face value that is a half-width of zero — the middle
// stopping at the edge, half the actor hanging outside, which is the bug this
// rule exists to prevent, and it showed up on everything that was not animated.
//
// So the same three answers Collisions gives, minus the one that is its own:
// the picture if it has been measured, and failing that a 32 by 32 square.
// Matching \`collision size of\` deliberately — one notion of how big an actor
// is, so a better answer later improves both rather than splitting them.`,
});
rule.uses('Space');

const across = rule.trait('Stays Across');
across.uses(Positional);
const down = rule.trait('Stays Down');
down.uses(Positional);

export const StaysAcross = rule.traitRef('Stays Across');
export const StaysDown = rule.traitRef('Stays Down');

/**
 * A number held between two others.
 *
 * On the RULE rather than on either trait, for the reason `wrap` puts its own
 * arithmetic there: it is the same sum both ways round, and a copy per trait is
 * somewhere for the two to disagree. It is also the block a learner would reach
 * for to pin anything else down — a score, a volume, a health bar.
 */
export const kept = rule.block({
  returns: 'number',
  description:
    'This number, held between a low and a high — the low if it is under, the high if it is over, and itself if it is already between them.',
  say: ['keep', param('value'), 'between', param('low'), 'and', param('high')],
  body: ({value, low, high}) => [
    note('Under the low end? Then the low end is as far as it goes.'),
    when([[lessThan(value.get(), low.get()), [give(low.get())]]]),
    note('Over the high end? Likewise.'),
    when([[moreThan(value.get(), high.get()), [give(high.get())]]]),
    note('Already between them, so leave it exactly where it is.'),
    give(value.get()),
  ],
});

/** What an actor with no measured picture is assumed to be, per `collisions`. */
const ASSUMED_SIZE = 32;

/**
 * How wide or tall the actor is drawn.
 *
 * Zero means "not measured" rather than "no size" — the Animation rule only
 * publishes an intrinsic size for a spritesheet, so a single-image actor never
 * gets one. Falling through to a 32 by 32 square is what `collision size of`
 * does with the same gap.
 */
const drawnSize = which =>
  pick(
    moreThan(intrinsicSize.axis(which, thisActor()), n(0)),
    intrinsicSize.axis(which, thisActor()),
    n(ASSUMED_SIZE),
  );

/**
 * Half of that — how far the actor's middle must stay back from an edge.
 *
 * `absolute`, because a scale of -1 is how a sprite is flipped to face the
 * other way. Left as it comes, a flipped actor would have a negative half-width
 * and be held half a body OUTSIDE the map, which is this rule's bug inverted.
 */
const halfSize = which =>
  over(times(drawnSize(which), absolute(scale.axis(which, thisActor()))), n(2));

const stayOn = which =>
  kept({
    value: position.axis(which, thisActor()),
    low: halfSize(which),
    high: minus(axisOf(which, mapSize()), halfSize(which)),
  });

across.step('stop at the sides', 'adjust', [
  note(
    'Across only: the down position is read and written back unchanged, which is what lets this and "Stays Down" share a moment.',
  ),
  setPosition(thisActor(), stayOn('x'), position.y(thisActor())),
]);

down.step('stop at the top and bottom', 'adjust', [
  note('Down only, and the across position passes through untouched.'),
  setPosition(thisActor(), position.x(thisActor()), stayOn('y')),
]);

export default () => moduleFor(rule, 'bounds');
