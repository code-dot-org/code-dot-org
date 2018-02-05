import React, {Component, PropTypes} from 'react';
import {ages} from '../AgeDropdown';
import {connect} from 'react-redux';
import {editStudent} from './manageStudentsRedux';

class ManageStudentAgeCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    age: PropTypes.number,
    isEditing: PropTypes.bool,
    editedValue: PropTypes.number,
    // Provided by redux
    editStudent: PropTypes.func.isRequired,
  };

  onChangeAge = (e) => {
    this.props.editStudent(this.props.id, {age: e.target.value});
  };

  render() {
    const {age, editedValue} = this.props;
    return (
      <div>
        {!this.props.isEditing &&
          <div>
            {age}
          </div>
        }
        {this.props.isEditing &&
          <select
            name="age"
            value={editedValue}
            onChange={this.onChangeAge}
          >
           {ages.map(age => <option key={age} value={age}>{age}</option>)}
          </select>
        }
      </div>
    );
  }
}

export default connect(state => ({}), dispatch => ({
  editStudent(id, studentInfo) {
    dispatch(editStudent(id, studentInfo));
  },
}))(ManageStudentAgeCell);
