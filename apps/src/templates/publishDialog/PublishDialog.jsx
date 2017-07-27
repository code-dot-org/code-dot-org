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
    isOpen: PropTypes.bool.isRequired,
    isPublishPending: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirmPublish: PropTypes.func.isRequired,
    projectId: PropTypes.string,
    projectType: PropTypes.string,
  }

  confirm = () => {
    this.props.onConfirmPublish(
      this.props.projectId,
      this.props.projectType,
    );
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
          <LegacyButton type="cancel" onClick={this.close}>
            {i18n.dialogCancel()}
          </LegacyButton>
          <PendingButton
            isPending={this.props.isPublishPending}
            onClick={this.confirm}
            pendingStyle={BUTTON_TYPES.default.style}
            pendingText={i18n.publishPending()}
            style={[BUTTON_TYPES.primary.style, {float: 'right'}]}
            text={i18n.publish()}
          />
        </Body>
      </Dialog>
    );
  }
}
export default connect(state => ({
  isOpen: state.publishDialog.isOpen,
  isPublishPending: state.publishDialog.isPublishPending,
  projectId: state.publishDialog.projectId,
  projectType: state.publishDialog.projectType,
}), (dispatch, ownProps) => ({
  onClose() {
    // Allow onClose to be overridden when passed explicitly as a prop
    if (ownProps.onClose) {
      ownProps.onClose();
    } else {
      dispatch(hidePublishDialog());
    }
  },
  onConfirmPublish(projectId, projectType) {
    // Allow onConfirmPublish to be overridden when passed explicitly as a prop
    if (ownProps.onConfirmPublish) {
      ownProps.onConfirmPublish(projectId, projectType);
    } else {
      dispatch(publishProject(projectId, projectType));
    }
  },
}))(Radium(PublishDialog));
