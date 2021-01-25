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
  const id = (overrides.id || levelNumber).toString();
  delete overrides.id;
  return {
    id: id,
    status: LevelStatus.not_tried,
    levelNumber: levelNumber,
    bubbleText: levelNumber.toString(),
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
        '11': {}
      }
    },
    viewAs: viewAs,
    teacherSections: {
      selectedSectionId: '11'
    },
    hiddenStage: Immutable.fromJS({
      stagesBySection: {
        '11': {[lessonId]: true}
      }
    }),
    progress: {
      showTeacherInfo: false
    }
  });
};

const randomNumberUpTo100 = () => {
  return Math.floor(Math.random() * 100);
};

export const fakeLessonWithLevels = (overrideFields = {}) => {
  const position = overrideFields.position || randomNumberUpTo100();
  return {
    name: `Lesson - ${position}`,
    lockable: false,
    relative_position: position,
    position: position,
    levels: fakeLevels(1),
    ...overrideFields
  };
};

export const fakeSection = students => {
  return {
    id: randomNumberUpTo100(),
    students
  };
};

export const fakeStudents = studentCount => {
  return Array(studentCount)
    .fill()
    .map((_, i) => ({
      id: i,
      name: `student-${i}`
    }));
};

export const fakeScriptData = (overrideFields = {}) => {
  return {
    id: 1,
    name: 'csd1-2020',
    title: 'CSD Unit 1 - Problem Solving and Computing (20-21)',
    stages: [],
    ...overrideFields
  };
};

export const fakeStudentLevelProgress = (levels, students) => {
  const progressOnLessons = fakeProgressForLevels(levels);

  const studentProgress = {};
  students.forEach(student => {
    studentProgress[student.id] = progressOnLessons;
  });

  return studentProgress;
};

export const fakeStudentLastUpdateByScript = (scriptData, students) => {
  const studentLastUpdate = {};
  students.forEach(student => {
    studentLastUpdate[student.id] = Date.now();
  });

  return {[scriptData.id]: studentLastUpdate};
};
