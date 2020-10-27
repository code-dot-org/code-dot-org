import PropTypes from 'prop-types';

export const studentType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired
});

export const levelType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  url: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.string,
  isUnplugged: PropTypes.bool,
  levelNumber: PropTypes.number,
  isConceptLevel: PropTypes.bool,
  kind: PropTypes.string,
  sublevels: PropTypes.arrayOf(PropTypes.object)
});

export const studentLevelProgressType = PropTypes.shape({
  status: PropTypes.string.isRequired,
  result: PropTypes.number.isRequired,
  paired: PropTypes.bool.isRequired,
  timeSpent: PropTypes.number
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
  description_student: PropTypes.string,
  description_teacher: PropTypes.string,
  levels: PropTypes.arrayOf(levelType)
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
  displayName: PropTypes.string.isRequired,
  bigQuestions: PropTypes.string,
  description: PropTypes.string,
  lessons: PropTypes.arrayOf(lessonType)
});
