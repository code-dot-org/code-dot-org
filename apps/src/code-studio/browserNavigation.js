// browserNavigation
//
// This file contains some functionality related to navigating through
// levels without doing page reloads.

import {getStore} from '../redux';
import {setCurrentLevelId} from '@cdo/apps/code-studio/progressRedux';

// Returns whether we can safely navigate between the two given levels
// without reloading the whole page.
export function canChangeLevelInPage(currentLevel, newLevel) {
  return currentLevel?.usesLab2 && newLevel?.usesLab2;
}

// Called once on page load for a script-level only, this sets up a
// handler, for user-initiated browser back & forward button
// presses, which is fired when arriving on a page that we pushed onto the
// browser session history stack.
export function setupNavigationHandler(lessonData) {
  window.addEventListener('popstate', function (event) {
    // A path looks like this: /s/allthethings/lessons/46/levels/2
    // The level number will be at index 6 of a string split on '/'.
    const levelNumberStringIndex = 6;

    const path = new URL(document.location).pathname;
    if (!path) {
      return;
    }

    const values = path.split('/', levelNumberStringIndex + 1);
    if (values.length < levelNumberStringIndex + 1) {
      return;
    }

    const levelNumber = Number(values[6]);
    if (!Number.isInteger(levelNumber) || levelNumber <= 0) {
      return;
    }

    const levelIndex = levelNumber - 1;
    const levelId = lessonData.levels[levelIndex].activeId;

    // Update the progress redux store.
    getStore().dispatch(setCurrentLevelId(levelId));
  });
}

// Handles a user navigation to a new level, by pushing this new level's URL
// onto the browser session history stack, and updating the window title.
export function updateBrowserForLevelNavigation(
  progressStoreState,
  levelUrl,
  levelId
) {
  window.history.pushState({}, '', levelUrl + window.location.search);
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
