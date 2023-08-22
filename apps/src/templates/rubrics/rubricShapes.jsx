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
});

// Used for any data that is only for reporting purposes. Other data may be used for event reporting
export const reportingDataShape = PropTypes.shape({
  unitName: PropTypes.string,
  levelName: PropTypes.string,
});
