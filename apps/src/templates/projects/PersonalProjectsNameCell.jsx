import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {tableLayoutStyles} from '../tables/tableConstants';
import {updateProjectName} from './projectsRedux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {showProjectInfoDialog} from '@cdo/apps/templates/projects/projectInfoDialog/projectInfoDialogRedux';
import moduleStyles from './personal-projects-name-cell.module.scss';

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
    console.log('showProjectInfo');
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
              {projectName}
            </a>
            {isFrozen && (
              <button
                type="button"
                className={moduleStyles.infoButton}
                onClick={this.showProjectInfo}
              >
                <FontAwesome icon="circle-exclamation" className="infoIcon" />
              </button>
            )}
          </div>
        )}
        {isEditing && (
          <div>
            <input
              required
              style={{width: 200}}
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
