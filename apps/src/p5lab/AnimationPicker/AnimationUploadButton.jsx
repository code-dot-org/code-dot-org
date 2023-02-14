import React, {useState} from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import project from '@cdo/apps/code-studio/initApp/project';
import BaseDialog from '../../templates/BaseDialog.jsx';
import classNames from 'classnames';
import styles from './animation-upload-button.module.scss';
import {connect} from 'react-redux';
import {refreshInRestrictedShareMode} from '../../code-studio/projectRedux.js';

export function UnconnectedAnimationUploadButton({
  onUploadClick,
  shouldRestrictAnimationUpload,
  isBackgroundsTab,
  inRestrictedShareMode,
  refreshInRestrictedShareMode
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noPIIConfirmed, setNoPIIConfirmed] = useState(false);
  const [restrictedShareConfirmed, setRestrictedShareConfirmed] = useState(
    false
  );
  const showRestrictedUploadWarning =
    shouldRestrictAnimationUpload && !inRestrictedShareMode;

  function renderUploadButton() {
    return (
      <AnimationPickerListItem
        label={msg.animationPicker_uploadImage()}
        icon="upload"
        onClick={
          showRestrictedUploadWarning
            ? () => setIsModalOpen(true)
            : onUploadClick
        }
        isBackgroundsTab={isBackgroundsTab}
      />
    );
  }

  function renderUploadModal() {
    return (
      <BaseDialog
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
      >
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
          <p className={styles.modalDetails}>
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
            onClick={confirmRestrictedUpload}
            disabled={!(noPIIConfirmed && restrictedShareConfirmed)}
          >
            {msg.dialogOK()}
          </button>
        </div>
      </BaseDialog>
    );
  }

  function confirmRestrictedUpload() {
    project.setInRestrictedShareMode(true);
    setIsModalOpen(false);
    // redux setting, for use in share/remix
    refreshInRestrictedShareMode();
    onUploadClick();
  }

  function cancelUpload() {
    setRestrictedShareConfirmed(false);
    setNoPIIConfirmed(false);
    setIsModalOpen(false);
  }

  return (
    <>
      {renderUploadModal()}
      {renderUploadButton()}
    </>
  );
}

UnconnectedAnimationUploadButton.propTypes = {
  onUploadClick: PropTypes.func.isRequired,
  shouldRestrictAnimationUpload: PropTypes.bool.isRequired,
  isBackgroundsTab: PropTypes.bool.isRequired,
  // populated from redux
  inRestrictedShareMode: PropTypes.bool.isRequired,
  refreshInRestrictedShareMode: PropTypes.func.isRequired
};

export default connect(
  state => ({
    inRestrictedShareMode: state.project.inRestrictedShareMode
  }),
  dispatch => ({
    refreshInRestrictedShareMode: inRestrictedShareMode =>
      dispatch(refreshInRestrictedShareMode(inRestrictedShareMode))
  })
)(UnconnectedAnimationUploadButton);
