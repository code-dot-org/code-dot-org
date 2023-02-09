import React, {useState} from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import project from '@cdo/apps/code-studio/initApp/project';
import BaseDialog from '../../templates/BaseDialog.jsx';

export default function AnimationUploadButton({
  onUploadClick,
  shouldRestrictAnimationUpload
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
        <div>{msg.animationPicker_restrictedUploadWarning()}</div>
        <button type="button" onClick={() => setIsModalOpen(false)}>
          {msg.dialogCancel()}
        </button>
        <button type="button" onClick={confirmRestrictedUpload}>
          {msg.dialogOK()}
        </button>
      </BaseDialog>
    );
  }

  function confirmRestrictedUpload() {
    project.setInRestrictedShareMode(true);
    setIsModalOpen(false);
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
  shouldRestrictAnimationUpload: PropTypes.bool.isRequired
};
