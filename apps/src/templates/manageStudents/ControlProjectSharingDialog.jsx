import Modal from '@code-dot-org/component-library/modal';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import {setShowSharingColumn, editAll} from './manageStudentsRedux';

class ControlProjectSharingDialog extends Component {
  static propTypes = {
    isDialogOpen: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func,
    showSharingColumn: PropTypes.func,
    editAll: PropTypes.func,
  };

  handleShowSharingClick = () => {
    this.props.showSharingColumn();
    this.props.editAll();
    this.props.closeDialog();
  };

  render() {
    if (!this.props.isDialogOpen) {
      return null;
    }
    return (
      <Modal
        title={i18n.projectSharingDialogHeader()}
        onClose={this.props.closeDialog}
        customContent={
          <div id="dsco-dialog-description">
            <SafeMarkdown markdown={i18n.projectSharingDialogInstructions()} />
          </div>
        }
        primaryButtonProps={{
          children: i18n.projectSharingDialogButton(),
          onClick: this.handleShowSharingClick,
        }}
        secondaryButtonProps={{
          children: i18n.dialogCancel(),
          onClick: this.props.closeDialog,
        }}
      />
    );
  }
}

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
