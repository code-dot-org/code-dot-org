import PropTypes from 'prop-types';
import React from 'react';
import {createUuid} from '@cdo/apps/utils';
import {connect} from 'react-redux';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
var msg = require('@cdo/locale');
import styles from './styles';
import {
  hide,
  pickNewAnimation,
  pickLibraryAnimation,
  beginUpload,
  handleUploadComplete,
  handleUploadError
} from '../redux/animationPicker';
import AnimationPickerBody from './AnimationPickerBody.jsx';
import HiddenUploader from '@cdo/apps/code-studio/components/HiddenUploader';

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
class AnimationPicker extends React.Component {
  static propTypes = {
    // Provided externally
    channelId: PropTypes.string.isRequired,
    allowedExtensions: PropTypes.string,
    libraryManifest: PropTypes.object.isRequired,
    hideUploadOption: PropTypes.bool.isRequired,
    hideAnimationNames: PropTypes.bool.isRequired,
    navigable: PropTypes.bool.isRequired,
    defaultQuery: PropTypes.object,
    hideBackgrounds: PropTypes.bool.isRequired,
    canDraw: PropTypes.bool.isRequired,

    // Provided via Redux
    visible: PropTypes.bool.isRequired,
    uploadInProgress: PropTypes.bool.isRequired,
    uploadError: PropTypes.string,
    is13Plus: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onPickNewAnimation: PropTypes.func.isRequired,
    onPickLibraryAnimation: PropTypes.func.isRequired,
    onUploadStart: PropTypes.func.isRequired,
    onUploadDone: PropTypes.func.isRequired,
    onUploadError: PropTypes.func.isRequired,
    playAnimations: PropTypes.bool.isRequired
  };

  onUploadClick = () => this.refs.uploader.openFileChooser();

  renderVisibleBody() {
    if (this.props.uploadError) {
      return (
        <h1>{msg.animationPicker_error({message: this.props.uploadError})}</h1>
      );
    } else if (this.props.uploadInProgress) {
      return <h1 style={styles.title}>{msg.animationPicker_uploading()}</h1>;
    }
    return (
      <AnimationPickerBody
        is13Plus={this.props.is13Plus}
        onDrawYourOwnClick={this.props.onPickNewAnimation}
        onPickLibraryAnimation={this.props.onPickLibraryAnimation}
        onUploadClick={this.onUploadClick}
        playAnimations={this.props.playAnimations}
        libraryManifest={this.props.libraryManifest}
        hideUploadOption={this.props.hideUploadOption}
        hideAnimationNames={this.props.hideAnimationNames}
        navigable={this.props.navigable}
        defaultQuery={this.props.defaultQuery}
        hideBackgrounds={this.props.hideBackgrounds}
        canDraw={this.props.canDraw}
      />
    );
  }

  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <BaseDialog
        isOpen
        handleClose={this.props.onClose}
        uncloseable={this.props.uploadInProgress}
        fullWidth={true}
        style={styles.dialog}
      >
        <HiddenUploader
          ref="uploader"
          toUrl={
            '/v3/animations/' +
            this.props.channelId +
            '/' +
            createUuid() +
            '.png'
          }
          allowedExtensions={this.props.allowedExtensions}
          onUploadStart={this.props.onUploadStart}
          onUploadDone={this.props.onUploadDone}
          onUploadError={this.props.onUploadError}
        />
        {this.renderVisibleBody()}
      </BaseDialog>
    );
  }
}

export default connect(
  state => ({
    visible: state.animationPicker.visible,
    uploadInProgress: state.animationPicker.uploadInProgress,
    uploadError: state.animationPicker.uploadError,
    is13Plus: state.pageConstants.is13Plus,
    playAnimations: !state.pageConstants.allAnimationsSingleFrame
  }),
  dispatch => ({
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
        dispatch(handleUploadError(msg.animationPicker_unsupportedSize()));
      } else if (
        data.files[0].type === 'image/png' ||
        data.files[0].type === 'image/jpeg'
      ) {
        dispatch(beginUpload(data.files[0].name));
        data.submit();
      } else {
        dispatch(handleUploadError(msg.animationPicker_unsupportedType()));
      }
    },
    onUploadDone(result) {
      dispatch(handleUploadComplete(result));
    },
    onUploadError(status) {
      dispatch(handleUploadError(status));
    }
  })
)(AnimationPicker);
