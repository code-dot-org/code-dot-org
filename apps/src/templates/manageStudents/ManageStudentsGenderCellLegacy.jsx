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

class ManageStudentGenderCellLegacy extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    gender: PropTypes.string,
    isEditing: PropTypes.bool,
    editedValue: PropTypes.string,
    // Provided by redux
    editStudent: PropTypes.func.isRequired,
  };

  state = {
    genderValue: this.props.gender,
  };

  onChangeGender = e => {
    this.props.editStudent(this.props.id, {gender: e.target.value});
  };

  render() {
    return (
      <div>
        {!this.props.isEditing && <div>{GENDERS[this.props.gender]}</div>}
        {this.props.isEditing && (
          <select
            style={{width: 120, marginBottom: 0}}
            ref={element => (this.root = element)}
            name="gender"
            value={this.props.editedValue}
            onChange={this.onChangeGender}
          >
            {Object.keys(GENDERS).map(gender => (
              <option key={gender} value={gender}>
                {GENDERS[gender]}
              </option>
            ))}
          </select>
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
)(ManageStudentGenderCellLegacy);
