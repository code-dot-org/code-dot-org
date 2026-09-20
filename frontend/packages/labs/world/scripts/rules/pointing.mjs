// What is under the pointer, as blocks.
//
// Shared by the two rules that ask: Mouse, which decides what a press landed
// on, and Gestures, which decides what a drag began on. It was written out in
// Mouse and copied nowhere; the second asker is what makes it a function.
//
// A BOX, not the picture. What is under the pointer is worked out from where
// the actor is and how big it is drawn, which is what every other question
// about an actor's extent uses (`collision size of`, `bounds`, `wrap`). A
// transparent corner counts as a hit, which is the same bargain collisions
// already make and the one a learner already has a feel for.

import {intrinsicSize, position, scale} from './builtins.mjs';
import {
  absolute,
  atMost,
  axisOf,
  both,
  canBeReached,
  minus,
  mousePosition,
  moreThan,
  n,
  over,
  pick,
  times,
} from './dsl.mjs';

/** What an actor with no measured picture is assumed to be, per `collisions`. */
const ASSUMED_SIZE = 32;

/**
 * Half the actor's drawn size on one axis — how far its middle reaches.
 *
 * The same arithmetic `bounds` does, and for the same two reasons: an intrinsic
 * size of zero means "nobody has measured this picture" rather than "no size",
 * and `absolute` because a scale of -1 is how a sprite is flipped to face the
 * other way — left as it comes, a flipped actor would have a negative
 * half-width and be unclickable on the side it is facing.
 */
const halfSize = (which, subject) =>
  over(
    times(
      pick(
        moreThan(intrinsicSize.axis(which, subject), n(0)),
        intrinsicSize.axis(which, subject),
        n(ASSUMED_SIZE),
      ),
      absolute(scale.axis(which, subject)),
    ),
    n(2),
  );

/** Whether the pointer is inside the actor's box, one axis at a time. */
const withinAxis = (which, subject) =>
  atMost(
    absolute(
      minus(axisOf(which, mousePosition()), position.axis(which, subject)),
    ),
    halfSize(which, subject),
  );

/**
 * Whether the pointer HITS this actor: over it, and allowed to be.
 *
 * THE REACHABILITY IS IN HERE rather than at the call sites, and that is
 * deliberate. Both askers want the same thing — what a press landed on, what
 * a drag began on — and a hit test that answered "yes" for an actor behind a
 * dialog would be answering a question nobody asks. Putting it here is also
 * one place to be right instead of two to remember, which is exactly the bug
 * this fixes: a key on the on-screen keyboard was pressing the button on the
 * screen behind it (`World.canReach`, specs/MODALITY_PLAN.md).
 */
export const under = subject =>
  both(
    both(withinAxis('x', subject), withinAxis('y', subject)),
    canBeReached(subject),
  );
