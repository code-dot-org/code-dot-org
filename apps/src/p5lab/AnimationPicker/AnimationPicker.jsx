import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import HiddenUploader from '@cdo/apps/code-studio/components/HiddenUploader';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {AnimationProps} from '@cdo/apps/p5lab/shapes';
import StylizedBaseDialog from '@cdo/apps/sharedComponents/StylizedBaseDialog';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import HttpClient from '@cdo/apps/util/HttpClient';
import {createUuid, makeEnum} from '@cdo/apps/utils';

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
import FlaggedImageModal from './FlaggedImageModal';
import styles from './styles';

var msg = require('@cdo/locale');
// Some operating systems round their file sizes, so max size is 101KB even
// though our error message says 100KB, to help users avoid confusion.
const MAX_UPLOAD_SIZE = 101000;

export const PICKER_TYPE = makeEnum(
  'spritelab',
  'gamelab',
  'backgrounds',
  'animationJson'
);

/**
 * Dialog used for finding/selecting/uploading one or more assets to add to a
 * Game Lab/Sprite Lab project or curriculum levels.
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
    projectType: PropTypes.string,

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
    uploadsEnabled: PropTypes.bool.isRequired,
  };

  state = {
    exitingDialog: false,
    showFlaggedModal: false,
    pendingUploadData: null,
    flaggedModalError: null,
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
          uploadsEnabled={this.props.uploadsEnabled}
          projectType={this.props.projectType}
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

  getImageDimensions = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          resolve({width: img.width, height: img.height});
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Send the uploaded image file to be moderated. Then continue with uploadStart.
   */
  handleModeratedUploadStart = data => {
    const file = data?.files?.[0];
    if (!file) {
      console.error('No file found in upload data.');
      return;
    }
    if (data.files[0].size >= MAX_UPLOAD_SIZE) {
      this.props.onUploadError(msg.animationPicker_unsupportedSize());
      return;
    }
    if (
      data.files[0].type !== 'image/png' &&
      data.files[0].type !== 'image/jpeg'
    ) {
      this.props.onUploadError(msg.animationPicker_unsupportedType());
      return;
    }
    this.getImageDimensions(file)
      .then(({width, height}) => {
        if (width < 128 || height < 128) {
          // We skip moderation of small images because Azure Content Moderator has a minimum
          // requirement for their evaluate endpoint.
          // TODO: resize small images and then moderate. https://codedotorg.atlassian.net/browse/SL-1367
          this.props.onUploadStart(data);
          return;
        }

        this.setState({
          pendingUploadData: data,
        });

        HttpClient.post(`/v3/images/moderate`, file, true, {
          'Content-Type': file.type,
        })
          .then(response => response.json())
          .then(json => {
            // If rating is not 'everyone' or 'unknown', then flag project for image moderation.
            if (json.rating !== 'everyone' && json.rating !== 'unknown') {
              this.setState({
                showFlaggedModal: true,
              });
              analyticsReporter.sendEvent(
                EVENTS.FLAGGED_CUSTOM_IMAGE,
                {
                  UploaderType: 'Animation Picker',
                  ProjectType: this.props.projectType,
                },
                PLATFORMS.STATSIG
              );
            } else {
              // If the image is rated 'everyone' or 'unknown', continue with upload.
              this.props.onUploadStart(this.state.pendingUploadData);
            }
          })
          .catch(err => {
            this.props.onUploadError(msg.animationPicker_uploadingError());
            MetricsReporter.logError('Azure image moderation error: ' + err);
          });
      })
      .catch(err => {
        MetricsReporter.logError('Error getting image dimensions: ' + err);
        this.props.onUploadError(msg.animationPicker_uploadingError());
      });
  };

  handleAcceptFlaggedImage = () => {
    const {pendingUploadData} = this.state;
    if (!pendingUploadData) return;

    const body = JSON.stringify({type: 'flag'});
    HttpClient.post(
      `/v3/channels/${this.props.channelId}/abuse/image`,
      body,
      true,
      {'Content-Type': 'application/json; charset=UTF-8'}
    )
      .then(response => response.json())
      .then(() => {
        this.props.onUploadStart(pendingUploadData);
        this.setState({
          showFlaggedModal: false,
          pendingUploadData: null,
        });
        analyticsReporter.sendEvent(
          EVENTS.ACCEPT_FLAGGED_CUSTOM_IMAGE,
          {
            UploaderType: 'Animation Picker',
            ProjectType: this.props.projectType,
          },
          PLATFORMS.STATSIG
        );
      })
      .catch(err => {
        this.setState({
          showFlaggedModal: true,
          flaggedModalError: msg.animationPicker_uploadingError(),
        });
        MetricsReporter.logError('Update project abuse error: ' + err);
      });
  };

  handleCancelFlaggedImage = () => {
    this.setState({
      showFlaggedModal: false,
      pendingUploadData: null,
      flaggedModalError: null,
    });
    analyticsReporter.sendEvent(
      EVENTS.CANCEL_FLAGGED_CUSTOM_IMAGE,
      {UploaderType: 'Animation Picker', ProjectType: this.props.projectType},
      PLATFORMS.STATSIG
    );
    this.props.onClose(); // Close the entire AnimationPicker
  };

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
          onUploadStart={this.handleModeratedUploadStart}
          onUploadDone={this.props.onUploadDone}
          onUploadError={this.props.onUploadError}
        />
        {this.state.showFlaggedModal && (
          <FlaggedImageModal
            isOpen
            onAccept={this.handleAcceptFlaggedImage}
            onCancel={this.handleCancelFlaggedImage}
            errorMessage={this.state.flaggedModalError}
          />
        )}
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
      dispatch(beginUpload(data.files[0].name));
      data.submit();
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
