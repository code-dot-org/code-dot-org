import PropTypes from 'prop-types';

export const commitShape = PropTypes.shape({
  createdAt: PropTypes.string.isRequired,
  comment: PropTypes.string.isRequired,
  projectVersion: PropTypes.string.isRequired,
  timelineElementType: PropTypes.string.isRequired,
});

export const reviewCommentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  comment: PropTypes.string,
  commenterName: PropTypes.string.isRequired,
  commenterId: PropTypes.number.isRequired,
  createdAt: PropTypes.string,
  isResolved: PropTypes.bool,
  isFromTeacher: PropTypes.bool,
});

export const reviewShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  createdAt: PropTypes.string,
  isOpen: PropTypes.bool,
  version: PropTypes.string,
  timelineElementType: PropTypes.string.isRequired,
  ownerName: PropTypes.string,
  comments: PropTypes.arrayOf(reviewCommentShape),
});
