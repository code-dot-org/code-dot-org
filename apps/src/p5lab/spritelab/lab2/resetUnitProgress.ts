// Clears the student's level progress in the unit they are in, so that the
// level bubbles in the header go back to "not done". Start Over uses it
// when every level of the unit shares one project: resetting that project
// undoes the work of all the levels, so their progress is cleared with it.

import {AnyAction, Dispatch} from 'redux';

import {
  clearResults,
  setScriptProgress,
} from '@cdo/apps/code-studio/progressRedux';
import HttpClient from '@cdo/apps/util/HttpClient';

/**
 * Asks the server to clear the progress, then clears the copies the page
 * holds. Resolves true when the progress was cleared. Resolves false, and
 * changes nothing, when the unit does not allow it or the request fails:
 * most units do not allow it, since it lets a student erase their own
 * progress.
 */
export async function resetUnitProgress(
  unitName: string,
  dispatch: Dispatch<AnyAction>
): Promise<boolean> {
  try {
    await HttpClient.post(
      `/api/user_progress/${encodeURIComponent(unitName)}/reset`,
      undefined,
      true
    );
  } catch (e) {
    return false;
  }
  // The page keeps progress in two places in its store, and a signed-out
  // visitor's progress is also cached in the browser's session storage.
  dispatch(clearResults());
  dispatch(setScriptProgress({}));
  forgetCachedProgress(unitName);
  return true;
}

// The session storage key where code-studio/clientState.js caches level
// progress, as a map from unit name to that unit's results.
const PROGRESS_CACHE_KEY = 'progress';

/** Removes one unit's entry from the cached progress, keeping the others. */
function forgetCachedProgress(unitName: string): void {
  try {
    const cached = JSON.parse(
      window.sessionStorage.getItem(PROGRESS_CACHE_KEY) ?? '{}'
    );
    delete cached[unitName];
    window.sessionStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(cached));
  } catch (e) {
    // Session storage can be unavailable or hold malformed data. The cache
    // is only a copy, so it is safe to leave as it is.
  }
}
