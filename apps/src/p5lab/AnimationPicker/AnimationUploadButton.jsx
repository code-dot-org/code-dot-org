import React, {useState} from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import project from '@cdo/apps/code-studio/initApp/project';
import BaseDialog from '../../templates/BaseDialog.jsx';
import classNames from 'classnames';
import styles from './animation-upload-button.module.scss';
import {connect} from 'react-redux';
import {setInRestrictedShareMode} from '../redux/animationTab.js';

function AnimationUploadButton({
  onUploadClick,
  shouldRestrictAnimationUpload,
  setInRestrictedShareMode
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showRestrictedUploadWarning =
    shouldRestrictAnimationUpload && !project.inRestrictedShareMode();

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
      />
    );
  }

  function renderUploadModal() {
    return (
      <BaseDialog
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
      >
        <div className={styles.warningMessage}>
          {msg.animationPicker_restrictedUploadWarning()}
        </div>
        <div className={styles.modalButtonRow}>
          <button
            className={classNames(styles.modalButton, styles.cancelButton)}
            type="button"
            onClick={() => setIsModalOpen(false)}
          >
            {msg.dialogCancel()}
          </button>
          <button
            className={classNames(styles.modalButton, styles.confirmButton)}
            type="button"
            onClick={confirmRestrictedUpload}
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
    setInRestrictedShareMode(true);
    onUploadClick();
  }

  return (
    <>
      {renderUploadModal()}
      {renderUploadButton()}
    </>
  );
}

AnimationUploadButton.propTypes = {
  onUploadClick: PropTypes.func.isRequired,
  shouldRestrictAnimationUpload: PropTypes.bool.isRequired,
  // populated from redux
  setInRestrictedShareMode: PropTypes.func.isRequired
};

export default connect(
  null,
  dispatch => ({
    setInRestrictedShareMode: inRestrictedShareMode =>
      dispatch(setInRestrictedShareMode(inRestrictedShareMode))
  })
)(AnimationUploadButton);
