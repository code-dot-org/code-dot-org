import {connect} from 'react-redux';

const TeachersOnly = ({isTeacher, children}) => {
  return isTeacher ? children : null;
};

export default connect(state => ({
  isTeacher: state.currentUser.userType === 'teacher'
}))(TeachersOnly);
