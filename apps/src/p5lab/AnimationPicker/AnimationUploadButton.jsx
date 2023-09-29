import React, {useState} from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import project from '@cdo/apps/code-studio/initApp/project';
import {connect} from 'react-redux';
import {refreshInRestrictedShareMode} from '@cdo/apps/code-studio/projectRedux';
import {
  exitedUploadWarning,
  showingUploadWarning,
} from '../redux/animationPicker.js';
import ImageUploadModal from '@cdo/apps/templates/imageUploadWarning/ImageUploadModal';
import PublishedWarningModal from '@cdo/apps/templates/imageUploadWarning/PublishedWarningModal';

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
  inRestrictedShareMode,
  refreshInRestrictedShareMode,
  showingUploadWarning,
  exitedUploadWarning,
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPublishedWarningModalOpen, setIsPublishedWarningModalOpen] =
    useState(false);

  // Users see a warning to not upload PII as well as a statement that they will not be able
  // to share their project if they upload -- we also save this state to their project and don't show the warning again.
  let hasConfirmedWarning, updateWarningState;
  hasConfirmedWarning = inRestrictedShareMode;
  updateWarningState = () => {
    project.setInRestrictedShareMode(true);
    // redux setting, for use in share/remix
    refreshInRestrictedShareMode();
  };

  const showRestrictedUploadWarning =
    shouldWarnOnAnimationUpload && !hasConfirmedWarning;

  function renderUploadButton() {
    return (
      <AnimationPickerListItem
        label={msg.animationPicker_uploadImage()}
        icon="upload"
        onClick={
          showRestrictedUploadWarning
            ? project.isPublished()
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
  refreshInRestrictedShareMode: PropTypes.func.isRequired,
  showingUploadWarning: PropTypes.func.isRequired,
  exitedUploadWarning: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    inRestrictedShareMode: state.project.inRestrictedShareMode,
  }),
  dispatch => ({
    refreshInRestrictedShareMode: inRestrictedShareMode =>
      dispatch(refreshInRestrictedShareMode(inRestrictedShareMode)),
    showingUploadWarning: () => dispatch(showingUploadWarning()),
    exitedUploadWarning: () => dispatch(exitedUploadWarning()),
  })
)(UnconnectedAnimationUploadButton);
