import PropTypes from 'prop-types';

export const lessonShapeForUnitEdit = PropTypes.shape({
  id: PropTypes.number,
  key: PropTypes.string.isRequired,
  name: PropTypes.string,
  position: PropTypes.number.isRequired,
  lockable: PropTypes.bool,
  unplugged: PropTypes.bool,
  assessment: PropTypes.bool,
  relativePosition: PropTypes.number,
});

export const lessonGroupShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  displayName: PropTypes.string,
  position: PropTypes.number.isRequired,
  userFacing: PropTypes.bool.isRequired,
  bigQuestions: PropTypes.string,
  description: PropTypes.string,
  lessons: PropTypes.arrayOf(lessonShapeForUnitEdit).isRequired,
});
