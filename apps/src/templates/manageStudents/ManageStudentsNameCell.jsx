import TextField from '@code-dot-org/component-library/textField';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {
  getSelectedCourseName,
  getSelectedUnitPosition,
} from '@cdo/apps/redux/unitSelectionRedux';
import DemoChip from '@cdo/apps/templates/DemoChip';
import {nestedUnitUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

import {tableLayoutStyles} from '../tables/tableConstants';

import {editStudent} from './manageStudentsRedux';

import moduleStyles from './manageStudentsNameCell.module.scss';

class ManageStudentNameCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    sectionId: PropTypes.number,
    name: PropTypes.string.isRequired,
    username: PropTypes.string,
    email: PropTypes.string,
    isDemoStudent: PropTypes.bool,
    isEditing: PropTypes.bool,
    editedValue: PropTypes.string,

    //Provided by redux
    editStudent: PropTypes.func.isRequired,
    courseVersionName: PropTypes.string,
    unitPosition: PropTypes.number,
  };

  onChangeName = e => {
    this.props.editStudent(this.props.id, {name: e.target.value});
  };

  render() {
    const {
      id,
      sectionId,
      name,
      username,
      email,
      editedValue,
      courseVersionName,
      unitPosition,
    } = this.props;
    const studentUrl = nestedUnitUrlForStudent(
      sectionId,
      courseVersionName,
      unitPosition,
      id
    );

    return (
      <div style={tableLayoutStyles.tableNameText}>
        {!this.props.isEditing && (
          <div>
            {studentUrl && (
              <span className={moduleStyles.nameWithChip}>
                <a
                  style={tableLayoutStyles.link}
                  href={studentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {name}
                </a>
                {this.props.isDemoStudent && (
                  <span className={moduleStyles.demoChipWrapper}>
                    <DemoChip />
                  </span>
                )}
              </span>
            )}
            {!studentUrl && (
              <span className={moduleStyles.nameWithChip}>
                {name}
                {this.props.isDemoStudent && (
                  <span className={moduleStyles.demoChipWrapper}>
                    <DemoChip />
                  </span>
                )}
              </span>
            )}
            {username && (
              <div className={moduleStyles.details}>
                {i18n.usernameLabel() + username}
              </div>
            )}
            {email && (
              <div className={moduleStyles.details}>
                {i18n.emailLabel() + email}
              </div>
            )}
          </div>
        )}
        {this.props.isEditing && (
          <div className={moduleStyles.inputWrapper}>
            <TextField
              id="uitest-display-name"
              name="displayName"
              aria-label={i18n.displayName()}
              required
              size="s"
              value={editedValue}
              onChange={this.onChangeName}
              placeholder={i18n.nameRequired()}
            />
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    courseVersionName: getSelectedCourseName(state),
    unitPosition: getSelectedUnitPosition(state),
  }),
  dispatch => ({
    editStudent(id, studentInfo) {
      dispatch(editStudent(id, studentInfo));
    },
  })
)(ManageStudentNameCell);
