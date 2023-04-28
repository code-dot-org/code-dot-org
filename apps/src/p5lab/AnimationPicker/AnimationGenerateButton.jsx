import React, {useState} from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';

/**
 * TODO: Think about how we should handle the scenario below.
 * Render the animation gemerate button. If the project should warn on upload
 * (which occurs for Sprite Lab projects), and the project has not already seen
 * the warning (see details on warnings by user type below), we show a warning modal
 * before allowing uploads. For students, if the project should restrict uploads and is already
 * published, we will not allow uploads until the project is un-published.
 */
export const UnconnectedAnimationGenerateButton = props => {
  return (
    <AnimationPickerListItem
      label={msg.animationPicker_generateImage()}
      icon="upload"
      onClick={props.onGenerateClick}
      isBackgroundsTab={props.isBackgroundsTab}
    />
  );
};

UnconnectedAnimationGenerateButton.propTypes = {
  onGenerateClick: PropTypes.func.isRequired
};

export default UnconnectedAnimationGenerateButton;

// TODO: Connect to values related to inRestrictedShareMode, currentUserType, etc.
