import { PropTypes } from 'react';

const sectionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  // Though we validate valid login types here, the server actually owns the
  // canonical list, and passes us the list of valid login types.
  loginType: PropTypes.oneOf(['word', 'email', 'picture']).isRequired,
  stageExtras: PropTypes.bool.isRequired,
  pairingAllowed: PropTypes.bool.isRequired,
  numStudents: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  assignmentName: PropTypes.string,
  assignmentPath: PropTypes.string
});
export default sectionShape;
