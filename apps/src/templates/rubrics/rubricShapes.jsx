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
  lesson: PropTypes.shape({
    position: PropTypes.number,
    name: PropTypes.string,
  }),
});

// Used for any data that is only for reporting purposes. Other data may be used for event reporting
export const reportingDataShape = PropTypes.shape({
  courseName: PropTypes.string,
  unitName: PropTypes.string,
  levelName: PropTypes.string,
});

export const studentLevelInfoShape = PropTypes.shape({
  name: PropTypes.string,
  timeSpent: PropTypes.string,
  attempts: PropTypes.number,
  lastAttempt: PropTypes.string,
});
