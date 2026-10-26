import type {AnyAction} from '@reduxjs/toolkit';

import {getLevelNavigationHooks} from '../levelNavigation';
import {milestoneTimer} from '../MilestoneTimer';
import type {ProgressState} from '../types';
import {levelById, setCurrentLevelId} from './progressSlice';

// Only the progress slice is read, so any host store fits.
interface ProgressStoreLike {
  dispatch: (action: AnyAction) => unknown;
  getState: () => {progress: ProgressState};
}

/**
 * Follows the browser's back and forward buttons between levels that
 * navigateToLevelId changed in page. Install it once, on a script level page
 * whose lesson has levels that can share it; returns the uninstaller.
 */
export function installLevelNavigationHandler(
  store: ProgressStoreLike,
  initialLevelId: number,
): () => void {
  // The entry the page loaded on needs a level id to come back to.
  window.history.replaceState({levelId: initialLevelId}, '');

  const onPopState = async (event: PopStateEvent) => {
    const levelId: number | undefined = event.state?.levelId;
    if (!levelId) {
      return;
    }
    const progress = store.getState().progress;
    const previousLevelId = progress.currentLevelId;

    const hooks = getLevelNavigationHooks();
    if (hooks.confirmNavigation && !(await hooks.confirmNavigation())) {
      // The browser has already moved; put the current level's URL back.
      if (previousLevelId) {
        const previousLevel = levelById(
          progress,
          progress.currentLessonId,
          previousLevelId,
        );
        if (previousLevel?.path) {
          window.history.pushState(
            {levelId: previousLevelId},
            '',
            previousLevel.path + window.location.search,
          );
        }
      }
      return;
    }

    hooks.onLevelChange?.(previousLevelId, levelId);
    store.dispatch(setCurrentLevelId(levelId));
    milestoneTimer.resetMilestoneTimer();
  };

  window.addEventListener('popstate', onPopState);
  return () => window.removeEventListener('popstate', onPopState);
}
