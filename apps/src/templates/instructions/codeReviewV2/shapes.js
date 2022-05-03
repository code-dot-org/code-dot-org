import PropTypes from 'prop-types';

export const commitShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  comment: PropTypes.string.isRequired,
  projectVersion: PropTypes.string.isRequired,
  isVersionExpired: PropTypes.bool
});

const commentShape = PropTypes.shape({
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
  comments: PropTypes.arrayOf(commentShape)
});
