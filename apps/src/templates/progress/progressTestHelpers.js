/**
 * This is a set of helpers that is used to generate test level/lesson content.
 * It lives in src because it's used by both story files and test files, and it
 * better to have test require helpers from src, then story files in src reach
 * into test.
 */

import Immutable from 'immutable';
import _ from 'lodash';
import {createStore} from 'redux';

import {
  levelProgressFromServer,
  lessonProgressForSection,
} from '@cdo/apps/templates/progress/progressHelpers';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

export const fakeLesson = (
  name,
  id,
  lockable = false,
  lessonNumber = undefined,
  lessonStartUrl = 'code.org',
  levels = []
) => ({
  name,
  id,
  lockable,
  lessonNumber,
  lessonStartUrl,
  isFocusArea: false,
  levels,
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
    ...overrides,
  };
};

export const fakeLevelWithSubLevels = (
  numSublevels,
  startLevel = 1,
  overrides = {}
) => {
  const sublevels = _.range(numSublevels).map(index => {
    const overrideData = {
      id: index + startLevel,
      levelNumber: index + startLevel,
    };
    return fakeLevel(overrideData);
  });
  return fakeLevel({
    sublevels: sublevels,
    id: startLevel + numSublevels,
    levelNumber: startLevel + numSublevels,
    ...overrides,
  });
};

export const fakeLevels = (numLevels, {startLevel = 1, named = true} = {}) =>
  _.range(numLevels).map(index => {
    let overrideData = {
      id: index + startLevel,
      levelNumber: index + startLevel,
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
      ...serverProgressOverrides,
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
  const sectionId = 11;
  return createStore(state => state, {
    lessonLock: {
      lessonsBySectionId: {
        [sectionId]: {},
      },
      lockableAuthorized: false,
      lockableAuthorizedLoaded: true,
      lessonsBySectionIdLoaded: true,
    },
    viewAs: viewAs,
    teacherSections: {
      sectionIds: [sectionId],
      sectionsAreLoaded: true,
      sections: {
        [sectionId]: {
          id: 11,
          name: 'test section',
          lesson_extras: true,
          pairing_allowed: true,
          studentCount: 4,
          code: 'TQGSJR',
          providerManaged: false,
          lessons: {},
          ttsAutoplayEnabled: false,
          lessonExtras: false,
          pairingAllowed: true,
        },
      },
      selectedSectionId: sectionId,
    },
    hiddenLesson: Immutable.fromJS({
      lessonsBySection: {
        [sectionId]: {[lessonId]: true},
      },
    }),
    progress: {
      scriptName: 'script-name',
      scriptId: 17,
      unitProgressHasLoaded: true,
    },
    currentUser: {
      userId: 1,
    },
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
  const sectionId = 11;
  return createStore(state => state, {
    lessonLock: {
      lessonsBySectionId: {
        [sectionId]: {},
      },
      lessonsBySectionIdLoaded: true,
      lockableAuthorized: lockableAuthorized,
      lockableAuthorizedLoaded: true,
    },
    viewAs: viewAs,
    teacherSections: {
      selectedSectionId: sectionId,
    },
    hiddenLesson: Immutable.fromJS({
      lessonsBySection: {
        [sectionId]: {[lessonId]: true},
      },
    }),
    progress: {
      unitProgressHasLoaded: true,
    },
    currentUser: {
      userId: 1,
    },
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
    title: `Lesson ${position}: Lesson - ${position}`,
    lockable: false,
    relative_position: position,
    position: position,
    levels: fakeLevels(levelCount),
    ...overrideFields,
  };
};

export const fakeStudents = studentCount => {
  return Array(studentCount)
    .fill()
    .map((_, i) => ({
      id: i,
      name: `student-${i}`,
      familyName: `student-${studentCount - i}`,
    }));
};

export const fakeUnitData = (overrideFields = {}) => {
  return {
    id: 1,
    name: 'csd1-2020',
    title: 'CSD Unit 1 - Problem Solving and Computing (20-21)',
    csf: false,
    isCsd: true,
    isCsp: false,
    lessons: [],
    ...overrideFields,
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
  lessons,
  scriptData,
  students = fakeStudents(2)
) => {
  if (!lessons) {
    const lesson1 = fakeLessonWithLevels({position: 1, levels: fakeLevels(1)});
    const lesson2 = fakeLessonWithLevels({position: 2, levels: fakeLevels(2)});
    lessons = [lesson1, lesson2];
  }
  if (!scriptData) {
    scriptData = fakeUnitData({lessons: lessons});
  }
  const levelProgressData = fakeStudentLevelProgress(
    scriptData.lessons[0].levels,
    students
  );

  const sectionId = randomNumberUpTo100();

  return {
    currentUser: {
      isSortedByFamilyName: false,
    },
    progress: {
      lessonGroups: [],
      lessons: lessons,
      focusAreaLessonIds: [],
      deeperLearningCourse: false,
    },
    teacherSections: {
      sections: [{id: sectionId}],
      selectedSectionId: sectionId,
      selectedStudents: students,
    },
    sectionProgress: {
      unitDataByUnit: {[scriptData.id]: scriptData},
      studentLevelProgressByUnit: {
        [scriptData.id]: levelProgressData,
      },
      studentLessonProgressByUnit: {
        [scriptData.id]: lessonProgressForSection(
          levelProgressData,
          scriptData.lessons
        ),
      },
      studentLastUpdateByUnit: fakeStudentLastUpdateByScript(
        scriptData,
        students
      ),
      lessonOfInterest: 1,
    },
    unitSelection: {scriptId: scriptData.id},
    locales: {localeCode: 'en-US'},
  };
};
