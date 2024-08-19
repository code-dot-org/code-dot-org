import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import Button from '@cdo/apps/legacySharedComponents/Button';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import BaseDialog from '../BaseDialog';
import DialogFooter from '../teacherDashboard/DialogFooter';

import {setShowSharingColumn, editAll} from './manageStudentsRedux';

class ControlProjectSharingDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func,
    showSharingColumn: PropTypes.func,
    editAll: PropTypes.func,
  };

  state = {
    isDialogOpen: this.props.isDialogOpen,
  };

  handleShowSharingClick = () => {
    this.props.showSharingColumn();
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
            <SafeMarkdown markdown={i18n.projectSharingDialogInstructions()} />
          </div>
          <DialogFooter>
            <Button
              text={i18n.dialogCancel()}
              onClick={this.props.closeDialog}
              color={Button.ButtonColor.gray}
              style={styles.buttonWithoutMargin}
            />
            <Button
              text={i18n.projectSharingDialogButton()}
              onClick={this.handleShowSharingClick}
              color={Button.ButtonColor.brandSecondaryDefault}
              style={styles.buttonWithoutMargin}
            />
          </DialogFooter>
        </BaseDialog>
      </div>
    );
  }
}

const styles = {
  dialog: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  buttonWithoutMargin: {
    margin: 0,
  },
};

export const UnconnectedControlProjectSharingDialog =
  ControlProjectSharingDialog;

export default connect(
  state => ({}),
  dispatch => ({
    showSharingColumn() {
      dispatch(setShowSharingColumn(true));
    },
    editAll() {
      dispatch(editAll());
    },
  })
)(ControlProjectSharingDialog);
