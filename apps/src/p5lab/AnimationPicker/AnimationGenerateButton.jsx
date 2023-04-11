import React, {useState} from 'react';
import PropTypes from 'prop-types';
import msg from '@cdo/locale';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import project from '@cdo/apps/code-studio/initApp/project';
// import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
// import classNames from 'classnames';
// import styles from './animation-upload-button.module.scss';
import {connect} from 'react-redux';
// import {
//   refreshInRestrictedShareMode,
//   refreshTeacherHasConfirmedUploadWarning
// } from '@cdo/apps/code-studio/projectRedux.js';
// import {
//   exitedUploadWarning,
//   showingUploadWarning
// } from '../redux/animationPicker.js';

/**
 * Render the animation gemerate button. If the project should warn on upload
 * (which occurs for Sprite Lab projects), and the project has not already seen
 * the warning (see details on warnings by user type below), we show a warning modal
 * before allowing uploads. For students, if the project should restrict uploads and is already
 * published, we will not allow uploads until the project is un-published.
 */
export const UnconnectedAnimationGenerateButton = props => {
  console.log('got here!');
  console.log(props);
  return (
    <AnimationPickerListItem
      label={msg.animationPicker_generateImage()}
      icon="upload"
      onClick={
        props.onGenerateClick
        // showRestrictedUploadWarning
        //   ? project.isPublished() && !isTeacher
        //     ? showPublishedWarning
        //     : showUploadModal
        //   : onUploadClick
      }
      isBackgroundsTab={props.isBackgroundsTab}
    />
  );
};

UnconnectedAnimationGenerateButton.propTypes = {
  onGenerateClick: PropTypes.func.isRequired
};

export default UnconnectedAnimationGenerateButton;

// export default connect(
//   state => ({
//     inRestrictedShareMode: state.project.inRestrictedShareMode,
//     teacherHasConfirmedUploadWarning:
//       state.project.teacherHasConfirmedUploadWarning,
//     currentUserType: state.currentUser?.userType
//   }),
//   dispatch => ({
//     refreshInRestrictedShareMode: inRestrictedShareMode =>
//       dispatch(refreshInRestrictedShareMode(inRestrictedShareMode)),
//     refreshTeacherHasConfirmedUploadWarning: () =>
//       dispatch(refreshTeacherHasConfirmedUploadWarning()),
//     showingUploadWarning: () => dispatch(showingUploadWarning()),
//     exitedUploadWarning: () => dispatch(exitedUploadWarning())
//   })
// )(UnconnectedAnimationGenerateButton);
