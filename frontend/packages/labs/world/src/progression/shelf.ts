// The shelf: everything a learner has unlocked, as a question a library can ask.
//
// The design's first load-bearing claim (specs/PROGRESSION.md): **the unlock has
// to be real.** If a New Project already offers all thirty-eight rules, the tree is
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

import {shelf, TILES_BY_ID, unlockKey} from './index';

/**
 * Everything the completed tiles have granted, plus what the OPEN lesson lends.
 *
 * The second half is what stops a gate from becoming a trap. A lesson grants
 * what it teaches, so at the moment a learner is doing it they have not earned
 * it yet — and a lesson whose task is "add the Scoring rule" would be a lesson
 * whose library refuses to add it. So while a lesson is open, its own `unlocks`
 * and `offers` are held, and they stop being held when the learner leaves it
 * without finishing.
 *
 * One rule in one place, deliberately: the toolbox asked this question
 * separately once (`./toolboxShelf`), which left the two import dialogs asking
 * a different one, and a block a lesson could offer was a rule it could not.
 */
export const shelfKeys = (
  completed: ReadonlySet<TileId>,
  open?: TileId,
): ReadonlySet<string> => {
  const lesson = open ? TILES_BY_ID.get(open) : undefined;
  return new Set([
    ...shelf(completed).map(unlock => unlockKey(unlock)),
    ...[...(lesson?.unlocks ?? []), ...(lesson?.offers ?? [])].map(unlock =>
      unlockKey(unlock),
    ),
  ]);
};

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
