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
// is dropped rather than half-believed.

import type {TileId} from './types';

const KEY = 'world-lab.progression';

/**
 * Bumped when a change to the catalogue makes an older stored set wrong —
 * a tile renamed, split, or retired. Adding tiles is not such a change.
 */
export const CATALOGUE_VERSION = 1;

interface Stored {
  version: number;
  completed: string[];
}

/** Whatever was stored, or nothing at all. Never throws. */
export const loadProgress = (): ReadonlySet<TileId> => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      return new Set();
    }
    const stored = JSON.parse(raw) as Partial<Stored>;
    if (
      stored.version !== CATALOGUE_VERSION ||
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
export const saveProgress = (completed: ReadonlySet<TileId>): void => {
  try {
    const stored: Stored = {
      version: CATALOGUE_VERSION,
      completed: [...completed],
    };
    window.localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Nothing to do about it, and nothing worth interrupting a lesson for.
  }
};

/** Forget everything. For a test, and for the day there is a reset button. */
export const clearProgress = (): void => {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // As above.
  }
};
