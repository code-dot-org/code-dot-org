import React, {useState} from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import project from '@cdo/apps/code-studio/initApp/project';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import classNames from 'classnames';
import styles from './animation-upload-button.module.scss';
import {connect} from 'react-redux';
import {
  refreshInRestrictedShareMode,
  refreshTeacherHasConfirmedUploadWarning
} from '@cdo/apps/code-studio/projectRedux.js';
import {
  exitedUploadWarning,
  showingUploadWarning
} from '../redux/animationPicker.js';

/**
 * Render the animation upload button. If the project should restrict uploads
 * (which occurs for student Sprite Lab projects), and the project has not already seen
 * the warning (which is tracked with inRestrictedShareMode), we show a warning modal
 * before allowing uploads. If the project should restrict uploads and is already
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
  currentUserType
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [
    isPublishedWarningModalOpen,
    setIsPublishedWarningModalOpen
  ] = useState(false);
  const [noPIIConfirmed, setNoPIIConfirmed] = useState(false);
  const [restrictedShareConfirmed, setRestrictedShareConfirmed] = useState(
    false
  );
  // how does this work for signed out?
  const isTeacher = currentUserType === 'teacher';
  const showRestrictedUploadWarning =
    shouldWarnOnAnimationUpload &&
    (isTeacher ? !teacherHasConfirmedUploadWarning : !inRestrictedShareMode);

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

  // Warning dialog that says if you upload, you can no longer share and remix,
  // and you confirm you will not upload PII.
  function renderUploadModal() {
    return (
      <BaseDialog isOpen={isUploadModalOpen} handleClose={cancelUpload}>
        <div>
          <h1 className={styles.modalHeader}>
            {msg.animationPicker_restrictedShareRulesHeader()}
          </h1>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={noPIIConfirmed}
              onChange={() => setNoPIIConfirmed(!noPIIConfirmed)}
            />
            {msg.animationPicker_confirmNoPII()}
          </label>
          {!isTeacher && (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={restrictedShareConfirmed}
                onChange={() =>
                  setRestrictedShareConfirmed(!restrictedShareConfirmed)
                }
              />
              {msg.animationPicker_confirmRestrictedShare()}
            </label>
          )}

          <p className={styles.modalDetails}>
            {currentUserType}
            {msg.animationPicker_undoRestrictedShareInstructions()}
          </p>
        </div>
        <div className={styles.modalButtonRow}>
          <button
            className={classNames(styles.modalButton, styles.cancelButton)}
            type="button"
            onClick={cancelUpload}
          >
            {msg.dialogCancel()}
          </button>
          <button
            className={classNames(styles.modalButton, styles.confirmButton)}
            type="button"
            onClick={confirmUploadWarning}
            disabled={!isConfirmButtonEnabled()}
          >
            {msg.dialogOK()}
          </button>
        </div>
      </BaseDialog>
    );
  }

  const isConfirmButtonEnabled = () =>
    currentUserType === 'teacher'
      ? noPIIConfirmed
      : noPIIConfirmed && restrictedShareConfirmed;

  // Warning dialog that you cannot upload until you un-publish your project.
  function renderPublishedWarningModal() {
    return (
      <BaseDialog
        isOpen={isPublishedWarningModalOpen}
        handleClose={closePublishedWarning}
      >
        <div>
          <h1 className={styles.modalHeader}>
            {msg.animationPicker_cannotUploadHeader()}
          </h1>
          <p>{msg.animationPicker_cannotUploadIfPublished()}</p>
        </div>
        <div className={styles.modalButtonRow}>
          <button
            className={classNames(styles.modalButton, styles.confirmButton)}
            type="button"
            onClick={closePublishedWarning}
          >
            {msg.dialogOK()}
          </button>
        </div>
      </BaseDialog>
    );
  }

  function confirmUploadWarning() {
    if (isTeacher) {
      project.setTeacherHasConfirmedUploadWarning(true);
      // seems to be preventing popup (popup not appearning again), but can't find redux change in project object?
      refreshTeacherHasConfirmedUploadWarning();
    } else {
      project.setInRestrictedShareMode(true);
      // redux setting, for use in share/remix
      refreshInRestrictedShareMode();
    }

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
    setRestrictedShareConfirmed(false);
    setNoPIIConfirmed(false);
    setIsUploadModalOpen(false);
    exitedUploadWarning();
  }

  return (
    <>
      {renderUploadModal()}
      {renderPublishedWarningModal()}
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
  // why is this showing up undefined?
  teacherHasConfirmedUploadWarning: PropTypes.bool.isRequired,
  refreshInRestrictedShareMode: PropTypes.func.isRequired,
  refreshTeacherHasConfirmedUploadWarning: PropTypes.func.isRequired,
  showingUploadWarning: PropTypes.func.isRequired,
  exitedUploadWarning: PropTypes.func.isRequired,
  currentUserType: PropTypes.string
};

export default connect(
  state => ({
    inRestrictedShareMode: state.project.inRestrictedShareMode,
    teacherHasConfirmedUploadWarning:
      state.project.teacherHasConfirmedUploadWarning,
    currentUserType: state.currentUser?.userType
  }),
  dispatch => ({
    refreshInRestrictedShareMode: inRestrictedShareMode =>
      dispatch(refreshInRestrictedShareMode(inRestrictedShareMode)),
    refreshTeacherHasConfirmedUploadWarning: () =>
      dispatch(refreshTeacherHasConfirmedUploadWarning()),
    showingUploadWarning: () => dispatch(showingUploadWarning()),
    exitedUploadWarning: () => dispatch(exitedUploadWarning())
  })
)(UnconnectedAnimationUploadButton);
