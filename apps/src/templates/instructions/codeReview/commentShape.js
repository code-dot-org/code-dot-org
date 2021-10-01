import PropTypes from 'prop-types';

// Shape for data used to display code review comments
// in Javalab.
export const commentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  commentText: PropTypes.string.isRequired,
  timestampString: PropTypes.string.isRequired,
  isResolved: PropTypes.bool,
  isFromTeacher: PropTypes.bool,
  isFromCurrentUser: PropTypes.bool,
  isFromProjectOwner: PropTypes.bool,
  isFromOlderVersionOfProject: PropTypes.bool,
  hasError: PropTypes.bool
});
