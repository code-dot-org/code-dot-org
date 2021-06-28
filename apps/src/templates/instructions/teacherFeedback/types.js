import PropTypes from 'prop-types';

export const teacherFeedbackShape = PropTypes.shape({
  comment: PropTypes.string,
  performance: PropTypes.string,
  student_seen_feedback: PropTypes.date,
  created_at: PropTypes.date,
  feedback_provider_id: PropTypes.number
});

export const rubricShape = PropTypes.shape({
  keyConcept: PropTypes.string,
  performanceLevel1: PropTypes.string,
  performanceLevel2: PropTypes.string,
  performanceLevel3: PropTypes.string,
  performanceLevel4: PropTypes.string
});
