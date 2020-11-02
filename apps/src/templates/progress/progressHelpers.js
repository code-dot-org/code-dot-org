import {fullyLockedStageMapping} from '@cdo/apps/code-studio/stageLockRedux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {isStageHiddenForSection} from '@cdo/apps/code-studio/hiddenStageRedux';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import {TestResults} from '@cdo/apps/constants';
import {
  activityCssClass,
  mergeActivityResult
} from '@cdo/apps/code-studio/activityUtils';
import _ from 'lodash';

export const PEER_REVIEW_ID_OFFSET = -100;

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

  // Don't show stage if not authorized to see lockable
  if (lesson.lockable && !state.stageLock.lockableAuthorized) {
    return false;
  } else if (viewAs === ViewType.Teacher) {
    return true;
  }

  const hiddenStageState = state.hiddenStage;
  const sectionId = state.teacherSections.selectedSectionId;

  const isHidden = isStageHiddenForSection(
    hiddenStageState,
    sectionId,
    lesson.id
  );
  return !isHidden;
}

/**
 * Check to see if a stage/lesson is locked for all stages in the current section
 * or not. If called as a student, this should always return false since they
 * don't have a selected section.
 * @param {number} lessonId - Id representing the stage/lesson we're curious about
 * @param {object} state - State of our entire redux store
 * @returns {boolean} True if the given lesson is locked for all students in the
 *   currently selected section.
 */
export function lessonIsLockedForAllStudents(lessonId, state) {
  const currentSectionId = state.teacherSections.selectedSectionId;
  const currentSection = state.stageLock.stagesBySectionId[currentSectionId];
  const fullyLockedStages = fullyLockedStageMapping(currentSection);
  return !!fullyLockedStages[lessonId];
}

/**
 * @param {levelType[]} levels - A set of levels for a given stage
 * @returns {boolean} True if we should consider the stage to be locked for the
 *   current user.
 */
