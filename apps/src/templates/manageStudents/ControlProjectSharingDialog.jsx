import React, {Component, PropTypes} from 'react';
import {toggleSharingColumn, editAll} from './manageStudentsRedux';
import {connect} from 'react-redux';
import Button from '../Button';
import i18n from "@cdo/locale";
import BaseDialog from '../BaseDialog';
import DialogFooter from "../teacherDashboard/DialogFooter";
import UnsafeRenderedMarkdown from '@cdo/apps/templates/UnsafeRenderedMarkdown';

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20
  }
};

class ControlProjectSharingDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func,
    toggleSharingColumn: PropTypes.func,
    editAll: PropTypes.func
  };

  state = {
    isDialogOpen: this.props.isDialogOpen,
  };

  handleShowSharingClick = () => {
    this.props.toggleSharingColumn();
    this.props.editAll();
  };

  render() {
    return (
      <div>
        <BaseDialog
          useUpdatedStyles
          isOpen={this.props.isDialogOpen}
          style={styles.dialog}
          uncloseable
        >
          <h2>{i18n.projectSharingDialogHeader()}</h2>
          <div>
            <UnsafeRenderedMarkdown markdown={i18n.projectSharingDialogInstructions()} />
          </div>
          <DialogFooter>
            <Button
              text={i18n.dialogCancel()}
              onClick={this.props.closeDialog}
              color={Button.ButtonColor.gray}
            />
            <Button
              text={i18n.projectSharingDialogButton()}
              onClick={this.handleShowSharingClick}
              color={Button.ButtonColor.orange}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

export const UnconnectedControlProjectSharingDialog = ControlProjectSharingDialog;

export default connect(state => ({}), dispatch => ({
  toggleSharingColumn() {
    dispatch(toggleSharingColumn());
  },
  editAll() {
    dispatch(editAll());
  },
}))(ControlProjectSharingDialog);
