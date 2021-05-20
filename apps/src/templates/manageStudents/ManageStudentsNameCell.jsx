import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {tableLayoutStyles} from '../tables/tableConstants';
import i18n from '@cdo/locale';
import {editStudent} from './manageStudentsRedux';
import {getSelectedScriptName} from '@cdo/apps/redux/scriptSelectionRedux';
import {scriptUrlForStudent} from '@cdo/apps/templates/teacherDashboard/urlHelpers';

class ManageStudentNameCell extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    sectionId: PropTypes.number,
    name: PropTypes.string.isRequired,
    username: PropTypes.string,
    email: PropTypes.string,
    isEditing: PropTypes.bool,
    editedValue: PropTypes.string,

    //Provided by redux
    editStudent: PropTypes.func.isRequired,
    scriptName: PropTypes.string
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
      scriptName
    } = this.props;
    const studentUrl = scriptUrlForStudent(sectionId, scriptName, id);

    return (
      <div>
        {!this.props.isEditing && (
          <div>
            {studentUrl && (
              <a
                style={tableLayoutStyles.link}
                href={studentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {name}
              </a>
            )}
            {!studentUrl && <span>{name}</span>}
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
  inputBox: {
    width: 225
  },
  details: {
    fontSize: 12
  }
};

export default connect(
  state => ({
    scriptName: getSelectedScriptName(state)
  }),
  dispatch => ({
    editStudent(id, studentInfo) {
      dispatch(editStudent(id, studentInfo));
    }
  })
)(ManageStudentNameCell);
