import PropTypes from 'prop-types';

export const evidenceLevelShape = PropTypes.shape({
  understanding: PropTypes.number,
  teacherDescription: PropTypes.string,
});

export const learningGoalShape = PropTypes.shape({
  key: PropTypes.string,
  learningGoal: PropTypes.string,
  aiEnabled: PropTypes.bool,
  tips: PropTypes.string,
  evidenceLevels: PropTypes.arrayOf(evidenceLevelShape),
});

export const rubricShape = PropTypes.shape({
  learningGoals: PropTypes.arrayOf(learningGoalShape),
  lesson: PropTypes.shape({name: PropTypes.string, position: PropTypes.number}),
});
