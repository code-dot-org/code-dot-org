import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {tableLayoutStyles} from '../tables/tableConstants';
import {updateProjectName} from './projectsRedux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import styles from './personal-projects-name-cell.module.scss';
import {showProjectInfoDialog} from '@cdo/apps/templates/projects/projectInfoDialog/projectInfoDialogRedux';

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
    console.log('show project info');
    this.props.showProjectInfoDialog();
  };

  render() {
    const {projectId, projectType, projectName, updatedName, isEditing} =
      this.props;
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
              {projectName}
            </a>
            {isFrozen && (
              <span>
                <button
                  type="button"
                  onClick={this.showProjectInfo}
                  className={styles.cautionButton}
                >
                  <FontAwesome
                    icon="circle-exclamation"
                    className={styles.cautionIcon}
                  />
                </button>
              </span>
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
