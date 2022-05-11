import {connect} from 'react-redux';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

const TeachersOnly = ({isInstructor, children}) => {
  console.log(isInstructor);
  return isInstructor ? children : null;
};

export default connect(state => ({
  isInstructor: state.viewAs === ViewType.Instructor
}))(TeachersOnly);
