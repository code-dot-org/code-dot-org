// The Ground, demonstrated: it catches what falls, and holds it up.
//
// A tile is the one stock actor whose picture already says what it looks like
// and says nothing at all about what it is FOR. Its own row makes the argument
// in words — gravity with nothing to land on is a long fall — and this is that
// sentence with something falling in it.
//
// So the subject is the floor and the Player is the visitor, which is the
// reverse of `player.ts` and the reason both demos exist: one shows what
// arrives when you import a Player, the other what a floor does to it. The
// walk at the end is the second half of the claim — a floor is not only
// something to hit, it is something to stand on.

import {ACTOR_DEMO_WORLD, type ActorDemo, type ActorPlacement} from './types';

/** A row of Ground, left to right, on tile centers. */
const floor = (from: number, count: number, y: number): ActorPlacement[] =>
  Array.from({length: count}, (_, index) => ({
    actor: 'ground',
    x: from + index * 32,
    y,
  }));

const FLOOR_Y = ACTOR_DEMO_WORLD.height - 8;

export const groundDemo: ActorDemo = {
  supporting: ['player'],
  cast: [
    ...floor(16, 8, FLOOR_Y),
    // Dropped from the top of the frame rather than stood on the floor: a
    // Player already on the ground is a picture of a Player, and what this is
    // about is the moment it stops.
    {actor: 'player', x: 64, y: 24},
  ],
  seconds: 2.5,
  keys(seconds: number) {
    // Nothing at all until it has landed. The fall is gravity's, and a demo
    // pressing a key during it would be showing two things at once.
    return seconds >= 1.2 && seconds < 2.0 ? ['right arrow'] : [];
  },
};
