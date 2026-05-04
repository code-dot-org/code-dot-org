import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {ages} from '../AgeDropdown';

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
  };

  // For privacy reasons, we disable sharing by default if the student is
  // under the age of 13 if the age was previously not set.
  onChangeAge = e => {
    this.props.editStudent(this.props.id, {age: e.target.value});
    if (this.props.age === '') {
      this.props.setSharingDefault(this.props.id);
    }
  };

  render() {
    const {age, editedValue} = this.props;
    return (
      <div>
        {!this.props.isEditing && <div>{age}</div>}
        {this.props.isEditing && (
          <SimpleDropdown
            name="age"
            labelText={i18n.age()}
            isLabelVisible={false}
            size="s"
            items={ages.map(a => ({value: String(a), text: String(a)}))}
            selectedValue={editedValue !== undefined ? String(editedValue) : ''}
            onChange={this.onChangeAge}
          />
        )}
      </div>
    );
  }
}

export const UnconnectedManageStudentAgeCell = ManageStudentAgeCell;

export default connect(
  state => ({}),
  dispatch => ({
    editStudent(id, studentInfo) {
      dispatch(editStudent(id, studentInfo));
    },
    setSharingDefault(id) {
      dispatch(setSharingDefault(id));
    },
  })
)(ManageStudentAgeCell);
