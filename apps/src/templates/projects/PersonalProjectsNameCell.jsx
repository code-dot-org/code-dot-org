import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Link from '@code-dot-org/component-library/link';
import TextField from '@code-dot-org/component-library/textField';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {showFrozenProjectInfoDialog} from '@cdo/apps/templates/projects/frozenProjectInfoDialog/frozenProjectInfoDialogRedux';
import i18n from '@cdo/locale';

import {updateProjectName} from './projectsRedux';

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
    showFrozenProjectInfoDialog: PropTypes.func,
  };

  onChangeName = e => {
    this.props.updateProjectName(this.props.projectId, e.target.value);
  };

  showFrozenProjectInfo = () => {
    this.props.showFrozenProjectInfoDialog();
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
            <Link
              href={url}
              openInNewTab
              size="s"
              className="ui-projects-table-project-name"
            >
              {projectName}
            </Link>
            {isFrozen && (
              <button
                type="button"
                className={moduleStyles.infoButton}
                onClick={this.showFrozenProjectInfo}
              >
                <FontAwesomeV6Icon
                  iconName="circle-exclamation"
                  iconStyle="solid"
                  title="project-info-icon"
                  className={moduleStyles.infoIcon}
                />
              </button>
            )}
          </div>
        )}
        {isEditing && (
          <div>
            <TextField
              required
              size="s"
              aria-label={i18n.projectName()}
              className={moduleStyles.inputBox}
              value={updatedName}
              onChange={this.onChangeName}
              name="ui-project-rename-input"
              id="ui-project-rename-input"
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
    showFrozenProjectInfoDialog() {
      dispatch(showFrozenProjectInfoDialog());
    },
  })
)(PersonalProjectsNameCell);
