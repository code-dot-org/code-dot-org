import PropTypes from 'prop-types';

/**
 * See ApplicationHelper::PUZZLE_PAGE_NONE.
 */
export const PUZZLE_PAGE_NONE = -1;

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
 * @property {bool} isCurrentLevel
 * @property {bool} isConceptLevel
 * @property {string} kind
 * @property {number} pageNumber The page number of the level if
 *   this is a multi-page level, or PUZZLE_PAGE_NONE
 */
const levelWithoutStatusShape = {
  id: PropTypes.string.isRequired,
  url: PropTypes.string,
  name: PropTypes.string,
  bubbleText: PropTypes.string,
  icon: PropTypes.string,
  isUnplugged: PropTypes.bool,
  levelNumber: PropTypes.number,
  isCurrentLevel: PropTypes.bool,
  isConceptLevel: PropTypes.bool,
  kind: PropTypes.string,
  pageNumber: PropTypes.number
};

// Avoid recursive definition
levelWithoutStatusShape.sublevels = PropTypes.arrayOf(
  PropTypes.shape(levelWithoutStatusShape)
);

// In the future when the level object does not contain the status object,
// we can export just levelType without needing levelTypeWithoutStatus.
export const levelTypeWithoutStatus = PropTypes.shape(levelWithoutStatusShape);

/**
 * @typedef {Object} Level
 *
 * @property {string} status
 */
export const levelType = PropTypes.shape({
  ...levelWithoutStatusShape,
  status: PropTypes.string.isRequired
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
 * @property {bool} paired
 * A boolean indicating if a student was paired on a level.
 * @property {number} timeSpent
 * An optional value indicating the time a student spent on a level.
 * @property {array} pages
 * Array of StudentLevelProgress objects representing progress on individual
 * pages of a multi-page assessment
 */
const studentLevelProgressShape = {
  status: PropTypes.string.isRequired,
  result: PropTypes.number.isRequired,
  paired: PropTypes.bool.isRequired,
  timeSpent: PropTypes.number
};
// Avoid recursive definition
studentLevelProgressShape.pages = PropTypes.arrayOf(
  PropTypes.shape(studentLevelProgressShape)
);
export const studentLevelProgressType = PropTypes.shape(
  studentLevelProgressShape
);

/**
 * @typedef {Object} Lesson
 *
 * @property {string} name
 * @property {number} id
 * @property {bool} lockable
 * @property {number} stageNumber
 */
export const lessonType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  id: PropTypes.number.isRequired,
  lockable: PropTypes.bool.isRequired,
  stageNumber: PropTypes.number,
  lesson_plan_html_url: PropTypes.string,
  isFocusArea: PropTypes.bool.isRequired,
  description_student: PropTypes.string,
  description_teacher: PropTypes.string
});

/**
 * @typedef {Object} LessonGroup
 *
 * @property {string} displayName
 * @property {number} id
 * @property {array} bigQuestion
 * @property {string} description
 */
export const lessonGroupType = PropTypes.shape({
  id: PropTypes.number,
  displayName: PropTypes.string,
  bigQuestions: PropTypes.string,
  description: PropTypes.string
});
