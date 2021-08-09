import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import BaseDialog from '../../BaseDialog';
import DialogFooter from '../../teacherDashboard/DialogFooter';
import Button from '../../Button';
import i18n from '@cdo/locale';
import {hideDeleteDialog, deleteProject} from './deleteProjectDialogRedux';

class DeleteProjectDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    projectId: PropTypes.string,
    isDeletePending: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    deleteProject: PropTypes.func.isRequired
  };

  close = () => this.props.onClose();

  delete = () => this.props.deleteProject(this.props.projectId);

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.close}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2 className="delete-dialog-title">{i18n.deleteProject()}</h2>
        <div style={{marginBottom: 10}}>{i18n.deleteProjectConfirm()}</div>
        <DialogFooter>
          <Button
            __useDeprecatedTag
            text={i18n.dialogCancel()}
            onClick={this.close}
            color={Button.ButtonColor.gray}
            className="no-mc"
          />
          <Button
            __useDeprecatedTag
            text={i18n.delete()}
            onClick={this.delete}
            color={Button.ButtonColor.orange}
            className="no-mc ui-confirm-project-delete-button"
            isPending={this.props.isDeletePending}
            pendingText={i18n.deleting()}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  }
};

export const UnconnectedDeleteProjectDialog = DeleteProjectDialog;

export default connect(
  state => ({
    isOpen: state.deleteDialog.isOpen,
    isDeletePending: state.deleteDialog.isDeletePending,
    projectId: state.deleteDialog.projectId
  }),
  dispatch => ({
    onClose() {
      dispatch(hideDeleteDialog());
    },
    deleteProject(projectId) {
      return dispatch(deleteProject(projectId));
    }
  })
)(DeleteProjectDialog);
