// Selectors and related helpers for progressRedux. These are in their own file
// because they are quite complex and progressRedux.js is already quite large.

import _ from 'lodash';
import {LevelStatus, LevelKind} from '@cdo/apps/util/sharedConstants';
import {processedLevel} from '@cdo/apps/templates/progress/progressHelpers';
import {TestResults} from '@cdo/apps/constants';
import {activityCssClass} from './activityUtils';

const PEER_REVIEW_ID = -1;

// Selectors

// Do we have one or more lockable lessons
export const hasLockableLessons = state =>
  state.lessons.some(lesson => lesson.lockable);

export const hasGroups = state => Object.keys(groupedLessons(state)).length > 1;

/**
 * Extract the relevant portions of a particular lesson from the store.
 * Note, that this does not include levels
 * @param {object} state - The progress state in our redux store
 * @param {number} lessonIndex - The index into our lessons we care about
 * @returns {Lesson}
 */
const lessonFromLessonAtIndex = (state, lessonIndex) => ({
  ...lessonFromLesson(state.lessons[lessonIndex]),
  isFocusArea: state.focusAreaLessonIds.includes(state.lessons[lessonIndex].id),
});

const lessonFromLesson = lesson =>
  _.pick(lesson, [
    'name',
    'id',
    'lockable',
    'lessonNumber',
    'lessonStartUrl',
    'lesson_plan_html_url',
    'lesson_feedback_url',
    'student_lesson_plan_html_url',
    'description_student',
    'description_teacher',
  ]);
export const lessons = state =>
  state.lessons.map((_, index) => lessonFromLessonAtIndex(state, index));

/**
 * Extract lesson from our peerReviewLessonInfo if we have one. We want this to end up
 * having the same fields as our non-peer review lessons.
 */
const peerReviewLesson = state => ({
  ...lessonFromLesson(state.peerReviewLessonInfo),
  // add some fields that are missing for this lesson but required for lessonType
  id: PEER_REVIEW_ID,
  lockable: false,
  isFocusArea: false,
});

/**
 * Extract levels from our peerReviewLessonInfo, making sure the levels have the same
 * set of fields as our non-peer review levels.
 */
const peerReviewLevels = state =>
  state.peerReviewLessonInfo.levels.map((level, index) => ({
    // These aren't true levels (i.e. we won't have an entry in levelResults),
    // so always use a specific id that won't collide with real levels
    ...level,
    id: PEER_REVIEW_ID.toString(),
    isLocked: level.locked,
    status: level.status || LevelStatus.not_tried,
    levelNumber: index + 1,
  }));

/**
 * Returns whether we appear to be in a script level or a standalone level.
 * A script level is identified because it has lessons.
 * A standalone level doesn't have lessons, but it does have a level ID.
 */
export const ProgressLevelType = {
  SCRIPT_LEVEL: 'script_level',
  LEVEL: 'level',
};

export const getProgressLevelType = state => {
  if (state.progress.lessons) {
    return ProgressLevelType.SCRIPT_LEVEL;
  } else if (state.progress.currentLevelId) {
    return ProgressLevelType.LEVEL;
  } else {
    return undefined;
  }
};

/**
 * Returns the dashboard URL path to retrieve the level properties for a script
 * level (if we have lessons) or a level (if we don't have lessons). If we don't
 * have a current level, this returns undefined.
 */
export const getLevelPropertiesPath = state => {
  if (state.progress.lessons) {
    const scriptName = state.progress.scriptName;
    const lessonPosition = state.progress.lessons?.find(
      lesson => lesson.id === state.progress.currentLessonId
    ).relative_position;
    const levelNumber =
      levelsForLessonId(
        state.progress,
        state.progress.currentLessonId
      ).findIndex(level => level.isCurrentLevel) + 1;
    return `/s/${scriptName}/lessons/${lessonPosition}/levels/${levelNumber}/level_properties`;
  } else if (state.progress.currentLevelId !== null) {
    const levelId = state.progress.currentLevelId;
    return `/levels/${levelId}/level_properties`;
  } else {
    return undefined;
  }
};

