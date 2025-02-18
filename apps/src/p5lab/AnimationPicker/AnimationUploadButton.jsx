import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import project from '@cdo/apps/code-studio/initApp/project';
import {
  refreshInRestrictedShareMode,
  refreshTeacherHasConfirmedUploadWarning,
} from '@cdo/apps/code-studio/projectRedux';
import ImageUploadModal from '@cdo/apps/templates/imageUploadWarning/ImageUploadModal';
import PublishedWarningModal from '@cdo/apps/templates/imageUploadWarning/PublishedWarningModal';
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
 * before allowing uploads. For students, if the project should restrict uploads and is already
 * published, we will not allow uploads until the project is un-published.
 */
export function UnconnectedAnimationUploadButton({
  onUploadClick,
  shouldWarnOnAnimationUpload,
  isBackgroundsTab,
  teacherHasConfirmedUploadWarning,
  inRestrictedShareMode,
  refreshInRestrictedShareMode,
  refreshTeacherHasConfirmedUploadWarning,
  showingUploadWarning,
  exitedUploadWarning,
  currentUserType,
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPublishedWarningModalOpen, setIsPublishedWarningModalOpen] =
    useState(false);

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

  function renderUploadButton() {
    return (
      <AnimationPickerListItem
        label={msg.animationPicker_uploadImage()}
        icon="upload"
        onClick={
          showRestrictedUploadWarning
            ? project.isPublished() && !isTeacher
              ? showPublishedWarning
              : showUploadModal
            : onUploadClick
        }
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

  function showPublishedWarning() {
    setIsPublishedWarningModalOpen(true);
    showingUploadWarning();
  }

  function closePublishedWarning() {
    setIsPublishedWarningModalOpen(false);
    exitedUploadWarning();
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
      <PublishedWarningModal
        isOpen={isPublishedWarningModalOpen}
        onClose={closePublishedWarning}
      />
      {renderUploadButton()}
    </>
  );
}

UnconnectedAnimationUploadButton.propTypes = {
  onUploadClick: PropTypes.func.isRequired,
  shouldWarnOnAnimationUpload: PropTypes.bool.isRequired,
  isBackgroundsTab: PropTypes.bool.isRequired,
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
