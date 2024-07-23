import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import PopUpMenu, {MenuBreak} from '@cdo/apps/lib/ui/PopUpMenu';
import i18n from '@cdo/locale';

import color from '../../util/color';
import Button from '../Button';
import FontAwesome from '../FontAwesome';
import QuickActionsCell from '../tables/QuickActionsCell';

import {showDeleteDialog} from './deleteDialog/deleteProjectDialogRedux';
import PersonalProjectsNameFailureDialog from './PersonalProjectsNameFailureDialog';
import {
  startRenamingProject,
  cancelRenamingProject,
  saveProjectName,
  remix,
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
    remix: PropTypes.func.isRequired,
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
    this.props.remix(this.props.projectId, this.props.projectType);
  };

  handleNameFailureDialogClose = () => {
    this.props.unsetNameFailure(this.props.projectId);
  };

  render() {
    const {isEditing, isSaving} = this.props;

    return (
      <div>
        {!isEditing && (
          <QuickActionsCell>
            {!this.props.isFrozen && (
              <PopUpMenu.Item onClick={this.onRename}>
                {i18n.rename()}
              </PopUpMenu.Item>
            )}
            <PopUpMenu.Item onClick={this.onRemix}>
              {i18n.remix()}
            </PopUpMenu.Item>
            {!this.props.isFrozen && <MenuBreak />}
            {!this.props.isFrozen && (
              <PopUpMenu.Item onClick={this.onDelete} color={color.red}>
                <FontAwesome
                  icon="times-circle"
                  className={moduleStyles.xIcon}
                />
                {i18n.delete()}
              </PopUpMenu.Item>
            )}
          </QuickActionsCell>
        )}
        {isEditing && (
          <div>
            <Button
              __useDeprecatedTag
              onClick={this.onSave}
              color={Button.ButtonColor.brandSecondaryDefault}
              text={i18n.save()}
              disabled={isSaving}
              className="ui-projects-rename-save"
            />
            <br />
            <Button
              __useDeprecatedTag
              onClick={this.onCancel}
              color={Button.ButtonColor.gray}
              text={i18n.cancel()}
            />
          </div>
        )}
        <PersonalProjectsNameFailureDialog
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
    remix(projectId, projectType) {
      dispatch(remix(projectId, projectType));
    },
    unsetNameFailure(projectId) {
      dispatch(unsetNameFailure(projectId));
    },
  })
)(PersonalProjectsTableActionsCell);
