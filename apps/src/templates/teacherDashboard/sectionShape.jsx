import { PropTypes } from 'react';

const sectionShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  loginType: PropTypes.oneOf(['word', 'email', 'picture']).isRequired,
  stageExtras: PropTypes.bool.isRequired,
  pairingAllowed: PropTypes.bool.isRequired,
  numStudents: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  assignmentName: PropTypes.string,
  assignmentPath: PropTypes.string
});
export default sectionShape;