export function stageLocked(levels, studentProgress) {
  // For lockable stages, there is a requirement that they have exactly one LevelGroup,
  // and that it be the last level in the stage. Because LevelGroup's can have
  // multiple "pages", and single LevelGroup might appear as multiple levels/bubbles
  // on the client. However, it is the case that each page in the LG should have
  // an identical locked/unlocked state.
  // Given this, we should be able to look at the last level in our collection
  // to determine whether the LG (and thus the stage) should be considered locked.
  const level = levels[levels.length - 1];
  const progress = studentProgress[level.id];
  if (!progress) {
    return false;
  }
  return (
    progress.status === LevelStatus.locked ||
    (level.kind === 'assessment' && progress.status === 'submitted')
  );
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
 * Checks if a whole stage is assessment levels
 * @param {levelType[]} levels An array of levels
 * @returns {bool} If all the levels in a stage are assessment levels
 */
export function stageIsAllAssessment(levels) {
  return levels.every(level => level.kind === LevelKind.assessment);
}

/**
 * Summarizes stage progress data.
 * @param {{id:studentLevelProgressType}} studentProgress An object keyed by
 * level id containing objects representing the student's progress in that level
 * @param {levelType[]} levels An array of the levels in a stage
 * @returns {object} An object with a total count of levels in each of the
 * following buckets: total, completed, imperfect, incomplete, attempted.
 */
export function summarizeProgressInStage(studentProgress, levels) {
  // Filter any bonus levels as they do not count toward progress.
  const filteredLevels = levels.filter(level => !level.bonus);

  // Get counts of statuses
  let statusCounts = {
    total: 0,
    completed: 0,
    imperfect: 0,
    incomplete: 0,
    attempted: 0
  };

  filteredLevels.forEach(level => {
    const levelProgress = studentProgress[level.id];
    if (!levelProgress) {
      return;
    }
    statusCounts.total++;
    switch (levelProgress.status) {
      case LevelStatus.perfect:
      case LevelStatus.submitted:
      case LevelStatus.free_play_complete:
      case LevelStatus.completed_assessment:
      case LevelStatus.readonly:
        statusCounts.completed++;
        break;
      case LevelStatus.not_tried:
        statusCounts.incomplete++;
        break;
      case LevelStatus.attempted:
        statusCounts.incomplete++;
        statusCounts.attempted++;
        break;
      case LevelStatus.passed:
        statusCounts.imperfect++;
        break;
      // All others are assumed to be not tried
      default:
        statusCounts.incomplete++;
    }
  });
  return statusCounts;
}

/**
 * Given a set of levels, groups them in sets of progressions, where each
 * progression is a set of adjacent levels sharing the same progression name
 * Any given level's progression name is determined by first looking to see if
 * the server provided us one as level.progression, otherwise we fall back to
 * just level.name
 * @param {levelType[]} levels
 * @returns {object[]} An array of progressions, where each consists of a name,
 *   the position of the progression in the input array, and the set of levels
 *   in the progression
 */
export const progressionsFromLevels = levels => {
  const progressions = [];
  if (levels.length === 0) {
    return progressions;
  }
  let currentProgression = {
    start: 0,
    name: levels[0].progression || levels[0].name,
    displayName: levels[0].progressionDisplayName || levels[0].name,
    levels: [levels[0]]
  };

  levels.slice(1).forEach((level, index) => {
    const progressionName = level.progression || level.name;
    if (progressionName === currentProgression.name) {
      currentProgression.levels.push(level);
    } else {
      progressions.push(currentProgression);
      currentProgression = {
        // + 1 because we sliced off the first element
        start: index + 1,
        name: level.progression || level.name,
        displayName: level.progressionDisplayName || level.name,
        levels: [level]
      };
    }
  });
  progressions.push(currentProgression);
  return progressions;
};

/**
 * The level object passed down to use from the server contains more data than
 * we need. This filters to the parts our views care about.
 */
export const processedLevel = (level, isSublevel = false) => {
  return {
    id: isSublevel ? level.level_id : level.activeId,
    url: level.url,
    name: level.name,
    progression: level.progression,
    progressionDisplayName: level.progression_display_name,
    kind: level.kind,
    icon: level.icon,
    isUnplugged: level.display_as_unplugged,
    levelNumber: level.kind === LevelKind.unplugged ? undefined : level.title,
    isConceptLevel: level.is_concept_level,
    bonus: level.bonus,
    sublevels:
      level.sublevels &&
      level.sublevels.map(level => processedLevel(level, true))
  };
};

const getLevelResult = serverProgress => {
  if (serverProgress.status === LevelStatus.locked) {
    return TestResults.LOCKED_RESULT;
  }
  if (serverProgress.readonly_answers) {
    return TestResults.READONLY_SUBMISSION_RESULT;
  }
  if (serverProgress.submitted) {
    return TestResults.SUBMITTED_RESULT;
  }

  return serverProgress.result || TestResults.NO_TESTS_RUN;
};

/**
 * Parse a level progress object that we get from the server using either
 * /api/user_progress or /dashboardapi/section_level_progress into our
 * canonical studentLevelProgressType shape.
 * @param {object} serverObject A progress object from the server
 * @returns {studentLevelProgressType} Our canonical progress shape
 */
export const levelProgressFromServer = serverObject => {
  return {
    status: serverObject.status || LevelStatus.not_tried,
    result: getLevelResult(serverObject),
    paired: serverObject.paired || false,
    timeSpent: serverObject.time_spent || 0
  };
};

/**
 * Given an object from the server with student progress data keyed by level ID,
 * parse the progress data into our canonical studenLevelProgressType
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
 * studenLevelProgressType
 * @param {{studenId:{levelId:serverProgress}}} serverSectionProgress
 * @returns {{studenId:{levelId:studentLevelProgressType}}}
 */
export const processServerSectionProgress = serverSectionProgress => {
  const studentProgress = _.mapValues(serverSectionProgress, student =>
    processServerStudentProgress(student)
  );
  return studentProgress;
};

/**
 * Create a studentLevelProgressType object with the provided status string
 * @param {string} status
 * @returns {studentLevelProgressType}
 */
export const levelProgressWithStatus = status => {
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
  return levelProgressWithStatus(activityCssClass(result));
};

/**
 * Merge a student result from session storage with a studentLevelProgressType
 * object from redux.
 * @returns {studentLevelProgressType}
 */
export const mergeLevelProgressWithResult = (progress, result) => {
  if (!progress) {
    return levelProgressFromResult(result);
  }
  const mergedResult = mergeActivityResult(progress.result, result);
  if (mergedResult === result) {
    return progress;
  }
  return levelProgressFromResult(mergedResult);
};

const lessonFromServer = (serverObject, stageNumber, overrides = {}) => {
  return {
    name: overrides.name || serverObject.name,
    id: overrides.id || serverObject.id,
    lockable: overrides.lockable || serverObject.lockable,
    lesson_plan_html_url:
      overrides.lesson_plan_html_url || serverObject.lesson_plan_html_url,
    description_student:
      overrides.description_student || serverObject.description_student,
    description_teacher:
      overrides.description_teacher || serverObject.description_teacher,
    stageNumber: stageNumber,
    levels:
      overrides.levels ||
      serverObject.levels.map(level => processedLevel(level))
  };
};

const levelGroupFromServer = serverObject => {
  return {
    id: serverObject.id,
    displayName: serverObject.display_name,
    bigQuestions: serverObject.big_questions,
    description: serverObject.description,
    lessons: []
  };
};

/**
 * Extract lesson group from our peerReviewLessonInfo if we have one.
 * We want this to end up having the same fields as our non-peer review groups.
 */
const peerReviewLessonGroup = peerReviewLessonInfo => {
  const levels = peerReviewLessonInfo.levels.map((level, index) => ({
    // These aren't true levels (i.e. we won't have an entry in progressByLevel),
    // so always use a specific id that won't collide with real levels
    id: PEER_REVIEW_ID_OFFSET,
    url: level.url,
    name: level.name,
    icon: level.locked ? level.icon : undefined,
    levelNumber: index + 1,
    kind: LevelKind.peer_review
  }));
  const lesson = lessonFromServer(peerReviewLessonInfo, null, {
    id: PEER_REVIEW_ID_OFFSET,
    lockable: false,
    levels: levels
  });
  return {
    // Peer reviews do not have descriptions or big questions
    // so they won't need an id to track clicks
    id: null,
    displayName: peerReviewLessonInfo.lesson_group_display_name,
    description: null,
    bigQuestions: null,
    lessons: [lesson]
  };
};

/**
 * Post-process lesson data sent from the server into our lessonGroup structure
 * to store in redux.
 * @param {[object]} stages Lesson data from server
 * @param {boolean} isPlc Whether lessons are PLC
 * @param {[object]} peerReviewLessonInfo Optional object with peer review info
 * @param {[boolean]} includeBonusLevels Optional flag to include bonus levels
 * @returns {lessonGroupType[lessonType[levelType[]]]}
 */
export const processLessonGroupData = (
  stages,
  isPlc,
  lessonGroups,
  peerReviewLessonInfo,
  includeBonusLevels = false
) => {
  const groupIndices = {};
  const groups = [];
  lessonGroups.forEach((group, index) => {
    groups.push(levelGroupFromServer(group));
    groupIndices[group.display_name] = index;
  });

  let nextStageNumber = 1;
  stages.forEach(stage => {
    const stageNumber = !isPlc && !stage.lockable ? nextStageNumber++ : null;
    const lesson = lessonFromServer(stage, stageNumber);
    if (!includeBonusLevels) {
      lesson.levels = lesson.levels.filter(level => !level.bonus);
    }
    groups[groupIndices[stage.lesson_group_display_name]].lessons.push(lesson);
  });

  if (peerReviewLessonInfo) {
    groups.push(peerReviewLessonGroup(peerReviewLessonInfo));
  }

  return groups;
};

export const getPercentPerfect = (levels, studentProgress) => {
  const puzzleLevels = levels.filter(level => !level.isConceptLevel);
  if (puzzleLevels.length === 0) {
    return 0;
  }

  const perfected = puzzleLevels.reduce(
    (accumulator, level) =>
      accumulator +
      ((studentProgress[level.id] &&
        studentProgress[level.id].status === LevelStatus.perfect) ||
        0),
    0
  );
  return perfected / puzzleLevels.length;
};
