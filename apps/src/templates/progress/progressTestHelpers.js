/**
 * This is a set of helpers that is used to generate test level/lesson content.
 * It lives in src because it's used by both story files and test files, and it
 * better to have test require helpers from src, then story files in src reach
 * into test.
 */

import _ from 'lodash';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {
  levelProgressFromServer,
  lessonProgressForSection
} from '@cdo/apps/templates/progress/progressHelpers';
import {createStore} from 'redux';
import Immutable from 'immutable';

export const fakeLesson = (
  name,
  id,
  lockable = false,
  lessonNumber = undefined
) => ({
  name,
  id,
  lockable,
  lessonNumber,
  isFocusArea: false
});

export const fakeLevel = (overrides = {}) => {
  const levelNumber = overrides.levelNumber || 1;
  const id = (overrides.id || levelNumber).toString();
  delete overrides.id;
  return {
    id: id,
    status: LevelStatus.not_tried,
    isLocked: false,
    levelNumber: levelNumber,
    bubbleText: levelNumber.toString(),
    url: `/level${levelNumber}`,
    name: `Level ${levelNumber}`,
    isUnplugged: false,
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
  status = LevelStatus.not_tried,
  serverProgressOverrides = {}
) => {
  const progress = {};
  levels.forEach(level => {
    progress[level.id] = levelProgressFromServer({
      status: status,
      ...serverProgressOverrides
    });
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
    lessonLock: {
      lessonsBySectionId: {
        '11': {}
      },
      lockableAuthorized: false
    },
    viewAs: viewAs,
    teacherSections: {
      selectedSectionId: '11'
    },
    hiddenLesson: Immutable.fromJS({
      lessonsBySection: {
        '11': {[lessonId]: true}
      }
    }),
    progress: {
      showTeacherInfo: false
    },
    currentUser: {
      userId: 1
    }
  });
};

/**
 * Creates the shell of a redux store with the provided lessonId being hidden
 * @param {ViewType} viewAs
 * @param {number?} lessonId - Lesson to hide (or null if none)
 */
export const createStoreWithLockedLesson = (
  viewAs,
  lockableAuthorized = false
) => {
  return createStore(state => state, {
    lessonLock: {
      lessonsBySectionId: {
        '11': {}
      },
      lockableAuthorized: lockableAuthorized
    },
    viewAs: viewAs,
    teacherSections: {
      selectedSectionId: '11'
    },
    hiddenLesson: Immutable.fromJS({
      lessonsBySection: {
        '11': {[lessonId]: true}
      }
    }),
    progress: {
      showTeacherInfo: false
    },
    currentUser: {
      userId: 1
    }
  });
};

const randomNumberUpTo100 = () => {
  return Math.floor(Math.random() * 100);
};

let lessonId = 1;

export const fakeLessonWithLevels = (overrideFields = {}, levelCount = 1) => {
  const position = overrideFields.position || randomNumberUpTo100();
  return {
    id: lessonId++,
    name: `Lesson - ${position}`,
    lockable: false,
    relative_position: position,
    position: position,
    levels: fakeLevels(levelCount),
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

export const fakeStudentLevelProgress = (
  levels,
  students,
  serverProgressOverrides = {}
) => {
  const progressOnLessons = fakeProgressForLevels(
    levels,
    serverProgressOverrides.status,
    serverProgressOverrides
  );

  const studentProgress = {};
  students.forEach(student => {
    studentProgress[student.id] = progressOnLessons;
  });

  return studentProgress;
};

export const fakeStudentLastUpdate = students => {
  const studentLastUpdate = {};
  students.forEach(student => {
    studentLastUpdate[student.id] = Date.now();
  });
  return studentLastUpdate;
};

export const fakeStudentLastUpdateByScript = (scriptData, students) => {
  return {[scriptData.id]: fakeStudentLastUpdate(students)};
};

export const fakeProgressTableReduxInitialState = (
  stages,
  scriptData,
  students = fakeStudents(2)
) => {
  if (!stages) {
    const lesson1 = fakeLessonWithLevels({position: 1, levels: fakeLevels(1)});
    const lesson2 = fakeLessonWithLevels({position: 2, levels: fakeLevels(2)});
    stages = [lesson1, lesson2];
  }
  if (!scriptData) {
    scriptData = fakeScriptData({stages});
  }
  const levelProgressData = fakeStudentLevelProgress(
    scriptData.stages[0].levels,
    students
  );

  return {
    progress: {
      lessonGroups: [],
      lessons: stages,
      focusAreaLessonIds: [],
      professionalLearningCourse: false
    },
    sectionData: {
      section: fakeSection(students)
    },
    sectionProgress: {
      scriptDataByScript: {[scriptData.id]: scriptData},
      studentLevelProgressByScript: {
        [scriptData.id]: levelProgressData
      },
      studentLessonProgressByScript: {
        [scriptData.id]: lessonProgressForSection(
          levelProgressData,
          scriptData.stages
        )
      },
      studentLastUpdateByScript: fakeStudentLastUpdateByScript(
        scriptData,
        students
      ),
      lessonOfInterest: 1
    },
    scriptSelection: {scriptId: scriptData.id},
    locales: {localeCode: 'en-US'}
  };
};
