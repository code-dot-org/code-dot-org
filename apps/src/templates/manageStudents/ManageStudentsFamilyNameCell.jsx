import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import _ from 'lodash';
import i18n from '@cdo/locale';
import {editStudent} from './manageStudentsRedux';

class ManageStudentFamilyNameCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    familyName: PropTypes.string,
    isEditing: PropTypes.bool,
    editedValue: PropTypes.string,
    sectionId: PropTypes.number,
    inputDisabled: PropTypes.bool,

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
    const {familyName, editedValue, inputDisabled} = this.props;
    const tooltipId = inputDisabled ? _.uniqueId() : '';

    return (
      <div>
        {!this.props.isEditing && <div>{familyName}</div>}
        {this.props.isEditing && (
          <div>
            <span data-for={tooltipId} data-tip>
              <input
                style={styles.inputBox}
                // Since familyName is optional, explicitly prevent value from
                // being set to undefined.
                value={editedValue || ''}
                onChange={this.onChangeName}
                placeholder={i18n.familyName()}
                aria-label={i18n.familyName()}
                disabled={inputDisabled}
              />
              <ReactTooltip id={tooltipId} role="tooltip" effect="solid">
                <div>{i18n.disabledForTeacherAccountsTooltip()}</div>
              </ReactTooltip>
            </span>
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
