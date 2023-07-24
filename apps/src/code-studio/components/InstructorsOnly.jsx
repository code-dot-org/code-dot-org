import {connect} from 'react-redux';
import {CourseRoles} from '@cdo/apps/templates/currentUserRedux';

// TODO: Add prop types for this component
// eslint-disable-next-line react/prop-types
const InstructorsOnly = ({isInstructor, children}) => {
  return isInstructor ? children : null;
};

export default connect(state => ({
  isInstructor: state.currentUser.userRoleInCourse === CourseRoles.Instructor,
}))(InstructorsOnly);
