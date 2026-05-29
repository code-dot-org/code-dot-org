// browserNavigation
//
// This file contains some functionality related to navigating through
// levels without doing page reloads.

import {setCurrentLevelId} from '@cdo/apps/code-studio/progressRedux';
import {levelById} from '@cdo/apps/code-studio/progressReduxSelectors';

import Lab2Registry from '../lab2/Lab2Registry';
import notifyLevelChange from '../lab2/utils/notifyLevelChange';
import {getStore} from '../redux';

// Returns whether we can safely navigate between the two given levels
// without reloading the whole page.
export function canChangeLevelInPage(currentLevel, newLevel) {
  // If we are on the summary page, we can't navigate to a new level without
  // reloading the page. Summary is used for viewing student responses to
  // predict levels.
  const path = new URL(document.location).pathname;
  const pathComponents = path.split('/');
  if (pathComponents.includes('summary')) {
    return false;
  }
  // Otherwise, we can navigate between any 2 lab2 levels.
  return currentLevel?.usesLab2 && newLevel?.usesLab2;
}

// Called once on page load for a script-level only, this sets up a
// handler, for user-initiated browser back & forward button
// presses, which is fired when arriving on a page that we pushed onto the
// browser session history stack.
export function setupNavigationHandler(initialLevelId) {
  // Store the starting level ID in the browser history stack.
  window.history.replaceState({levelId: initialLevelId}, '');
  window.addEventListener('popstate', async function (event) {
    const levelId = event.state?.levelId;
    if (!levelId) {
      return;
    }
    const store = getStore();
    const progressStoreState = store.getState().progress;
    const previousLevelId = progressStoreState.currentLevelId;
    const levelNavigationConfirmation =
      Lab2Registry.getInstance().getLevelNavigationConfirmation();
    if (levelNavigationConfirmation && !(await levelNavigationConfirmation())) {
      // Restore URL history for the current level when navigation is canceled.
      if (previousLevelId && progressStoreState.currentLessonId) {
        const previousLevel = levelById(
          progressStoreState,
          progressStoreState.currentLessonId,
          previousLevelId
        );
        if (previousLevel?.path) {
          window.history.pushState(
            {levelId: previousLevelId},
            '',
            previousLevel.path + window.location.search
          );
        }
      }
      return;
    }
    // Notify the Lab2 system (that handles changing levels without reload) about the level change.
    notifyLevelChange(previousLevelId || null, levelId);
    store.dispatch(setCurrentLevelId(levelId));
  });
}

// Handles a user navigation to a new level, by pushing this new level's URL
// onto the browser session history stack, and updating the window title.
export function updateBrowserForLevelNavigation(
  progressStoreState,
  levelPath,
  levelId
) {
  window.history.pushState({levelId}, '', levelPath + window.location.search);
  setWindowTitle(progressStoreState, levelId);
}

// If we are on a new level without doing a page reload, then we should set the title
// to match what levels_helper.rb's level_title function would have done.
export function setWindowTitle(progressStoreState, newLevelId) {
  const lesson = progressStoreState.lessons.find(
    lesson => lesson.id === progressStoreState.currentLessonId
  );
  const numLessons = lesson.num_script_lessons;
  const lessonName = lesson.name;
  const lessonIndex =
    lesson.levels.findIndex(level => level.activeId === newLevelId) + 1;
  const scriptDisplayName = progressStoreState.scriptDisplayName;

  document.title =
    numLessons > 1
      ? `${lessonName} #${lessonIndex} | ${scriptDisplayName} - Code.org`
      : `${lessonName} #${lessonIndex} - Code.org`;
}
