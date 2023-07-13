import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {editStudent} from './manageStudentsRedux';

class ManageStudentFamilyNameCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    familyName: PropTypes.string,
    isEditing: PropTypes.bool,
    editedValue: PropTypes.string,

    //Provided by redux
    editStudent: PropTypes.func.isRequired,
  };

  onChangeName = e => {
    // Convert the empty string back to null before saving, so it doesn't
    // add empty family names to students.
    const newValue = e.target.value || null;
    this.props.editStudent(this.props.id, {familyName: newValue});
  };

  render() {
    const {familyName, editedValue} = this.props;

    return (
      <div>
        {!this.props.isEditing && <div>{familyName}</div>}
        {this.props.isEditing && (
          <div>
            <input
              style={styles.inputBox}
              // Since familyName is optional, explicitly prevent value from
              // being set to undefined.
              value={editedValue || ''}
              onChange={this.onChangeName}
              placeholder={i18n.familyNameForSorting()}
              aria-label={i18n.familyNameForSorting()}
            />
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  inputBox: {
    width: 225,
  },
  details: {
    fontSize: 12,
  },
};

export const UnconnectedManageStudentFamilyNameCell =
  ManageStudentFamilyNameCell;

export default connect(
  state => ({}),
  dispatch => ({
    editStudent(id, studentInfo) {
      dispatch(editStudent(id, studentInfo));
    },
  })
)(ManageStudentFamilyNameCell);
