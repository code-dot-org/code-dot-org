import PropTypes from 'prop-types';

export const commitShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  comment: PropTypes.string.isRequired,
  projectVersion: PropTypes.string.isRequired,
  isVersionExpired: PropTypes.bool,
  timelineElementType: PropTypes.string.isRequired
});

const reviewCommentShape = PropTypes.shape({
  id: PropTypes.number,
  commentText: PropTypes.string,
  name: PropTypes.string,
  timestampString: PropTypes.string,
  isResolved: PropTypes.bool
});

export const reviewShape = PropTypes.shape({
  id: PropTypes.number,
  createdAt: PropTypes.string,
  isClosed: PropTypes.bool,
  projectVersion: PropTypes.string,
  isVersionExpired: PropTypes.bool,
  timelineElementType: PropTypes.string.isRequired,
  comments: PropTypes.arrayOf(reviewCommentShape)
});
