// How the host takes part in moving between levels. Apps reached these through
// its Lab2Registry and lifecycle notifier; here the host installs them.

import type {NumberedLevel} from './types';

export interface LevelNavigationHooks {
  /**
   * Whether the two levels can share this page. Defaults to
   * canChangeLevelInPage.
   */
  canNavigateInPage?: (
    from: NumberedLevel | undefined,
    to: NumberedLevel,
  ) => boolean;
  /**
   * Asked before any level change, in page or not; false cancels it. Apps
   * used it for an AI Tutor review left unsaved.
   */
  confirmNavigation?: () => boolean | Promise<boolean>;
  /** After an in-page change: the lab's cue to switch levels. */
  onLevelChange?: (
    previousLevelId: number | undefined,
    nextLevelId: number,
  ) => void;
  /**
   * Before leaving the page for a level that cannot share it. Apps cleaned up
   * the project manager here, so a pending save did not prompt the user.
   */
  beforeLeavingPage?: (from: NumberedLevel | undefined) => void | Promise<void>;
  /** Leaves the page for url. Defaults to assigning window.location.href. */
  leavePage?: (url: string) => void;
}

let hooks: LevelNavigationHooks = {};

/**
 * Installs or replaces hooks. Hooks not named are kept; a hook given as
 * undefined is removed.
 */
export function configureLevelNavigation(next: LevelNavigationHooks) {
  hooks = {...hooks, ...next};
}

/** Removes every hook. */
export function resetLevelNavigation() {
  hooks = {};
}

export function getLevelNavigationHooks(): Readonly<LevelNavigationHooks> {
  return hooks;
}

/**
 * The default for canNavigateInPage: any two Lab2 levels, except on a summary
 * page, where teachers view predict-level responses.
 */
export function canChangeLevelInPage(
  from: NumberedLevel | undefined,
  to: NumberedLevel,
): boolean {
  if (window.location.pathname.split('/').includes('summary')) {
    return false;
  }
  return !!from?.usesLab2 && !!to.usesLab2;
}

/**
 * The URL for leaving the page for a level. Keeps the current query string,
 * except `version`, which names a project version that does not exist on
 * another level; the level's own parameters win.
 */
export function levelPageUrl(levelPath: string): string {
  const [path, levelQuery] = levelPath.split('?');
  const params = new URLSearchParams(window.location.search);
  params.delete('version');
  new URLSearchParams(levelQuery).forEach((value, key) =>
    params.set(key, value),
  );
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
