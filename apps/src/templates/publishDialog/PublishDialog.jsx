import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Radium from 'radium';
import Dialog, { Body, styles as dialogStyles } from '../Dialog';
import PendingButton from '../PendingButton';
import LegacyButton, { BUTTON_TYPES } from '../LegacyButton';
import i18n from '@cdo/locale';
import { hidePublishDialog, publishProject } from './publishDialogRedux';

class PublishDialog extends Component {
  static propTypes = {
    // from redux state
    isOpen: PropTypes.bool.isRequired,
    isPublishPending: PropTypes.bool.isRequired,
    projectId: PropTypes.string,
    projectType: PropTypes.string,

    // from redux dispatch
    onClose: PropTypes.func.isRequired,
    onConfirmPublish: PropTypes.func.isRequired,

    // specify alternate behavior of onConfirmPublish
    onConfirmPublishOverride: PropTypes.func,

    // specify additional behavior after successful call to onConfirmPublish,
    // if not overridden by onConfirmPublishOverride.
    afterPublish: PropTypes.func,
  };

  confirm = () => {
    if (this.props.onConfirmPublishOverride) {
      this.props.onConfirmPublishOverride();
      return;
    }
    this.props.onConfirmPublish(
      this.props.projectId,
      this.props.projectType,
    ).then(this.props.afterPublish);
  };

  close = () => this.props.onClose();

  render() {
    return (
      <Dialog
        title={i18n.publishToPublicGallery()}
        isOpen={this.props.isOpen}
        handleClose={this.close}
      >
        <Body>
          <div style={[dialogStyles.body, {marginBottom: 10}]}>
            {i18n.publishToPublicGalleryWarning()}
          </div>
          <LegacyButton type="cancel" onClick={this.close} className="no-mc">
            {i18n.dialogCancel()}
          </LegacyButton>
          <PendingButton
            id="publish-dialog-publish-button"
            isPending={this.props.isPublishPending}
            onClick={this.confirm}
            pendingText={i18n.publishPending()}
            style={[BUTTON_TYPES.primary.style, {float: 'right'}]}
            text={i18n.publish()}
            className="no-mc"
          />
        </Body>
      </Dialog>
    );
  }
}

export const UnconnectedPublishDialog = Radium(PublishDialog);

export default connect(state => ({
  isOpen: state.publishDialog.isOpen,
  isPublishPending: state.publishDialog.isPublishPending,
  projectId: state.publishDialog.projectId,
  projectType: state.publishDialog.projectType,
}), dispatch => ({
  onClose() {
    dispatch(hidePublishDialog());
  },
  onConfirmPublish(projectId, projectType) {
    return dispatch(publishProject(projectId, projectType));
  },
}))(Radium(PublishDialog));
