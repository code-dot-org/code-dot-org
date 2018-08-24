import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import QuickActionsCell from "../tables/QuickActionsCell";
import PopUpMenu, {MenuBreak} from "@cdo/apps/lib/ui/PopUpMenu";
import color from "../../util/color";
import FontAwesome from '../FontAwesome';
import Button from '../Button';
import i18n from '@cdo/locale';
import {showPublishDialog} from './publishDialog/publishDialogRedux';
import {
  unpublishProject,
  startRenamingProject,
  cancelRenamingProject,
  saveProjectName,
  remix,
} from './projectsRedux';
import {publishMethods} from './projectConstants';
import {showDeleteDialog} from './deleteDialog/deleteProjectDialogRedux';
import firehoseClient from '@cdo/apps/lib/util/firehose';

export const styles = {
  xIcon: {
    paddingRight: 5,
  },
};

class PersonalProjectsTableActionsCell extends Component {
  static propTypes = {
    isPublishable: PropTypes.bool.isRequired,
    isPublished: PropTypes.bool.isRequired,
    publishMethod: PropTypes.oneOf([publishMethods.CHEVRON, publishMethods.BUTTON]).isRequired,
    projectId: PropTypes.string.isRequired,
    projectType: PropTypes.string.isRequired,
    showPublishDialog: PropTypes.func.isRequired,
    unpublishProject: PropTypes.func.isRequired,
    showDeleteDialog: PropTypes.func.isRequired,
    isEditing: PropTypes.bool,
    isSaving: PropTypes.bool,
    startRenamingProject: PropTypes.func.isRequired,
    updatedName: PropTypes.string,
    cancelRenamingProject: PropTypes.func.isRequired,
    saveProjectName: PropTypes.func.isRequired,
    remix: PropTypes.func.isRequired,
    userId: PropTypes.number,
  };

  onPublish = () => {
    firehoseClient.putRecord(
      {
        study: 'project-publish',
        study_group: 'publish-chevron',
        event: 'publish',
        user_id: this.props.userId,
        data_json: JSON.stringify({ channel_id: this.props.projectId })
      }
    );
    this.props.showPublishDialog(this.props.projectId, this.props.projectType);
  };

  onUnpublish = () => {
    firehoseClient.putRecord(
      {
        study: 'project-publish',
        study_group: 'publish-chevron',
        event: 'unpublish',
        user_id: this.props.userId,
        data_json: JSON.stringify({ channel_id: this.props.projectId })
      }
    );
    this.props.unpublishProject(this.props.projectId);
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

  render() {
    const {isEditing, isSaving, isPublishable, isPublished, publishMethod, userId, projectId} = this.props;
    const experimentGroup = publishMethod ===
      publishMethods.CHEVRON ?
      'publish-chevron' :
      'publish-button';

    return (
      <div>
        {!isEditing  &&
          <QuickActionsCell
            experimentDetails={{
              study: 'project-publish',
              study_group: experimentGroup,
              event: 'chevron',
              user_id: userId,
              data_json: JSON.stringify({ channel_id: projectId }),
            }}
          >
            <PopUpMenu.Item
              onClick={this.onRename}
            >
              {i18n.rename()}
            </PopUpMenu.Item>
            <PopUpMenu.Item
              onClick={this.onRemix}
            >
              {i18n.remix()}
            </PopUpMenu.Item>
            {isPublished && isPublishable && (
              <PopUpMenu.Item
                onClick={this.onUnpublish}
              >
                {i18n.unpublish()}
              </PopUpMenu.Item>
            )}
            {!isPublished && isPublishable && (
              <PopUpMenu.Item
                onClick={this.onPublish}
              >
                {i18n.publish()}
              </PopUpMenu.Item>
            )}
            <MenuBreak/>
            <PopUpMenu.Item
              onClick={this.onDelete}
              color={color.red}
            >
              <FontAwesome icon="times-circle" style={styles.xIcon}/>
              {i18n.delete()}
            </PopUpMenu.Item>
          </QuickActionsCell>
        }
        {isEditing &&
          <div>
            <Button
              onClick={this.onSave}
              color={Button.ButtonColor.orange}
              text={i18n.save()}
              style={styles.saveButton}
              disabled={isSaving}
            />
            <br/>
            <Button
              onClick={this.onCancel}
              color={Button.ButtonColor.gray}
              text={i18n.cancel()}
            />
          </div>
        }
      </div>
    );
  }
}

export default connect(state => ({}), dispatch => ({
  showPublishDialog(projectId, projectType) {
    dispatch(showPublishDialog(projectId, projectType));
  },
  unpublishProject(projectId) {
    dispatch(unpublishProject(projectId));
  },
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
}))(PersonalProjectsTableActionsCell);
