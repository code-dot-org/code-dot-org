import React, {Component, PropTypes} from 'react';
import AddMultipleStudents from './AddMultipleStudents';
import MoveStudents from './MoveStudents';

const style = {
  container: {
    display: 'flex'
  }
};

class ManageStudentsHeader extends Component {
  static propTypes = {
    studentData: PropTypes.array.isRequired
  };

  render() {
    return (
      <div style={style.container}>
        <AddMultipleStudents/>
        <MoveStudents studentData={this.props.studentData}/>
      </div>
    );
  }
}

export default ManageStudentsHeader;
