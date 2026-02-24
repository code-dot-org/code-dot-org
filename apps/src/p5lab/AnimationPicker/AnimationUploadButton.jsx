import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import project from '@cdo/apps/code-studio/initApp/project';
import {
  refreshInRestrictedShareMode,
  refreshTeacherHasConfirmedUploadWarning,
} from '@cdo/apps/code-studio/projectRedux';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import ImageUploadModal from '@cdo/apps/templates/imageUploadWarning/ImageUploadModal';
import msg from '@cdo/locale';

import {
  exitedUploadWarning,
  showingUploadWarning,
} from '../redux/animationPicker.js';

import AnimationPickerListItem from './AnimationPickerListItem.jsx';

/**
 * Render the animation upload button. If the project should warn on upload
 * (which occurs for Sprite Lab projects), and the project has not already seen
 * the warning (see details on warnings by user type below), we show a warning modal
 * before allowing uploads.
 */
export function UnconnectedAnimationUploadButton({
  onUploadClick,
  shouldWarnOnAnimationUpload,
  isBackgroundsTab,
  projectType,
  teacherHasConfirmedUploadWarning,
  inRestrictedShareMode,
  refreshInRestrictedShareMode,
  refreshTeacherHasConfirmedUploadWarning,
  showingUploadWarning,
  exitedUploadWarning,
  currentUserType,
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Some of the behavior (particularly in the confirmation dialog) is conditional
  // on whether a student or teacher is uploading.
  // Teachers see a warning not to upload PII, and once they confirm this warning
  // we save that state to their project and don't show the warning again.
  // Students see a warning to not upload PII as well as a statement that they will not be able
  // to share their project if they upload -- we also save this state to their project and don't show the warning again.
  const isTeacher = currentUserType === 'teacher';
  let hasConfirmedWarning, updateWarningState;
  if (isTeacher) {
    hasConfirmedWarning = teacherHasConfirmedUploadWarning;
    updateWarningState = () => {
      project.setTeacherHasConfirmedUploadWarning(true);
      refreshTeacherHasConfirmedUploadWarning();
    };
  } else {
    hasConfirmedWarning = inRestrictedShareMode;
    updateWarningState = () => {
      project.setInRestrictedShareMode(true);
      // redux setting, for use in share/remix
      refreshInRestrictedShareMode();
    };
  }

  const showRestrictedUploadWarning =
    shouldWarnOnAnimationUpload && !hasConfirmedWarning;

  const onAnimationUploadClick = () => {
    if (showRestrictedUploadWarning) {
      showUploadModal();
    } else {
      onUploadClick();
      if (projectType) {
        analyticsReporter.sendEvent(
          EVENTS.UPLOAD_CUSTOM_IMAGE,
          {UploaderType: 'Animation Picker', ProjectType: projectType},
          PLATFORMS.STATSIG
        );
      }
    }
  };

  function renderUploadButton() {
    return (
      <AnimationPickerListItem
        label={msg.animationPicker_uploadImage()}
        icon="upload"
        onClick={onAnimationUploadClick}
        isBackgroundsTab={isBackgroundsTab}
      />
    );
  }

  function confirmUploadWarning() {
    updateWarningState();
    setIsUploadModalOpen(false);
    onUploadClick();
    exitedUploadWarning();
  }

  function showUploadModal() {
    setIsUploadModalOpen(true);
    showingUploadWarning();
  }

  function cancelUpload() {
    setIsUploadModalOpen(false);
    exitedUploadWarning();
  }

  return (
    <>
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        cancelUpload={cancelUpload}
        isTeacher={isTeacher}
        confirmUploadWarning={confirmUploadWarning}
      />
      {renderUploadButton()}
    </>
  );
}

UnconnectedAnimationUploadButton.propTypes = {
  onUploadClick: PropTypes.func.isRequired,
  shouldWarnOnAnimationUpload: PropTypes.bool.isRequired,
  isBackgroundsTab: PropTypes.bool.isRequired,
  projectType: PropTypes.string,
  // populated from redux
  inRestrictedShareMode: PropTypes.bool.isRequired,
  teacherHasConfirmedUploadWarning: PropTypes.bool.isRequired,
  refreshInRestrictedShareMode: PropTypes.func.isRequired,
  refreshTeacherHasConfirmedUploadWarning: PropTypes.func.isRequired,
  showingUploadWarning: PropTypes.func.isRequired,
  exitedUploadWarning: PropTypes.func.isRequired,
  currentUserType: PropTypes.string,
};

export default connect(
  state => ({
    inRestrictedShareMode: state.project.inRestrictedShareMode,
    teacherHasConfirmedUploadWarning:
      state.project.teacherHasConfirmedUploadWarning,
    currentUserType: state.currentUser?.userType,
  }),
  dispatch => ({
    refreshInRestrictedShareMode: inRestrictedShareMode =>
      dispatch(refreshInRestrictedShareMode(inRestrictedShareMode)),
    refreshTeacherHasConfirmedUploadWarning: () =>
      dispatch(refreshTeacherHasConfirmedUploadWarning()),
    showingUploadWarning: () => dispatch(showingUploadWarning()),
    exitedUploadWarning: () => dispatch(exitedUploadWarning()),
  })
)(UnconnectedAnimationUploadButton);
