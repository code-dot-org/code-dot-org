import React, { Component, PropTypes } from 'react';
import Dialog from '../Dialog';
import i18n from '@cdo/locale';

export default class PublishDialog extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
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
        body={i18n.publishToPublicGalleryWarning()}
        confirmText={i18n.publish()}
        isOpen={this.props.isOpen}
        handleClose={this.close}
        onCancel={this.close}
        onConfirm={this.confirm}
      />
    );
  }
}
