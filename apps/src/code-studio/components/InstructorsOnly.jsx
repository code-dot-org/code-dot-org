import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {CourseRoles} from '@cdo/apps/templates/currentUserRedux';

const InstructorsOnly = ({isInstructor, children}) => {
  return isInstructor ? children : null;
};

InstructorsOnly.propTypes = {
  isInstructor: PropTypes.bool,
  children: PropTypes.object,
};

export default connect(state => ({
  isInstructor: state.currentUser.userRoleInCourse === CourseRoles.Instructor,
}))(InstructorsOnly);
