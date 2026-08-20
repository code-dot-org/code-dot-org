import {CanMove, velocity} from './builtins.mjs';
import {
  add,
  atLeast,
  axisOf,
  defineRule,
  moduleFor,
  n,
  note,
  thisActor,
  time,
  times,
  vector,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Patrol',
  ability: 'Walks Back and Forth',
  header: `// "Walks Back and Forth" — the second thing a level needs after a player.
//
// Steering chases and flees, which is a thing an enemy does about YOU. This is
// what one does when you are not there: a guard on its beat, a platform on its
// track. A level of actors that only chase is a level with nothing in it until
// the player arrives.
//
// TWO TRAITS, one per direction, which is Screen Wrap's division and
// Boundaries' and Arrow Keys'. Wanting one is not wanting the other, and here
// the two are different THINGS rather than two halves of one: across is a
// guard walking its beat, down is a lift. An actor may take both and walk a
// rectangle, which nothing here has to arrange.
//
// IT TURNS ON A CLOCK, NOT ON A DISTANCE, and that is the whole of the design.
// A distance means remembering where the beat started, and "where it started"
// is a number an actor does not have until its first frame — so it needs a
// second property to say whether the first has been filled in yet, and a
// sentinel for "not yet" that is also a legal position. Time has none of those
// problems: a turn is due at a moment, the moment after it is a period later,
// and an actor whose next turn is due at zero is due NOW. That is exactly how
// \`rules/time\` starts a fresh timer, and it is why this needs one read-only
// number per direction instead of three.
//
// The distance walked is speed x time, which a learner can do in their head
// and change either half of: 0.6 for a second and a half is about ninety
// pixels, or three tiles.
//
// THE NEXT TURN IS BOOKED A PERIOD AFTER THE LAST ONE WAS DUE, and not a
// period after now — which is the opposite of what \`rules/time\` does with its
// timer, and the difference matters here in a way it does not there.
//
// A turn is taken on the first frame at or after the moment it was due, so it
// is always a fraction of a frame late. Booking from THEN carries that
// fraction into the next booking and the one after, and the beat slips
// forward. For a timer that is nothing: it fires a hair late, again and again,
// and nobody can see it. For a patrol it is a POSITION — a measured two pixels
// a second at the default speed — so a platform on a track walks steadily off
// the end of it, and an enemy leaves its beat. Booking from the due moment
// keeps the two legs the same length and the actor over its own ground.
//
// What that costs is a world that stalls: a long pause leaves the booking in
// the past, and this turns once a frame until it has caught up. A moment of
// shivering after a stall, against a slow walk away forever.
//
// HEADING STARTS AT -1, so the first frame's turn makes it +1 and the actor
// sets off the way it faces. Starting at +1 would mean the first turn arrived
// immediately and sent it backwards, which reads as a rule that cannot count.
//
// It runs in \`decide\`, where intent becomes motion, beside Arrow Keys — and
// composes with everything after it. A patroller that also falls is a patroller
// with gravity; one that stops at a wall is one with Solid Bodies. Nothing here
// knows about either.`,
});
rule.uses('Physics');

/**
 * One direction's worth of patrol.
 *
 * Written once and made twice, because the two are the same sentence with a
 * different axis in it — and the alternative is the same six blocks copied,
 * which is somewhere for the two to disagree.
 */
const beat = (traitName, which, other) => {
  const trait = rule.trait(traitName);
  trait.uses(CanMove);
  const speed = trait.number(`${which} speed`, 0.6);
  // Seconds one way before turning round. With the speed above that is about
  // three tiles, which is a beat you can see the whole of in one screen.
  const period = trait.number(`${which} time`, 1.5);
  // 1 or -1. Read-only: the step is what turns it round, and a project setting
  // it by hand would be steering rather than patrolling.
  const heading = trait.number(`${which} heading`, -1, {readonly: true});
  // When the next turn is due. Zero means NOW, which is what makes the first
  // frame set off rather than needing a "have I started" of its own.
  const turnAt = trait.number(`${which} next turn`, 0, {readonly: true});

  const goes = () => times(heading.of(thisActor()), speed.of(thisActor()));

  trait.step(`turn ${which}`, 'decide', [
    note('Due a turn? Then turn, and book the next one a period from now.'),
    when([
      [
        atLeast(time(), turnAt.of(thisActor())),
        [
          heading.set(thisActor(), times(heading.of(thisActor()), n(-1))),
          note('A period after it was DUE, not after now — see the header.'),
          turnAt.set(
            thisActor(),
            add(turnAt.of(thisActor()), period.of(thisActor())),
          ),
        ],
      ],
    ]),
    note(`${which} only: the ${other} speed is read and written back`),
    note('unchanged, which is what lets the two share a moment.'),
    velocity.set(
      thisActor(),
      which === 'across'
        ? vector(goes(), axisOf('y', velocity.of(thisActor())))
        : vector(axisOf('x', velocity.of(thisActor())), goes()),
    ),
  ]);
  return trait;
};

beat('Patrols Across', 'across', 'down');
beat('Patrols Down', 'down', 'across');

export const PatrolsAcross = rule.traitRef('Patrols Across');
export const PatrolsDown = rule.traitRef('Patrols Down');

export default () => moduleFor(rule, 'patrol');
