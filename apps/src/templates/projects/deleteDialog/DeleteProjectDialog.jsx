import React, { Component, PropTypes } from 'react';
import BaseDialog from '../../BaseDialog';
import DialogFooter from '../../teacherDashboard/DialogFooter';
import Button from '../../Button';
import i18n from '@cdo/locale';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
};

export default class DeleteProjectDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    projectId: PropTypes.string,
    isDeletePending: PropTypes.bool,
    onClose: PropTypes.func,
  };

  close = () => this.props.onClose();

  render() {
    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        handleClose={this.close}
        useUpdatedStyles
        style={styles.dialog}
      >
        <h2 className="delete-dialog-title">
          {i18n.deleteProject()}
        </h2>
        <div style={{marginBottom: 10}}>
          {i18n.deleteProjectConfirm()}
        </div>
        <DialogFooter>
          <Button
            text={i18n.dialogCancel()}
            onClick={this.close}
            color={Button.ButtonColor.gray}
            className="no-mc"
          />
          <Button
            text={i18n.delete()}
            onClick={() => console.log("Confirm delete was clickeds")}
            color={Button.ButtonColor.orange}
            className="no-mc"
            isPending={this.props.isDeletePending}
            pendingText={i18n.deleting()}
          />
        </DialogFooter>
      </BaseDialog>
    );
  }
}
