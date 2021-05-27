import {fullyLockedLessonMapping} from '@cdo/apps/code-studio/lessonLockRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {isStageHiddenForSection} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import {PUZZLE_PAGE_NONE} from './progressTypes';
import {
  activityCssClass,
  resultFromStatus
} from '@cdo/apps/code-studio/activityUtils';
import _ from 'lodash';

/**
 * This is conceptually similar to being a selector, except that it operates on
 * the entire store state. It is used by components to determine whether a
 * particular lesson is visible, or hidden entirely.
 * @param {number} lesson - the lesson we're querying
 * @param {object} state - State of our entire redux store
 * @param {ViewType} viewAs - Are we interested in whether the lesson is viewable
 *   for students or teachers
 * @returns {boolean} True if the provided lesson is visible
 */
export function lessonIsVisible(lesson, state, viewAs) {
  if (!viewAs) {
    throw new Error('missing param viewAs in lessonIsVisible');
  }

  const hiddenStageState = state.hiddenStage;
  const sectionId = state.teacherSections.selectedSectionId;

  const isHidden = isStageHiddenForSection(
    hiddenStageState,
    sectionId,
    lesson.id
  );
  return !isHidden || viewAs === ViewType.Teacher;
}

/**
 * Treat the lesson as locked if either
 * (a) it is locked for this user (in the case of a student)
 * (b) non-verified teacher
 * (c) signed out user
 * @param {number} lesson - the lesson we're querying
 * @param {object} state - State of our entire redux store
 * @param {ViewType} viewAs - Are we interested in whether the lesson is viewable
 *   for students or teachers
 * @returns {boolean} True if the provided lesson is visible
 */
export function lessonIsLockedForUser(lesson, levels, state, viewAs) {
  if (!lesson.lockable) {
    return false;
  }

  if (!state.currentUser.userId) {
    // Signed out user
    return true;
  } else if (viewAs === ViewType.Teacher) {
    return !state.lessonLock.lockableAuthorized;
  } else if (viewAs === ViewType.Student) {
    return stageLocked(levels);
  }
  return true;
}

/**
 * Check to see if a lesson is locked for all students in the current section
 * or not. If called as a student, this should always return false since they
 * don't have a selected section.
 * @param {number} lessonId - Id representing the stage/lesson we're curious about
 * @param {object} state - State of our entire redux store
 * @returns {boolean} True if the given lesson is locked for all students in the
 *   currently selected section.
 */
export function lessonIsLockedForAllStudents(lessonId, state) {
  const currentSectionId = state.teacherSections.selectedSectionId;
  const currentSection = state.lessonLock.lessonsBySectionId[currentSectionId];
  const fullyLockedStages = fullyLockedLessonMapping(currentSection);
  return !!fullyLockedStages[lessonId];
}

/**
 * @param {level[]} levels - A set of levels for a given stage
 * @returns {boolean} True if we should consider the stage to be locked for the
 *   current user.
 */
export function stageLocked(levels) {
  // For lockable stages, there is a requirement that they have exactly one LevelGroup,
  // and that it be the last level in the stage. Because LevelGroup's can have
  // multiple "pages", and single LevelGroup might appear as multiple levels/bubbles
  // on the client. However, it is the case that each page in the LG should have
  // an identical locked/unlocked state.
  // Given this, we should be able to look at the last level in our collection
  // to determine whether the LG (and thus the stage) should be considered locked.
  return !!levels[levels.length - 1].isLocked;
}

/**
 * @returns A friendly name for the icon name (that can be passed to FontAwesome)
 *   for the given level.
 */
export function getIconForLevel(level, inProgressView = false) {
  if (inProgressView && isLevelAssessment(level)) {
    return 'check-circle';
  }

  if (level.isUnplugged) {
    return 'scissors';
  }

  if (level.isLocked) {
    return 'lock';
  }

  if (level.icon) {
    // Eventually I'd like to have dashboard return an icon type. For now, I'm just
    // going to treat the css class it sends as a type, and map it to an icon name.
    const match = /fa-(.*)/.exec(level.icon);
    if (!match || !match[1]) {
      throw new Error('Unknown iconType: ' + level.icon);
    }
    return match[1];
  }

  if (level.bonus) {
    return 'flag-checkered';
  }

  // default to desktop
  return 'desktop';
}

