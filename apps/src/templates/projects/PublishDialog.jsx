import React, { Component, PropTypes } from 'react';
import Dialog from '../../templates/Dialog';
import i18n from '@cdo/locale';

export default class PublishDialog extends Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onConfirmPublish: PropTypes.func.isRequired,
  }

  confirm = () => this.props.onConfirmPublish();

  close = () => this.props.onClose();

  render() {
    return (
      <Dialog
        title={i18n.publishToPublicGallery()}
        body={i18n.publishToPublicGalleryWarning()}
        confirmText={i18n.publish()}
        isOpen={true}
        handleClose={this.close}
        onCancel={this.close}
        onConfirm={this.confirm}
      />
    );
  }
}
