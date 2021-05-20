import PropTypes from 'prop-types';

export const videoDataShape = PropTypes.shape({
  src: PropTypes.string.isRequired,
  name: PropTypes.string,
  key: PropTypes.string,
  download: PropTypes.string,
  thumbnail: PropTypes.string,
  enable_fallback: PropTypes.bool,
  autoplay: PropTypes.bool
});

export const teacherFeedbackShape = PropTypes.shape({
  comment: PropTypes.string,
  performance: PropTypes.string,
  student_seen_feedback: PropTypes.string,
  created_at: PropTypes.string
});

export const rubricShape = PropTypes.shape({
  keyConcept: PropTypes.string,
  performanceLevel1: PropTypes.string,
  performanceLevel2: PropTypes.string,
  performanceLevel3: PropTypes.string,
  performanceLevel4: PropTypes.string
});
