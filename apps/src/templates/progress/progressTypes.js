import PropTypes from 'prop-types';

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
 * @property {number} id
 * @property {number} levelNumber
 * @property {string} kind
 * @property {string} url
 * @property {string} name
 * @property {string} icon
 * @property {bool} isUnplugged
 * @property {bool} isConceptLevel
 * @property {levelType[]} sublevels
 */
const levelShape = {
  id: PropTypes.number.isRequired,
  levelNumber: PropTypes.number,
  bubbleText: PropTypes.string,
  kind: PropTypes.string,
  url: PropTypes.string,
  name: PropTypes.string,
  icon: PropTypes.string,
  isUnplugged: PropTypes.bool,
  isConceptLevel: PropTypes.bool
};
// Avoid recursive definition
levelShape.sublevels = PropTypes.arrayOf(PropTypes.shape(levelShape));
export const levelType = PropTypes.shape(levelShape);

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
 * @property {string} lesson_plan_html_url
 * @property {string} description_student
 * @property {string} description_teacher
 * @property {levelType[]} levels
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
 * @property {string} bigQuestion
 * @property {string} description
 * @property {lessonType[]} lessons
 */
export const lessonGroupType = PropTypes.shape({
  id: PropTypes.number,
  displayName: PropTypes.string.isRequired,
  bigQuestions: PropTypes.string,
  description: PropTypes.string,
  lessons: PropTypes.arrayOf(lessonType)
});
