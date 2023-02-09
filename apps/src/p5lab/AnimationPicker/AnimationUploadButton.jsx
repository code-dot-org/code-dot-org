import React, {useState}  from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import project from '@cdo/apps/code-studio/initApp/project';

export default function AnimationUploadButton({
  onUploadClick,
  shouldRestrictAnimationUpload
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  //project.enableRestrictedUpload()
  function renderEnableUploadButton() {
    return (
      <AnimationPickerListItem
        label={msg.animationPicker_uploadImage()}
        icon="toggle-on"
        onClick={showEnableUploadModal}
      />
    );
  }

  function renderUploadButton() {
    return (
      <AnimationPickerListItem
        label={msg.animationPicker_uploadImage()}
        icon="upload"
        onClick={onUploadClick}
      />
    );
  }

  function showEnableUploadModal() {
    // use BaseDialog
  }

  return renderUploadButton();
}

AnimationUploadButton.propTypes = {
  onUploadClick: PropTypes.func.isRequired,
  shouldRestrictAnimationUpload: PropTypes.bool.isRequired
};
