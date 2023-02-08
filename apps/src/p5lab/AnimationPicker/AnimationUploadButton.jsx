import React from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';

export default function AnimationUploadButton({
  onUploadClick,
  shouldRestrictAnimationUpload
}) {
  function renderEnableUploadButton() {
    return (
      <AnimationPickerListItem
        label={msg.animationPicker_uploadImage()}
        icon="toggle-on"
        onClick={() => {}}
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

  return renderUploadButton();
}

AnimationUploadButton.propTypes = {
  onUploadClick: PropTypes.func.isRequired,
  shouldRestrictAnimationUpload: PropTypes.bool.isRequired
};
