import { PropTypes } from 'react';

export const sectionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  // Though we validate valid login types here, the server actually owns the
  // canonical list, and passes us the list of valid login types.
  loginType: PropTypes.oneOf(['word', 'email', 'picture']).isRequired,
  stageExtras: PropTypes.bool.isRequired,
  pairingAllowed: PropTypes.bool.isRequired,
  studentNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  code: PropTypes.string.isRequired,
  courseId: PropTypes.number,
  scriptId: PropTypes.number,
});

export const assignmentShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  courseId: PropTypes.number,
  scriptId: PropTypes.number,
  assignId: PropTypes.string.isRequried,
  category_priority: PropTypes.number.isRequired,
  category: PropTypes.string.isRequired,
  position: PropTypes.number,
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
});

export const classroomShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  section: PropTypes.string,
  enrollmentCode: PropTypes.string.isRequired,
});
