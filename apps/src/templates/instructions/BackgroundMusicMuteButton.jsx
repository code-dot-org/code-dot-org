import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import {setMuteMusic, SignInState} from '@cdo/apps/templates/currentUserRedux';
import {PaneButton} from '@cdo/apps/templates/PaneHeader';
import i18n from '@cdo/locale';

import UserPreferences from '../../lib/util/UserPreferences';
import {
  muteCookieValue,
  setMuteCookie,
  removeMuteCookie,
} from '../../util/muteCookieHelpers';

function BackgroundMusicMuteButton({
  className,
  signedIn,
  isMinecraft,
  isRtl,
  currentUserBackgroundMusicMuted,
  setMuteMusic,
  muteBackgroundMusic,
  unmuteBackgroundMusic,
}) {
  const initialMuteState = signedIn
    ? currentUserBackgroundMusicMuted
    : muteCookieValue();

  const [isBackgroundMusicMuted, setIsBackgroundMusicMuted] =
    useState(initialMuteState);
  const [isSavingMutePreference, setIsSavingMutePreference] = useState(false);

  const updateMuteMusic = updatedMuteValue => {
    if (signedIn) {
      setIsSavingMutePreference(true);
      new UserPreferences()
        .setMuteMusic(updatedMuteValue)
        .always(() => setIsSavingMutePreference(false));
    }
    setMuteMusic(updatedMuteValue);
  };

  const handleMuteMusicTabClick = () => {
    const updatedMuteValue = !isBackgroundMusicMuted;

    updateMuteMusic(updatedMuteValue);
    setIsBackgroundMusicMuted(updatedMuteValue);

    /*
    Depending on the updated value:
      Stop or start the background music immediately
      Set or remove the mute cookie
    */
    if (updatedMuteValue) {
      muteBackgroundMusic();
      setMuteCookie();
    } else {
      unmuteBackgroundMusic();
      removeMuteCookie();
    }
  };

  return (
    <PaneButton
      id={className}
      headerHasFocus={true}
      iconProps={
        isBackgroundMusicMuted
          ? {iconName: 'volume-xmark', iconStyle: 'solid'}
          : {iconName: 'music', iconStyle: 'solid'}
      }
      label={
        isBackgroundMusicMuted
          ? i18n.backgroundMusicOff()
          : i18n.backgroundMusicOn()
      }
      isRtl={isRtl}
      isMinecraft={isMinecraft}
      isDisabled={isSavingMutePreference}
      onClick={isSavingMutePreference ? () => {} : handleMuteMusicTabClick}
    />
  );
}

BackgroundMusicMuteButton.propTypes = {
  className: PropTypes.string.isRequired,
  signedIn: PropTypes.bool.isRequired,
  isMinecraft: PropTypes.bool.isRequired,
  isRtl: PropTypes.bool.isRequired,

  // from redux
  setMuteMusic: PropTypes.func.isRequired,
  currentUserBackgroundMusicMuted: PropTypes.bool.isRequired,
  muteBackgroundMusic: PropTypes.func.isRequired,
  unmuteBackgroundMusic: PropTypes.func.isRequired,
};

export const UnconnectedBackgroundMusicMuteButton = BackgroundMusicMuteButton;

export default connect(
  state => ({
    currentUserBackgroundMusicMuted: state.currentUser.isBackgroundMusicMuted,
    signedIn: state.currentUser.signInState === SignInState.SignedIn,
    muteBackgroundMusic: state.instructions.muteBackgroundMusic,
    unmuteBackgroundMusic: state.instructions.unmuteBackgroundMusic,
  }),
  dispatch => ({
    setMuteMusic(isBackgroundMusicMuted) {
      dispatch(setMuteMusic(isBackgroundMusicMuted));
    },
  })
)(BackgroundMusicMuteButton);
