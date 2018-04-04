import React, {Component, PropTypes} from 'react';
import {ages} from '../AgeDropdown';
import {connect} from 'react-redux';
import {editStudent, setSharingDefault} from './manageStudentsRedux';

class ManageStudentAgeCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    age: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    isEditing: PropTypes.bool,
    editedValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    // Provided by redux
    editStudent: PropTypes.func.isRequired,
    setSharingDefault: PropTypes.func.isRequired,
    // TODO (ErinB) Remove when we remove the experiment flag.
    shareColumnExperimentEnabled: PropTypes.bool
  };

  // For privacy reasons, we disable sharing by default if the student is
  // under the age of 13 if the age was previously not set.
  onChangeAge = (e) => {
    this.props.editStudent(this.props.id, {age: e.target.value});
    if (this.props.age === '' && this.props.shareColumnExperimentEnabled) {
      this.props.setSharingDefault(this.props.id);
    }
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

export const UnconnectedManageStudentAgeCell = ManageStudentAgeCell;

export default connect(state => ({}), dispatch => ({
  editStudent(id, studentInfo) {
    dispatch(editStudent(id, studentInfo));
  },
  setSharingDefault(id) {
    dispatch(setSharingDefault(id));
  }
}))(ManageStudentAgeCell);
