import React from 'react';
import {createUuid} from '../../utils';
import { connect } from 'react-redux';
import BaseDialog from '../../templates/BaseDialog.jsx';
import gamelabMsg from '@cdo/gamelab/locale';
import styles from './styles';
import { hide, pickNewAnimation, pickLibraryAnimation, beginUpload,
    handleUploadComplete, handleUploadError } from './animationPickerModule';
import AnimationPickerBody from './AnimationPickerBody.jsx';
const HiddenUploader = window.dashboard.HiddenUploader;

// Some operating systems round their file sizes, so max size is 101KB even
// though our error message says 100KB, to help users avoid confusion.
const MAX_UPLOAD_SIZE = 101000;

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
    allowedExtensions: React.PropTypes.string,

    // Provided via Redux
    visible: React.PropTypes.bool.isRequired,
    uploadInProgress: React.PropTypes.bool.isRequired,
    uploadError: React.PropTypes.string,
    is13Plus: React.PropTypes.bool,
    onClose: React.PropTypes.func.isRequired,
    onPickNewAnimation: React.PropTypes.func.isRequired,
    onPickLibraryAnimation: React.PropTypes.func.isRequired,
    onUploadStart: React.PropTypes.func.isRequired,
    onUploadDone: React.PropTypes.func.isRequired,
    onUploadError: React.PropTypes.func.isRequired,
    playAnimations: React.PropTypes.bool.isRequired
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
          is13Plus={this.props.is13Plus}
          onDrawYourOwnClick={this.props.onPickNewAnimation}
          onPickLibraryAnimation={this.props.onPickLibraryAnimation}
          onUploadClick={this.onUploadClick}
          playAnimations={this.props.playAnimations}
        />
    );
  },

  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <BaseDialog
        isOpen
        useDeprecatedGlobalStyles
        handleClose={this.props.onClose}
        uncloseable={this.props.uploadInProgress}
        fullWidth={true}
      >
        <HiddenUploader
          ref="uploader"
          toUrl={'/v3/animations/' + this.props.channelId + '/' + createUuid() + '.png'}
          allowedExtensions={this.props.allowedExtensions}
          onUploadStart={this.props.onUploadStart}
          onUploadDone={this.props.onUploadDone}
          onUploadError={this.props.onUploadError}
        />
        {this.renderVisibleBody()}
      </BaseDialog>
    );
  }
});

export default connect(state => ({
  visible: state.animationPicker.visible,
  uploadInProgress: state.animationPicker.uploadInProgress,
  uploadError: state.animationPicker.uploadError,
  is13Plus: state.pageConstants.is13Plus,
  playAnimations: !state.pageConstants.allAnimationsSingleFrame
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
    if (data.files[0].size >= MAX_UPLOAD_SIZE) {
      dispatch(handleUploadError(gamelabMsg.animationPicker_unsupportedSize()));
    } else if (data.files[0].type === 'image/png' || data.files[0].type === 'image/jpeg') {
      dispatch(beginUpload(data.files[0].name));
      data.submit();
    } else {
      dispatch(handleUploadError(gamelabMsg.animationPicker_unsupportedType()));
    }
  },
  onUploadDone(result) {
    dispatch(handleUploadComplete(result));
  },
  onUploadError(status) {
    dispatch(handleUploadError(status));
  }
}))(AnimationPicker);
