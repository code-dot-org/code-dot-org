import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {showDeleteDialog} from './deleteDialog/deleteProjectDialogRedux';
import ProjectNameFailureDialog from './ProjectNameFailureDialog';
import {
  startRenamingProject,
  cancelRenamingProject,
  saveProjectName,
  unsetNameFailure,
} from './projectsRedux';

import moduleStyles from './personal-projects-table-actions-cell.module.scss';

export class PersonalProjectsTableActionsCell extends Component {
  static propTypes = {
    projectId: PropTypes.string.isRequired,
    projectType: PropTypes.string.isRequired,
    showDeleteDialog: PropTypes.func.isRequired,
    isEditing: PropTypes.bool,
    isSaving: PropTypes.bool,
    startRenamingProject: PropTypes.func.isRequired,
    updatedName: PropTypes.string,
    cancelRenamingProject: PropTypes.func.isRequired,
    saveProjectName: PropTypes.func.isRequired,
    projectNameFailure: PropTypes.string,
    unsetNameFailure: PropTypes.func.isRequired,
    isFrozen: PropTypes.bool,
  };

  onDelete = () => {
    this.props.showDeleteDialog(this.props.projectId);
  };

  onRename = () => {
    this.props.startRenamingProject(this.props.projectId);
  };

  onCancel = () => {
    this.props.cancelRenamingProject(this.props.projectId);
  };

  onSave = () => {
    this.props.saveProjectName(this.props.projectId, this.props.updatedName);
  };

  onRemix = () => {
    window.location = `/projects/${this.props.projectType}/${this.props.projectId}/remix`;
  };

  handleNameFailureDialogClose = () => {
    this.props.unsetNameFailure(this.props.projectId);
  };

  buildActionOptions = () => {
    const {projectId, isFrozen} = this.props;
    const options = [];
    if (!isFrozen) {
      options.push({
        value: `rename-${projectId}`,
        label: i18n.rename(),
        icon: {iconName: 'pencil', iconStyle: 'solid'},
        onClick: this.onRename,
      });
    }
    options.push({
      value: `remix-${projectId}`,
      label: i18n.remix(),
      icon: {iconName: 'clone', iconStyle: 'solid'},
      onClick: this.onRemix,
    });
    if (!isFrozen) {
      options.push({
        value: `delete-${projectId}`,
        label: i18n.delete(),
        icon: {iconName: 'circle-xmark', iconStyle: 'solid'},
        isOptionDestructive: true,
        onClick: this.onDelete,
      });
    }
    return options;
  };

  render() {
    const {isEditing, isSaving, projectId} = this.props;

    return (
      <div>
        {!isEditing && (
          <ActionDropdown
            name={`project-actions-${projectId}`}
            labelText={i18n.quickActions()}
            size="s"
            menuPlacement="right"
            options={this.buildActionOptions()}
            triggerButtonProps={{
              className: 'ui-projects-table-dropdown',
              variant: 'outlined',
              color: 'secondary',
              children: <FontAwesomeV6Icon iconName="ellipsis-vertical" />,
            }}
          />
        )}
        {isEditing && (
          <div className={moduleStyles.editButtons}>
            <MuiButton
              variant="contained"
              color="primary"
              size="small"
              disabled={isSaving}
              id="ui-projects-rename-save"
              onClick={this.onSave}
              type="button"
            >
              {i18n.save()}
            </MuiButton>
            <MuiButton
              variant="outlined"
              color="tertiary"
              size="small"
              onClick={this.onCancel}
              type="button"
            >
              {i18n.cancel()}
            </MuiButton>
          </div>
        )}
        <ProjectNameFailureDialog
          flaggedText={this.props.projectNameFailure}
          isOpen={!!this.props.projectNameFailure}
          handleClose={this.handleNameFailureDialogClose}
        />
      </div>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    showDeleteDialog(projectId) {
      dispatch(showDeleteDialog(projectId));
    },
    startRenamingProject(projectId, updatedName) {
      dispatch(startRenamingProject(projectId, updatedName));
    },
    cancelRenamingProject(projectId) {
      dispatch(cancelRenamingProject(projectId));
    },
    saveProjectName(projectId, updatedName, lastUpdatedAt) {
      dispatch(saveProjectName(projectId, updatedName, lastUpdatedAt));
    },
    unsetNameFailure(projectId) {
      dispatch(unsetNameFailure(projectId));
    },
  })
)(PersonalProjectsTableActionsCell);
