import PropTypes from 'prop-types';

/**
 * @typedef {Object} Level
 *
 * @property {number} id
 * @property {string} url
 * @property {string} name
 * @property {string} icon
 * @property {bool} isUnplugged
 * @property {number} levelNumber
 * @property {bool} isCurrentLevel
 * @property {bool} isConceptLevel
 * @property {string} kind
 */
const levelWithoutStatusShape = {
  id: PropTypes.number.isRequired,
  url: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.string,
  isUnplugged: PropTypes.bool,
  levelNumber: PropTypes.number,
  isCurrentLevel: PropTypes.bool,
  isConceptLevel: PropTypes.bool,
  kind: PropTypes.string
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
