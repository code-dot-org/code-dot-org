// The Platformer Player, demonstrated: it walks, it falls, and it jumps.
//
// Those three in that order, and the order is the argument. Walking is what a
// still cannot show and what the name promises; falling is the half of the
// bargain the Ground is for, and it has to be seen to be believed by anybody
// deciding whether they need one; jumping is the reason the space bar is bound
// in the file at all. A scene that only walked would be a sprite sliding, and
// three sentences about arrow keys are not the choice a learner is making.
//
// NOTHING HERE TOUCHES THE ACTOR. The scene presses keys and the imported file
// does the rest — which is why this demonstrates the Player rather than a
// puppet of one, and why it stops working on the day the Player does.
//
// The numbers come from playing it: 150 pixels a second walking, 134 pixels of
// rise, a second in the air. The ledge is three tiles at the left so that
// walking off it is the first thing that happens after the walk, and the floor
// runs the whole width so the fall has somewhere to end.

import {ACTOR_DEMO_WORLD, type ActorDemo, type ActorPlacement} from './types';

/** A row of Ground, left to right, on tile centers. */
const floor = (from: number, count: number, y: number): ActorPlacement[] =>
  Array.from({length: count}, (_, index) => ({
    actor: 'ground',
    x: from + index * 32,
    y,
  }));

/** The bottom row of tiles, whose tops are what the player lands on. */
const FLOOR_Y = ACTOR_DEMO_WORLD.height - 8;
/** The ledge it starts on, three tiles up and to the left. */
const LEDGE_Y = 88;

export const playerDemo: ActorDemo = {
  supporting: ['ground'],
  cast: [
    ...floor(16, 8, FLOOR_Y),
    ...floor(16, 3, LEDGE_Y),
    // Standing on the ledge, a tile in from the left: far enough that the walk
    // reads as a walk before the ground runs out.
    {actor: 'player', x: 32, y: LEDGE_Y - 32},
  ],
  seconds: 3.75,
  keys(seconds: number) {
    // Right off the ledge, a pause on the floor, a jump, and back the way it
    // came — which is also the only way to see the walk mirrored.
    if (seconds >= 0.4 && seconds < 1.1) {
      return ['right arrow'];
    }
    if (seconds >= 1.6 && seconds < 1.72) {
      return ['space'];
    }
    if (seconds >= 2.8 && seconds < 3.45) {
      return ['left arrow'];
    }
    return [];
  },
};
