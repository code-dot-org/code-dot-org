import PropTypes from 'prop-types';

/**
 * See ApplicationHelper::PUZZLE_PAGE_NONE.
 */
export const PUZZLE_PAGE_NONE = -1;

/**
 * @typedef {Object} Student
 *
 * @property {number} id
 * @property {string} name
 */
export const studentType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired
});

/**
 * @typedef {Object} Level
 *
 * @property {string} id The id of the level. It is intentionally
 *   a string (despite always being numerical) because it gets
 *   used as a key in JS objects and is used in the url.
 * @property {string} url
 * @property {string} name
 * @property {string} icon
 * @property {bool} isUnplugged
 * @property {number} levelNumber
 * @property {bool} isConceptLevel
 * @property {string} kind
 * @property {number} pageNumber The page number of the level if
 *   this is a multi-page level, or PUZZLE_PAGE_NONE
 * @property {array} sublevels An optional array of recursive sublevel objects
 */
const levelShape = {
  id: PropTypes.string.isRequired,
  levelNumber: PropTypes.number,
  bubbleText: PropTypes.string,
  kind: PropTypes.string,
  url: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.string,
  isUnplugged: PropTypes.bool,
  isConceptLevel: PropTypes.bool,
  pageNumber: PropTypes.number
  /** sublevels: PropTypes.array */ // See below
};
// Avoid recursive definition
levelShape.sublevels = PropTypes.arrayOf(PropTypes.shape(levelShape));

export const levelType = PropTypes.shape(levelShape);

/**
 * @typedef {Object} LevelWithProgress
 *
 * @property {string} status
 * @property {bool} isLocked
 * @property {bool} isCurrentLevel
 *
 * Note: going forward, we are moving all user-specific data about a level into
 * `studentLevelProgressType`, so our `levelType` only includes data that is
 * not user-specific. However, for now we still need to support this legacy
 * type which does include user-specific data, and builds on `levelType`.
 */
export const levelWithProgressType = PropTypes.shape({
  ...levelShape,
  status: PropTypes.string.isRequired,
  isLocked: PropTypes.bool,
  isCurrentLevel: PropTypes.bool
});

/**
 * @typedef {Object} StudentLevelProgress
 *
 * @property {string} status
 * A string enum representing student progress status on a level.
 * See src/util/sharedConstants.LevelStatus.
 * @property {number} result
 * A numerical enum of the TestResult a student received for a level.
 * See src/constants.TestResult.
 * See src/code-studio/activityUtils.activityCssClass for a mapping to status.
 * @property {bool} locked
 * A boolean indicating if the level is locked for the student.
 * @property {bool} paired
 * A boolean indicating if a student was paired on a level.
 * @property {number} timeSpent
 * The number of seconds a student spent on a level.
 * @property {number} lastTimestamp
 * A timestamp of the last time a student made progress on a level.
 * @property {array} pages
 * An optional array of recursive progress objects representing progress on
 * individual pages of a multi-page assessment
 */
const studentLevelProgressShape = {
  status: PropTypes.string.isRequired,
  result: PropTypes.number.isRequired,
  locked: PropTypes.bool.isRequired,
  paired: PropTypes.bool.isRequired,
  timeSpent: PropTypes.number,
  lastTimestamp: PropTypes.number
  /** pages: PropTypes.array */ // See below
};
// Avoid recursive definition
studentLevelProgressShape.pages = PropTypes.arrayOf(
  PropTypes.shape(studentLevelProgressShape)
);
export const studentLevelProgressType = PropTypes.shape(
  studentLevelProgressShape
);

/*
 * @typedef {Object} unitProgressType
 *
 * unitProgressType represents a user's progress in a script.  It is a map of
 * levelId -> studentLevelProgressType objects.
 */
export const unitProgressType = PropTypes.objectOf(studentLevelProgressType);

/**
 * @typedef {Object} Lesson
 *
 * @property {string} name
 * @property {number} id
 * @property {bool} lockable
 * @property {number} lessonNumber
 */
export const lessonType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  lockable: PropTypes.bool.isRequired,
  lessonNumber: PropTypes.number,
  lesson_plan_html_url: PropTypes.string,
  isFocusArea: PropTypes.bool.isRequired,
  description_student: PropTypes.string,
  description_teacher: PropTypes.string
});

/**
 * @typedef {Object} StudentLessonProgress
 *
 * @property {number} incompletePercent
 * @property {number} imperfectPercent
 * @property {number} completedPercent
 * @property {number} timeSpent
 * @property {number} lastTimestamp
 */
export const studentLessonProgressType = PropTypes.shape({
  incompletePercent: PropTypes.number.isRequired,
  imperfectPercent: PropTypes.number.isRequired,
  completedPercent: PropTypes.number.isRequired,
  timeSpent: PropTypes.number.isRequired,
  lastTimestamp: PropTypes.number.isRequired
});

/**
 * @typedef {Object} LessonGroup
 * Summary of a LessonGroup ruby model.
 *
 * @property {string} displayName
 * @property {number} id
 * @property {string} bigQuestion
 * @property {string} description
 */
const lessonGroupShape = {
  id: PropTypes.number,
  displayName: PropTypes.string,
  bigQuestions: PropTypes.string,
  description: PropTypes.string
};

/**
 * @typedef {Object} GroupedLessons
 * Type of object returned by `progressRedux.groupedLessons()`.
 *
 * @property {lessonGroupShape} lessonGroup
 * Summary of the LessonGroup ruby model describing this group of lessons.
 * @property {[lessonType]} lessons
 * Ordered list of lessons in this group.
 * @property {[[levelWithProgressType]]} levelsByLesson
 * Ordered list of levels for each of the lessons in this group.
 */
export const groupedLessonsType = PropTypes.shape({
  lessonGroup: PropTypes.shape(lessonGroupShape),
  lessons: PropTypes.arrayOf(lessonType).isRequired,
  levelsByLesson: PropTypes.arrayOf(PropTypes.arrayOf(levelWithProgressType))
    .isRequired
});
