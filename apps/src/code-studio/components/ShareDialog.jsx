import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import BaseDialog from '@cdo/apps/templates/BaseDialog';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';

import ShareAllowedDialog from './ShareAllowedDialog';
import ShareDisallowedDialog from './ShareDisallowedDialog';

class ShareDialog extends Component {
  static propTypes = {
    signInState: PropTypes.oneOf(Object.values(SignInState)),
    isProjectLevel: PropTypes.bool.isRequired,
    allowSignedOutShare: PropTypes.bool,
    // Only applicable to Dance Party projects, used to Tweet at song artist.
    selectedSong: PropTypes.string,
    shareUrl: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    isAbusive: PropTypes.bool,
    canPrint: PropTypes.bool,
    canPublish: PropTypes.bool,
    isPublished: PropTypes.bool,
    channelId: PropTypes.string,
    appType: PropTypes.string,
    onClickPopup: PropTypes.func,
    hideBackdrop: BaseDialog.propTypes.hideBackdrop,
    canShareSocial: PropTypes.bool,
    userSharingDisabled: PropTypes.bool,
  };

  render() {
    const {signInState, isProjectLevel, allowSignedOutShare, ...otherProps} =
      this.props;
    // If we're on a project level (i.e. /projects/appname), always show signed
    // in version of the dialog

    if (
      signInState === SignInState.SignedIn ||
      isProjectLevel ||
      allowSignedOutShare
    ) {
      return <ShareAllowedDialog {...otherProps} />;
    }

    return <ShareDisallowedDialog />;
  }
}

export const UnconnectedShareDialog = ShareDialog;

export default connect(state => ({
  signInState: state.currentUser.signInState,
}))(ShareDialog);
