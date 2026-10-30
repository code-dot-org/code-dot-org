/**
 * Carries an intent to reopen the drawer across a full page load.
 *
 * Picking a student in the Roster tab reloads the page on levels that are not
 * Lab2 (see TeacherPanel's selectUser), and the drawer comes back closed:
 * level pages mount the FAB with canStartOpen false, so nothing reopens it.
 * The teacher panel this replaced was always visible, so the selection simply
 * carried over. Whoever triggers such a reload records the tab to return to
 * here, and the drawer collects it once on the next load.
 *
 * Session storage rather than local: the drawer's open state is already
 * per-tab, and this intent should not leak into a second tab.
 */
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

const REOPEN_NAV_KEY = 'AiDiffReopenNavKey';

export function noteDrawerReopenNav(nav: string) {
  trySetSessionStorage(REOPEN_NAV_KEY, nav);
}

/**
 * The pending tab, if any, cleared as it is read so it fires only once.
 * tryGetSessionStorage returns null for a key that was never set - its
 * default only covers a thrown exception.
 */
export function takeDrawerReopenNav(): string | null {
  const nav = tryGetSessionStorage(REOPEN_NAV_KEY, '');
  if (!nav) {
    return null;
  }
  try {
    sessionStorage.removeItem(REOPEN_NAV_KEY);
  } catch (e) {
    // A key we failed to clear costs one extra reopen, nothing worse.
  }
  return nav;
}
