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
  bubbleTitle: PropTypes.string,
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
