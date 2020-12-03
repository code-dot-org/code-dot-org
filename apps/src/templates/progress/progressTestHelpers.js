/**
 * This is a set of helpers that is used to generate test level/lesson content.
 * It lives in src because it's used by both story files and test files, and it
 * better to have test require helpers from src, then story files in src reach
 * into test.
 */

import _ from 'lodash';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {levelProgressWithStatus} from '@cdo/apps/templates/progress/progressHelpers';
import {createStore} from 'redux';
import Immutable from 'immutable';

export const fakeLesson = (
  name,
  id,
  lockable = false,
  stageNumber = undefined
) => ({
  name,
  id,
  lockable,
  stageNumber,
  isFocusArea: false
});

export const fakeLevel = (overrides = {}) => {
  const levelNumber = overrides.levelNumber || 1;
  return {
    id: overrides.id || levelNumber,
    levelNumber: levelNumber,
    bubbleTitle: levelNumber.toString(),
    url: `/level${levelNumber}`,
    name: `Level ${levelNumber}`,
    ...overrides
  };
};

export const fakeLevels = (numLevels, {startLevel = 1, named = true} = {}) =>
  _.range(numLevels).map(index => {
    let overrideData = {
      id: index + startLevel,
      levelNumber: index + startLevel
    };
    if (!named) {
      overrideData['name'] = undefined;
    }
    return fakeLevel(overrideData);
  });

export const fakeProgressForLevels = (
  levels,
  status = LevelStatus.not_tried
) => {
  const progress = {};
  levels.forEach(level => {
    progress[level.id] = levelProgressWithStatus(status);
  });
  return progress;
};

/**
 * Creates the shell of a redux store with the provided lessonId being hidden
 * @param {ViewType} viewAs
 * @param {number?} lessonId - Lesson to hide (or null if none)
 */
export const createStoreWithHiddenLesson = (viewAs, lessonId) => {
  return createStore(state => state, {
    stageLock: {
      stagesBySectionId: {
        11: {}
      }
    },
    viewAs: viewAs,
    teacherSections: {
      selectedSectionId: 11
    },
    hiddenStage: Immutable.fromJS({
      stagesBySection: {
        11: {[lessonId]: true}
      }
    }),
    progress: {
      showTeacherInfo: false
    }
  });
};