/**
 * @returns Whether a level is an assessment level.
 */
export function isLevelAssessment(level) {
  return level.kind === 'assessment';
}

/**
 * Checks if a whole lesson is assessment levels
 * @param {[]} levels An array of levels
 * @returns {bool} If all the levels in a lesson are assessment levels
 */
export function lessonIsAllAssessment(levels) {
  return levels.every(level => level.kind === LevelKind.assessment);
}

/**
 * Checks if there are any levels in a lesson.
 * @param {object} lesson the lesson to check
 * @returns {bool} If the lesson has any levels
 */
export function lessonHasLevels(lesson) {
  return !!lesson.levels?.length;
}

/**
 * Computes summary of a student's progress in a lesson's levels.
 * @param {{id: studentLevelProgressType}} studentLevelProgress
 * An object keyed by level id containing objects representing the student's
 * progress in that level
 * @param {levelType[]} levels An array of levels
 * @returns {studentLessonProgressType}
 * An object representing student's progress in the lesson
 */
function lessonProgressForStudent(studentLevelProgress, lessonLevels) {
  // Filter any bonus levels as they do not count toward progress.
  const filteredLevels = lessonLevels.filter(level => !level.bonus);
  if (!filteredLevels.length) {
    return null;
  }

  const completedStatuses = [
    LevelStatus.perfect,
    LevelStatus.submitted,
    LevelStatus.free_play_complete,
    LevelStatus.completed_assessment
  ];

  let attempted = 0;
  let imperfect = 0;
  let completed = 0;
  let timeSpent = 0;
  let lastTimestamp = 0;

  filteredLevels.forEach(level => {
    const levelProgress = studentLevelProgress[level.id];
    if (levelProgress) {
      attempted += levelProgress.status === LevelStatus.attempted;
      imperfect += levelProgress.status === LevelStatus.passed;
      completed += completedStatuses.includes(levelProgress.status);
      timeSpent += levelProgress.timeSpent || 0;
      lastTimestamp = Math.max(lastTimestamp, levelProgress.lastTimestamp || 0);
    }
  });

  const incomplete = filteredLevels.length - completed - imperfect;
  const isLessonStarted = attempted + imperfect + completed > 0;

  if (!isLessonStarted) {
    return null;
  }

  const getPercent = count => (100 * count) / filteredLevels.length;
  return {
    incompletePercent: getPercent(incomplete),
    imperfectPercent: getPercent(imperfect),
    completedPercent: getPercent(completed),
    timeSpent: timeSpent,
    lastTimestamp: lastTimestamp
  };
}

/**
 * Computes studentLessonProgressType objects for each lesson from the provided
 * level progress data for each student.
 * @param {studentId: {levelId: studentLevelProgressType}} sectionLevelProgress
 * An object keyed by student id all the student's level progress data
 * @param {lessonType[]} lessons An array of lessons
 * @returns {studentId: {lessonId: studentLessonProgressType}}
 * An object containing lesson progress data for each student in a section
 */
export function lessonProgressForSection(sectionLevelProgress, lessons) {
  // create empty "dictionary" to store lesson progress for each student
  const sectionLessonProgress = {};
  Object.entries(sectionLevelProgress).forEach(
    // key: studentId, value: "dictionary" of level progress for that student
    ([studentId, studentLevelProgress]) => {
      // create empty "dictionary" to store per-lesson progress for student
      const studentLessonProgress = {};
      // for each lesson, summarize student's progress based on level progress
      lessons.forEach(lesson => {
        studentLessonProgress[lesson.id] = lessonProgressForStudent(
          studentLevelProgress,
          lesson.levels
        );
      });
      // add student progress to section progress
      sectionLessonProgress[studentId] = studentLessonProgress;
    }
  );
  return sectionLessonProgress;
}

