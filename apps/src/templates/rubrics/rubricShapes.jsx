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
  script: PropTypes.shape({
    id: PropTypes.number,
  }),
  level: PropTypes.shape({
    id: PropTypes.number,
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
  timeSpentMinutes: PropTypes.number,
  attempts: PropTypes.number,
  lastAttempt: PropTypes.string,
  user_id: PropTypes.number,
});

export const submittedEvaluationShape = PropTypes.shape({
  id: PropTypes.number,
  feedback: PropTypes.string,
  understanding: PropTypes.number,
});

export const aiEvaluationShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  learning_goal_id: PropTypes.number.isRequired,
  understanding: PropTypes.number.isRequired,
  aiConfidencePassFail: PropTypes.number,
  aiConfidenceExactMatch: PropTypes.number,
  showExactMatch: PropTypes.bool,
  observations: PropTypes.string,
  evidence: PropTypes.string,
});

export const aiEvidenceShape = PropTypes.shape({
  firstLine: PropTypes.number,
  lastLine: PropTypes.number,
  message: PropTypes.string,
});