/**
 * The level object passed down to use via the server (and stored in lesson.lessons.levels)
 * contains more data than we need. This (a) filters to the parts our views care
 * about and (b) determines current status based on the current state of
 * state.levelResults
 */
const levelWithProgress = (
  {levelResults, unitProgress, levelPairing = {}, currentLevelId},
  level,
  isLockable
) => {
  const normalizedLevel = processedLevel(level);
  if (level.ids) {
    // make sure we're using the id with best progress
    normalizedLevel.id = bestResultLevelId(level.ids, levelResults);
  }

  // default values
  let status = LevelStatus.not_tried;
  let locked = isLockable;
  let teacherFeedbackReviewState = null;

  let levelProgress = unitProgress[normalizedLevel.id];
  if (levelProgress?.pages) {
    levelProgress = levelProgress.pages[normalizedLevel.pageNumber - 1];
  }
  if (levelProgress) {
    // if we have levelProgress, overwrite default values
    status = levelProgress.status;
    locked = levelProgress.locked;
    teacherFeedbackReviewState = levelProgress.teacherFeedbackReviewState;
  } else if (level.kind !== LevelKind.assessment) {
    // if we don't have levelProgress, get the status from `levelResults`.
    // however, `levelResults` doesn't track per-page results for multi-page
    // assessments, so for assessments we leave default values.
    //
    // note: if we're not using levelProgress, `isLocked` will always be false.
    status = activityCssClass(levelResults[normalizedLevel.id]);
  }
  const isCurrent =
    normalizedLevel.id === currentLevelId ||
    !!level.ids?.includes[currentLevelId];

  return {
    ...normalizedLevel,
    status: status,
    isCurrentLevel: isCurrent,
    paired: levelPairing[level.activeId],
    isLocked: locked,
    teacherFeedbackReviewState: teacherFeedbackReviewState,
  };
};

/**
 * Get level data for all lessons
 */
export const levelsByLesson = ({
  lessons,
  levelResults,
  unitProgress,
  levelPairing,
  currentLevelId,
}) =>
  lessons.map(lesson =>
    lesson.levels.map(level => {
      let statusLevel = levelWithProgress(
        {levelResults, unitProgress, levelPairing, currentLevelId},
        level,
        lesson.lockable
      );
      if (statusLevel.sublevels) {
        statusLevel.sublevels = level.sublevels.map(sublevel =>
          levelWithProgress(
            {levelResults, unitProgress, levelPairing, currentLevelId},
            sublevel,
            lesson.lockable
          )
        );
      }
      return statusLevel;
    })
  );

/**
 * Get data for a particular lesson
 */
export const levelsForLessonId = (state, lessonId) => {
  const lesson = state.lessons?.find(lesson => lesson.id === lessonId);
  return lesson?.levels.map(level =>
    levelWithProgress(state, level, lesson.lockable)
  );
};

/**
 * Get the index of the current level. On script levels, check
 * which level has isCurrentLevel set. For single levels, return 0.
 * Otherwise, return undefined.
 */
export const currentLevelIndex = state => {
  if (getProgressLevelType(state) === ProgressLevelType.LEVEL) {
    return 0;
  }
  if (getProgressLevelType(state) === ProgressLevelType.SCRIPT_LEVEL) {
    return levelsForLessonId(
      state.progress,
      state.progress.currentLessonId
    ).findIndex(level => level.isCurrentLevel);
  }
  return undefined;
};

/**
 * Get the next level ID in the progression if it exists.
 * Returns undefined if not currently in a script level or
 * currently on the last level.
 */
export const nextLevelId = state => {
  if (getProgressLevelType(state) !== ProgressLevelType.SCRIPT_LEVEL) {
    return undefined;
  }

  const levels = levelsForLessonId(
    state.progress,
    state.progress.currentLessonId
  );
  const currentLevelIndex = levels.findIndex(level => level.isCurrentLevel);
  if (currentLevelIndex === levels.length - 1) {
    return undefined;
  }

  const nextLevel = levels[currentLevelIndex + 1];
  return nextLevel.id;
};

