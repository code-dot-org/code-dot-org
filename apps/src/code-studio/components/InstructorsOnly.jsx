import {connect} from 'react-redux';

const InstructorsOnly = ({isTeacher, children}) => {
  return isTeacher ? children : null;
};

export default connect(state => ({
  isTeacher: state.currentUser.userType === 'teacher'
}))(InstructorsOnly);
