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
} from './projectsRedux';
import {showDeleteDialog} from './deleteDialog/deleteProjectDialogRedux';

export const styles = {
  xIcon: {
    paddingRight: 5,
  },
};

class PersonalProjectsTableActionsCell extends Component {
  static propTypes = {
    isPublished: PropTypes.bool.isRequired,
    projectId: PropTypes.string.isRequired,
    projectType: PropTypes.string.isRequired,
    showPublishDialog: PropTypes.func.isRequired,
    unpublishProject: PropTypes.func.isRequired,
    showDeleteDialog: PropTypes.func.isRequired,
    isEditing: PropTypes.bool,
    startRenamingProject: PropTypes.func.isRequired,
    updatedName: PropTypes.string,
    cancelRenamingProject: PropTypes.func.isRequired,
  };

  state = {
    deleting: false,
    publishing: false,
    unpublishing: false,
    renaming: false,
    remixing: false
  };

  onPublish = () => {
    this.props.showPublishDialog(this.props.projectId, this.props.projectType);
  };

  onUnpublish = () => {
    this.props.unpublishProject(this.props.projectId);
  };

  onDelete = () => {
    this.props.showDeleteDialog(this.props.projectId);
  };

  onRename = () => {
    this.props.startRenamingProject(this.props.projectId, this.props.updatedName);
  };

  onCancel = () => {
    this.props.cancelRenamingProject(this.props.projectId);
  };

  render() {
    const {isEditing} = this.props;

    return (
      <div>
        {!isEditing  &&
          <QuickActionsCell>
            <PopUpMenu.Item
              onClick={this.onRename}
            >
              {i18n.rename()}
            </PopUpMenu.Item>
            <PopUpMenu.Item
              onClick={() => console.log("Remix was clicked")}
            >
              {i18n.remix()}
            </PopUpMenu.Item>
            {this.props.isPublished && (
              <PopUpMenu.Item
                onClick={this.onUnpublish}
              >
                {i18n.unpublish()}
              </PopUpMenu.Item>
            )}
            {!this.props.isPublished && (
              <PopUpMenu.Item
                onClick={this.onPublish}
              >
                {i18n.publish()}
              </PopUpMenu.Item>
            )}
            <MenuBreak/>
            <PopUpMenu.Item
              onClick={() => console.log("Delete was clicked")}
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
              onClick={() => console.log("Save was clicked")}
              color={Button.ButtonColor.orange}
              text={i18n.save()}
              style={styles.saveButton}
              disabled={true}
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
}))(PersonalProjectsTableActionsCell);
