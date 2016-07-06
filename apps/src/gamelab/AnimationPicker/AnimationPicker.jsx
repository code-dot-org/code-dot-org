import React from 'react';
import utils from '../../utils';
import { connect } from 'react-redux';
import Dialog from '../../templates/DialogComponent.jsx';
import gamelabMsg from '../locale';
import styles from './styles';
import { hide, pickNewAnimation, pickLibraryAnimation, beginUpload,
    handleUploadComplete, handleUploadError } from './animationPickerModule';
import AnimationPickerBody from './AnimationPickerBody.jsx';
const HiddenUploader = window.dashboard.HiddenUploader;

/**
 * Dialog used for finding/selecting/uploading one or more assets to add to a
 * GameLab project.
 *
 * When opened, the picker can have one of two goals:
 *   NEW_ANIMATION - the picked assets become new animations in the project.
 *   NEW_FRAME - the picked assets become new frames in an existing animation.
 *
 * It's possible for the picker to be dismissed without selecting anything,
 * or it gets dismissed when a final selection is confirmed.
 *
 * As a dialog-type redux-friendly component, the AnimationPicker handles its
 * own display state and can be "rendered" at all times by its parent.
 */
const AnimationPicker = React.createClass({
  propTypes: {
    // Provided externally
    channelId: React.PropTypes.string.isRequired,
    typeFilter: React.PropTypes.string,

    // Provided via Redux
    visible: React.PropTypes.bool.isRequired,
    uploadInProgress: React.PropTypes.bool.isRequired,
    uploadError: React.PropTypes.string,
    onClose: React.PropTypes.func.isRequired,
    onPickNewAnimation: React.PropTypes.func.isRequired,
    onPickLibraryAnimation: React.PropTypes.func.isRequired,
    onUploadStart: React.PropTypes.func.isRequired,
    onUploadDone: React.PropTypes.func.isRequired,
    onUploadError: React.PropTypes.func.isRequired
  },

  onUploadClick() {
    this.refs.uploader.openFileChooser();
  },

  renderVisibleBody() {
    if (this.props.uploadError) {
      return <h1>{gamelabMsg.animationPicker_error({ message: this.props.uploadError })}</h1>;
    } else if (this.props.uploadInProgress) {
      return <h1 style={styles.title}>{gamelabMsg.animationPicker_uploading()}</h1>;
    }
    return (
        <AnimationPickerBody
            onDrawYourOwnClick={this.props.onPickNewAnimation}
            onPickLibraryAnimation={this.props.onPickLibraryAnimation}
            onUploadClick={this.onUploadClick}
        />
    );
  },

  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <Dialog
          isOpen
          handleClose={this.props.onClose}
          uncloseable={this.props.uploadInProgress}>
        <HiddenUploader
            ref="uploader"
            toUrl={'/v3/animations/' + this.props.channelId + '/' + utils.createUuid() + '.png'}
            typeFilter={this.props.typeFilter}
            onUploadStart={this.props.onUploadStart}
            onUploadDone={this.props.onUploadDone}
            onUploadError={this.props.onUploadError} />
        {this.renderVisibleBody()}
      </Dialog>
    );
  }
});

export default connect(state => ({
  visible: state.animationPicker.visible,
  uploadInProgress: state.animationPicker.uploadInProgress,
  uploadError: state.animationPicker.uploadError
}), dispatch => ({
  onClose() {
    dispatch(hide());
  },
  onPickNewAnimation() {
    dispatch(pickNewAnimation());
  },
  onPickLibraryAnimation(animation) {
    dispatch(pickLibraryAnimation(animation));
  },
  onUploadStart(data) {
    dispatch(beginUpload(data.files[0].name));
  },
  onUploadDone(result) {
    dispatch(handleUploadComplete(result));
  },
  onUploadError(status) {
    dispatch(handleUploadError(status));
  }
}))(AnimationPicker);
