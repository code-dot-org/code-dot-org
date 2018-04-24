import React, {Component} from 'react';
import AddMultipleStudents from './AddMultipleStudents';
import MoveStudents from './MoveStudents';

const style = {
  container: {
    display: 'flex'
  }
};

class ManageStudentsHeader extends Component {
  render() {
    return (
      <div style={style.container}>
        <AddMultipleStudents/>
        <MoveStudents/>
      </div>
    );
  }
}

export default ManageStudentsHeader;
