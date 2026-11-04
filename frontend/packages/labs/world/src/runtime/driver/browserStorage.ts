// The sandbox origin's storage, lent to a game's world (specs/SAVING_PLAN.md).
// It is isolated from the lab's session: the learner's own game data, reaching
// nothing of theirs.

import type {WorldStorage} from '../../engine/core/types';

/** `localStorage`, or nothing where site data is blocked. */
export function browserStorage(): WorldStorage | undefined {
  // Reading `localStorage` at all can throw where site data is blocked, so the
  // test is the access and not a property check.
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.getItem('world-lab.probe');
      return localStorage;
    }
  } catch {
    // The blocks answer false, which is what they are for.
  }
  return undefined;
}
