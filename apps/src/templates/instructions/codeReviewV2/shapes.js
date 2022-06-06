import PropTypes from 'prop-types';

export const commitShape = PropTypes.shape({
  createdAt: PropTypes.string.isRequired,
  comment: PropTypes.string.isRequired,
  projectVersion: PropTypes.string.isRequired,
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
  isOpen: PropTypes.bool,
  version: PropTypes.string,
  timelineElementType: PropTypes.string.isRequired,
  ownerName: PropTypes.string,
  comments: PropTypes.arrayOf(reviewCommentShape)
});