/**
 * The level object passed down to use via the server (and stored in
 * script.stages.levels) contains more data than we need. This parses the parts
 * we care about to conform to our `levelType` oject.
 */
export const processedLevel = level => {
  return {
    id: level.activeId || level.id,
    url: level.url,
    name: level.name,
    progression: level.progression,
    progressionDisplayName: level.progression_display_name,
    kind: level.kind,
    icon: level.icon,
    isUnplugged: level.display_as_unplugged,
    levelNumber: level.kind === LevelKind.unplugged ? undefined : level.title,
    bubbleText:
      level.kind === LevelKind.unplugged
        ? undefined
        : level.letter || level.title.toString(),
    isConceptLevel: level.is_concept_level,
    bonus: level.bonus,
    pageNumber:
      typeof level.page_number !== 'undefined'
        ? level.page_number
        : PUZZLE_PAGE_NONE,
    sublevels:
      level.sublevels && level.sublevels.map(level => processedLevel(level))
  };
};

export const getLevelResult = serverProgress => {
  return serverProgress.result || resultFromStatus(serverProgress.status);
};

/**
 * `studentLevelProgressType.pages` is used by multi-page assessments,
 * and its presence (or absence) is how we distinguish those from single-page
 * assessments. `pages_completed` is an optional array of individual results
 * for each page (or null). Since we only have the results for the pages, we
 * need to create a `studentLevelProgressType` object from the results then
 * set the `locked` value from the parent progress.
 */
const getPagesProgress = serverProgress => {
  if (serverProgress.pages_completed?.length > 1) {
    return serverProgress.pages_completed.map(pageResult => {
      const pageProgress =
        (pageResult && levelProgressFromResult(pageResult)) ||
        levelProgressFromStatus(LevelStatus.not_tried);
      pageProgress.locked = serverProgress.locked || false;
      return pageProgress;
    });
  }
  return null;
};

/**
 * Parse a level progress object that we get from the server using either
 * /api/user_progress or /dashboardapi/section_level_progress into our
 * canonical studentLevelProgressType shape.
 * @param {object} serverProgress A progress object from the server
 * @returns {studentLevelProgressType} Our canonical progress shape
 */
export const levelProgressFromServer = serverProgress => {
  return {
    status: serverProgress.status || LevelStatus.not_tried,
    result: getLevelResult(serverProgress),
    locked: serverProgress.locked || false,
    paired: serverProgress.paired || false,
    timeSpent: serverProgress.time_spent,
    lastTimestamp: serverProgress.last_progress_at,
    pages: getPagesProgress(serverProgress)
  };
};

/**
 * Given an object from the server with student progress data keyed by level ID,
 * parse the progress data into our canonical studentLevelProgressType
 * @param {{levelId:serverProgress}} serverStudentProgress
 * @returns {{levelId:studentLevelProgressType}}
 */
export const processServerStudentProgress = serverStudentProgress => {
  return _.mapValues(serverStudentProgress, progress =>
    levelProgressFromServer(progress)
  );
};

/**
 * Given an object from the server with section progress data keyed by student
 * ID and level ID, parse the progress data into our canonical
 * studentLevelProgressType
 * @param {{studenId:{levelId:serverProgress}}} serverSectionProgress
 * @returns {{studenId:{levelId:studentLevelProgressType}}}
 */
export const processServerSectionProgress = serverSectionProgress => {
  return _.mapValues(serverSectionProgress, student =>
    processServerStudentProgress(student)
  );
};

/**
 * Create a studentLevelProgressType object with the provided status string
 * @param {string} status
 * @returns {studentLevelProgressType}
 */
export const levelProgressFromStatus = status => {
  return levelProgressFromServer({status: status});
};

/**
 * Create a studentLevelProgressType object from the provided result value.
 * This is used to merge progress data from session storage which only includes
 * a result value into our data model that uses studentLevelProgressType objects.
 * @param {number} result
 * @returns {studentLevelProgressType}
 */
export const levelProgressFromResult = result => {
  return levelProgressFromStatus(activityCssClass(result));
};
