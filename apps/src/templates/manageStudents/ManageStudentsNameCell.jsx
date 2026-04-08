import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {
  getSelectedCourseName,
  getSelectedUnitPosition,
} from '@cdo/apps/redux/unitSelectionRedux';
import DemoStudentChip from '@cdo/apps/templates/DemoStudentChip';
import {nestedUnitUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';
import i18n from '@cdo/locale';

import {
  tableLayoutStyles,
  NAME_CELL_INPUT_WIDTH,
} from '../tables/tableConstants';

import {editStudent} from './manageStudentsRedux';

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
              <span style={styles.nameWithChip}>
                <a
                  style={tableLayoutStyles.link}
                  href={studentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {name}
                </a>
                {this.props.isDemoStudent && <DemoStudentChip />}
              </span>
            )}
            {!studentUrl && (
              <span style={styles.nameWithChip}>
                {name}
                {this.props.isDemoStudent && <DemoStudentChip />}
              </span>
            )}
            {username && (
              <div style={styles.details}>
                {i18n.usernameLabel() + username}
              </div>
            )}
            {email && (
              <div style={styles.details}>{i18n.emailLabel() + email}</div>
            )}
          </div>
        )}
        {this.props.isEditing && (
          <div>
            <input
              id="uitest-display-name"
              required
              style={styles.inputBox}
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

const styles = {
  nameWithChip: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  inputBox: {
    width: NAME_CELL_INPUT_WIDTH,
  },
  details: {
    fontSize: 12,
  },
};

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
