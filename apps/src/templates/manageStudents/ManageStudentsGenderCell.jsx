import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {editStudent} from './manageStudentsRedux';

const GENDERS = {
  '': '',
  m: i18n.genderMale(),
  f: i18n.genderFemale(),
  n: i18n.genderNonBinary(),
  o: i18n.genderNotListed(),
};

class ManageStudentGenderCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    genderTeacherInput: PropTypes.string,
    isEditing: PropTypes.bool,
    editedValue: PropTypes.string,
    // Provided by redux
    editStudent: PropTypes.func.isRequired,
  };

  state = {
    genderValue: this.props.genderTeacherInput,
  };

  onChangeGender = e => {
    this.props.editStudent(this.props.id, {
      genderTeacherInput: e.target.value,
    });
  };

  render() {
    return (
      <div>
        {!this.props.isEditing && (
          <div>{GENDERS[this.props.genderTeacherInput]}</div>
        )}
        {this.props.isEditing && (
          <SimpleDropdown
            name="gender"
            labelText={i18n.gender()}
            isLabelVisible={false}
            size="s"
            items={Object.keys(GENDERS).map(key => ({
              value: key,
              text: GENDERS[key],
            }))}
            selectedValue={this.props.editedValue || ''}
            onChange={this.onChangeGender}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    editStudent(id, studentInfo) {
      dispatch(editStudent(id, studentInfo));
    },
  })
)(ManageStudentGenderCell);
