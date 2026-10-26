// Where a learner's progress is kept, for now.
//
// `localStorage`, and specs/PROGRESSION_UI.md is explicit that this is
// temporary: the real answer is the account, and once tiles are studio levels
// the completion is level progress rather than a second store that can disagree
// with it. What this buys is a loop that can be walked and taught with today,
// and a sentence the first version can afford to say out loud — a learner who
// switches machines loses their tree.
//
// The stored set carries the CATALOGUE VERSION it was written against, so the
// tile-id migration rules in specs/PROGRESSION.md are enforceable rather than
// aspirational: a set written against a version this build does not understand
// is dropped rather than half-believed. The version is the CATALOGUE's, since
// two trees are edited independently and neither should invalidate the other.

import type {Catalogue, TileId} from './types';

/**
 * Where one tree's progress is filed.
 *
 * KEYED BY THE CATALOGUE, because two trees are two sets of finished tiles.
 * One key for both would count a lesson from one against the other, and the
 * version check below would make each tree's edits invalidate the other's
 * progress (specs/APPS.md).
 *
 * The old key was `world-lab.progression`, unsuffixed. Nothing reads it any
 * more and nothing converts it: the lab has never shipped, so a stored set
 * from a previous build is not something to carry forward.
 */
const keyFor = (catalogue: Catalogue): string =>
  `world-lab.progression.${catalogue.id}`;

interface Stored {
  version: number;
  completed: string[];
}

/** Whatever was stored for this tree, or nothing at all. Never throws. */
export const loadProgress = (catalogue: Catalogue): ReadonlySet<TileId> => {
  try {
    const raw = window.localStorage.getItem(keyFor(catalogue));
    if (!raw) {
      return new Set();
    }
    const stored = JSON.parse(raw) as Partial<Stored>;
    if (
      stored.version !== catalogue.version ||
      !Array.isArray(stored.completed)
    ) {
      return new Set();
    }
    return new Set(stored.completed.filter(id => typeof id === 'string'));
  } catch {
    // A private-mode browser, a quota, a half-written value — none of which is
    // a reason for the lab not to open.
    return new Set();
  }
};

/** Write it back. Never throws, for the same reasons. */
export const saveProgress = (
  catalogue: Catalogue,
  completed: ReadonlySet<TileId>,
): void => {
  try {
    const stored: Stored = {
      version: catalogue.version,
      completed: [...completed],
    };
    window.localStorage.setItem(keyFor(catalogue), JSON.stringify(stored));
  } catch {
    // Nothing to do about it, and nothing worth interrupting a lesson for.
  }
};

/** Forget one tree. For a test, and for the day there is a reset button. */
export const clearProgress = (catalogue: Catalogue): void => {
  try {
    window.localStorage.removeItem(keyFor(catalogue));
  } catch {
    // As above.
  }
};