export const levelCount = state => {
  if (getProgressLevelType(state) === ProgressLevelType.LEVEL) {
    return 1;
  }
  if (getProgressLevelType(state) === ProgressLevelType.SCRIPT_LEVEL) {
    return levelsForLessonId(state.progress, state.progress.currentLessonId)
      .length;
  }
  return 0;
};

export const lessonExtrasUrl = (state, lessonId) =>
  state.lessonExtrasEnabled
    ? state.lessons.find(lesson => lesson.id === lessonId)
        .lesson_extras_level_url
    : '';

export const isPerfect = (state, levelId) =>
  !!state.levelResults &&
  state.levelResults[levelId] >= TestResults.MINIMUM_OPTIMAL_RESULT;

/**
 * Groups lessons according to LessonGroup.
 * @returns {Object[]}
 * {string} Object.name
 * {string[]} Object.lessonNames
 * {Object[]} Object.lessonLevels
 */
export const groupedLessons = (state, includeBonusLevels = false) => {
  let byGroup = {};

  const allLevels = levelsByLesson(state);

  state.lessonGroups.forEach(lessonGroup => {
    byGroup[lessonGroup.display_name] = {
      lessonGroup: {
        id: lessonGroup.id,
        userFacing: lessonGroup.user_facing,
        displayName: lessonGroup.display_name,
        description: lessonGroup.description,
        bigQuestions: lessonGroup.big_questions,
      },
      lessons: [],
      levelsByLesson: [],
    };
  });

  state.lessons.forEach((lesson, index) => {
    const group = lesson.lesson_group_display_name;
    const lessonAtIndex = lessonFromLessonAtIndex(state, index);
    let lessonLevels = allLevels[index];
    if (!includeBonusLevels) {
      lessonLevels = lessonLevels.filter(level => !level.bonus);
    }

    if (byGroup[group]) {
      byGroup[group].lessons.push(lessonAtIndex);
      byGroup[group].levelsByLesson.push(lessonLevels);
    }
  });

  // Peer reviews get their own group, but these levels/lesson are stored
  // separately from our other levels/lessons in redux (since they're slightly
  // different)
  if (state.peerReviewLessonInfo) {
    byGroup[state.peerReviewLessonInfo.lesson_group_display_name] = {
      group: state.peerReviewLessonInfo.lesson_group_display_name,
      lessonGroup: {
        id: null, //Peer reviews do not have descriptions or big questions so they won't need an id to track clicks
        displayName: state.peerReviewLessonInfo.lesson_group_display_name,
        description: null,
        bigQuestions: null,
      },
      lessons: [peerReviewLesson(state)],
      levelsByLesson: [peerReviewLevels(state)],
    };
  }

  // We want to return an array of categories
  return _.values(byGroup);
};

/**
 * Given a set of levels, groups them in sets of progressions, where each
 * progression is a set of adjacent levels sharing the same progression name
 * Any given level's progression name is determined by first looking to see if
 * the server provided us one as level.progression, otherwise we fall back to
 * just level.name
 * @param {Level[]} levels
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
    levels: [levels[0]],
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
        levels: [level],
      };
    }
  });
  progressions.push(currentProgression);
  return progressions;
};

// Helpers

/**
 * Return the level with the highest progress, or the first level if none have
 * been attempted
 * @param {number[]} levelIds
 * @param {Object.<number,number>} - Mapping from level id to progress result
 */
function bestResultLevelId(levelIds, progressData) {
  // The usual case
  if (levelIds.length === 1) {
    return levelIds[0];
  }

  // Return the level with the highest result
  var attemptedIds = levelIds.filter(id => progressData[id]);
  if (attemptedIds.length === 0) {
    // None of them have been attempted, just return the first
    return levelIds[0];
  }
  var bestId = attemptedIds[0];
  var bestResult = progressData[bestId];
  attemptedIds.forEach(function (id) {
    var result = progressData[id];
    if (result > bestResult) {
      bestId = id;
      bestResult = result;
    }
  });
  return bestId;
}

// export private function(s) to expose to unit testing
export const __testonly__ = IN_UNIT_TEST
  ? {
      bestResultLevelId,
      peerReviewLesson,
      peerReviewLevels,
      PEER_REVIEW_ID,
    }
  : {};
