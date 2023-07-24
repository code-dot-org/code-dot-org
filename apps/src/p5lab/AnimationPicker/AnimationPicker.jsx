import PropTypes from 'prop-types';
import React from 'react';
import {createUuid, makeEnum} from '@cdo/apps/utils';
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
  handleUploadError,
  saveSelectedAnimations,
} from '../redux/animationPicker';
import AnimationPickerBody from './AnimationPickerBody.jsx';
import HiddenUploader from '@cdo/apps/code-studio/components/HiddenUploader';
import {AnimationProps} from '@cdo/apps/p5lab/shapes';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
// Some operating systems round their file sizes, so max size is 101KB even
// though our error message says 100KB, to help users avoid confusion.
const MAX_UPLOAD_SIZE = 101000;

export const PICKER_TYPE = makeEnum('spritelab', 'gamelab', 'backgrounds');

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
    hideAnimationNames: PropTypes.bool.isRequired,
    navigable: PropTypes.bool.isRequired,
    defaultQuery: PropTypes.object,
    hideBackgrounds: PropTypes.bool.isRequired,
    hideCostumes: PropTypes.bool.isRequired,
    pickerType: PropTypes.oneOf(Object.values(PICKER_TYPE)).isRequired,
    shouldWarnOnAnimationUpload: PropTypes.bool.isRequired,

    // Provided via Redux
    visible: PropTypes.bool.isRequired,
    uploadInProgress: PropTypes.bool.isRequired,
    uploadError: PropTypes.string,
    selectedAnimations: PropTypes.arrayOf(AnimationProps).isRequired,
    onClose: PropTypes.func.isRequired,
    onPickNewAnimation: PropTypes.func.isRequired,
    onPickLibraryAnimation: PropTypes.func.isRequired,
    onUploadStart: PropTypes.func.isRequired,
    onUploadDone: PropTypes.func.isRequired,
    onUploadError: PropTypes.func.isRequired,
    playAnimations: PropTypes.bool.isRequired,
    onAnimationSelectionComplete: PropTypes.func.isRequired,
    uploadWarningShowing: PropTypes.bool.isRequired,
  };

  state = {
    exitingDialog: false,
  };

  onUploadClick = () => this.refs.uploader.openFileChooser();

  onClose = () => {
    // If the user has not selected any animations yet, close immediately
    if (this.props.selectedAnimations.length > 0) {
      this.setState({exitingDialog: true});
    } else {
      this.props.onClose();
    }
  };

  contextSpecificName = () => {
    // Return text depending on the context of the animation picker
    switch (this.props.pickerType) {
      case PICKER_TYPE.spritelab:
        return msg.costume();
      case PICKER_TYPE.gamelab:
        return msg.animation();
      case PICKER_TYPE.backgrounds:
        return msg.background();
    }
  };

  renderVisibleBody() {
    if (this.props.uploadError) {
      return (
        <h1>{msg.animationPicker_error({message: this.props.uploadError})}</h1>
      );
    } else if (this.props.uploadInProgress) {
      return <h1 style={styles.title}>{msg.animationPicker_uploading()}</h1>;
    }

    const contextName = this.contextSpecificName();

    return (
      <div>
        <AnimationPickerBody
          onDrawYourOwnClick={this.props.onPickNewAnimation}
          onPickLibraryAnimation={this.props.onPickLibraryAnimation}
          onUploadClick={this.onUploadClick}
          onAnimationSelectionComplete={this.props.onAnimationSelectionComplete}
          playAnimations={this.props.playAnimations}
          libraryManifest={this.props.libraryManifest}
          hideAnimationNames={this.props.hideAnimationNames}
          navigable={this.props.navigable}
          defaultQuery={this.props.defaultQuery}
          hideBackgrounds={this.props.hideBackgrounds}
          hideCostumes={this.props.hideCostumes}
          selectedAnimations={this.props.selectedAnimations}
          pickerType={this.props.pickerType}
          shouldWarnOnAnimationUpload={this.props.shouldWarnOnAnimationUpload}
        />
        <StylizedBaseDialog
          title={msg.animationPicker_leaveSelectionTitle()}
          isOpen={this.state.exitingDialog}
          backdropStyle={{
            top: -15,
            right: -15,
            bottom: -15,
            left: -15,
          }}
          hideCloseButton={true}
          handleClose={() => {
            this.setState({exitingDialog: false});
          }}
          cancellationButtonText={msg.animationPicker_discardSelection()}
          handleCancellation={() => {
            this.props.onClose();
            this.setState({exitingDialog: false});
          }}
          confirmationButtonText={msg.animationPicker_returnToLibrary()}
          handleConfirmation={() => {
            this.setState({exitingDialog: false});
          }}
          style={styles.dialog}
          body={<p>{msg.animationPicker_leaveSelectionText({contextName})}</p>}
        />
      </div>
    );
  }

  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <BaseDialog
        isOpen
        handleClose={this.onClose}
        uncloseable={
          this.props.uploadInProgress || this.props.uploadWarningShowing
        }
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

AnimationPicker.defaultProps = {
  allowedExtensions: ['.png', '.jpg', '.jpeg'].join(','),
};

export default connect(
  state => ({
    visible: state.animationPicker.visible,
    uploadInProgress: state.animationPicker.uploadInProgress,
    uploadError: state.animationPicker.uploadError,
    playAnimations: !state.pageConstants.allAnimationsSingleFrame,
    selectedAnimations: Object.values(state.animationPicker.selectedAnimations),
    uploadWarningShowing: state.animationPicker.uploadWarningShowing,
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
    },
    onAnimationSelectionComplete() {
      dispatch(saveSelectedAnimations());
    },
  })
)(AnimationPicker);
