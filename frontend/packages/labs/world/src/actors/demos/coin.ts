// The Coin, demonstrated: it spins.
//
// The smallest honest demo on the shelf, and it earns its place because the
// still cannot make this claim at all. A Coin's row says the import also
// brings "Coin Spin", and a frozen cell of that animation is indistinguishable
// from a coin that does not move — the picture is right and the sentence is
// unproven.
//
// NOT COLLECTED, which is the other half of the row and is deliberately not
// here. Taking one needs a collector, and the Player does not elect "Collects"
// — that is a game deciding what its player is for, and the demo would either
// have to invent an actor the library does not offer or film a Player walking
// through a coin that stays put, which teaches the opposite of the truth.
//
// Three of them, because one coin in the middle of an empty frame is a
// specimen and a row of them is a game.

import {ACTOR_DEMO_SIZE, type ActorDemo} from './types';

/** Halfway down, which is where a thing with no gravity stays. */
const MIDDLE = ACTOR_DEMO_SIZE.height / 2;

export const coinDemo: ActorDemo = {
  // Life size. Nothing here jumps, so nothing needs the room a jump needs, and
  // a coin is worth looking at rather than counting.
  shrink: 1,
  cast: [
    {actor: 'coin', x: 24, y: MIDDLE},
    {actor: 'coin', x: 64, y: MIDDLE},
    {actor: 'coin', x: 104, y: MIDDLE},
  ],
  // Two turns of a six-frame spin at twelve a second: long enough to read as a
  // loop, short enough that the strip is twelve cells.
  seconds: 1,
};
