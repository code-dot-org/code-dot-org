// The shelf: everything a learner has unlocked, as a question a library can ask.
//
// The design's first load-bearing claim (specs/PROGRESSION.md): **the unlock has
// to be real.** If a New Project already offers all thirty rules, the tree is
// decoration and every learner correctly ignores it. So the import libraries
// ask this before offering a row.
//
// What it governs is what a project can TAKE, not what a project HAS. A
// lesson's own starting project is free to contain anything — an edge on the
// map means readiness, not possession — and a rule already in a project keeps
// its toolbox category whether or not the learner has earned it. Gating the
// libraries is the whole of it, and it is the whole of it because that is where
// a learner reaches for something they have not been taught.

import type {TileId, UnlockTarget} from './types';

import {shelf, unlockKey} from './index';

/** Everything the completed tiles have granted, as keys. */
export const shelfKeys = (
  completed: ReadonlySet<TileId>,
): ReadonlySet<string> =>
  new Set(shelf(completed).map(unlock => unlockKey(unlock)));

/**
 * Whether the shelf holds a thing.
 *
 * A thing NO tile grants is held by everybody: the catalogue is not a
 * whitelist, and something it has never heard of is not something to withhold.
 * The layout test asserts that every stock rule and actor is granted by exactly
 * one tile, so in practice this answers for the ones that matter and stays out
 * of the way of everything else.
 */
export const holds = (
  keys: ReadonlySet<string>,
  granted: ReadonlySet<string>,
  unlock: UnlockTarget,
): boolean => {
  const key = unlockKey(unlock);
  return !granted.has(key) || keys.has(key);
};
