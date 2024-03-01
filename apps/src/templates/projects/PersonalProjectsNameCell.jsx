import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {tableLayoutStyles} from '../tables/tableConstants';
import {updateProjectName} from './projectsRedux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {showProjectInfoDialog} from '@cdo/apps/templates/projects/infoDialog/projectInfoDialogRedux';

class PersonalProjectsNameCell extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    projectType: PropTypes.string.isRequired,
    projectName: PropTypes.string.isRequired,
    isEditing: PropTypes.bool,
    updatedName: PropTypes.string,
    updateProjectName: PropTypes.func.isRequired,
    isFrozen: PropTypes.bool,
    showProjectInfoDialog: PropTypes.func,
  };

  onChangeName = e => {
    this.props.updateProjectName(this.props.projectId, e.target.value);
  };

  showProjectInfo = () => {
    this.props.showProjectInfoDialog();
  };

  render() {
    const {
      projectId,
      projectType,
      projectName,
      updatedName,
      isEditing,
      isFrozen,
    } = this.props;
    const url = `/projects/${projectType}/${projectId}/edit`;

    return (
      <div>
        {!isEditing && (
          <div>
            <a
              style={tableLayoutStyles.link}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-projects-table-project-name"
            >
              {projectName + ' '}
            </a>
            {isFrozen && (
              <FontAwesome
                icon="circle-exclamation"
                className={styles.cautionIcon}
              />
            )}
          </div>
        )}
        {isEditing && (
          <div>
            <input
              required
              style={styles.inputBox}
              value={updatedName}
              onChange={this.onChangeName}
              className="ui-project-rename-input"
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
};

export default connect(
  state => ({}),
  dispatch => ({
    updateProjectName(projectId, updatedName) {
      dispatch(updateProjectName(projectId, updatedName));
    },
    showProjectInfoDialog() {
      dispatch(showProjectInfoDialog());
    },
  })
)(PersonalProjectsNameCell);
