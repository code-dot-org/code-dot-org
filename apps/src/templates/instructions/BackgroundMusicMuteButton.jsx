import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';

import firehoseClient from '@cdo/apps/lib/util/firehose';
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
      Determine the firehose label
    */
    var muteLabel;
    if (updatedMuteValue) {
      muteBackgroundMusic();
      setMuteCookie();
      muteLabel = 'mute';
    } else {
      unmuteBackgroundMusic();
      removeMuteCookie();
      muteLabel = 'unmute';
    }

    const labType = isMinecraft ? 'Minecraft' : 'Starwars';

    const record = {
      study: 'mute-music',
      event: 'mute-toggle',
      data_json: JSON.stringify({
        labType: labType,
        muteLabel: muteLabel,
      }),
    };
    firehoseClient.putRecord(record);
  };

  return (
    <PaneButton
      id={className}
      headerHasFocus={true}
      iconClass={isBackgroundMusicMuted ? 'fa fa-volume-off' : 'fa fa-music'}
      label={
        isBackgroundMusicMuted
          ? i18n.backgroundMusicOff()
          : i18n.backgroundMusicOn()
      }
      isRtl={isRtl}
      isMinecraft={isMinecraft}
      isDisabled={isSavingMutePreference}
      onClick={isSavingMutePreference ? () => {} : handleMuteMusicTabClick}
      style={{
        ...styles.button,
        ...(!isMinecraft
          ? isBackgroundMusicMuted
            ? styles.musicOff
            : styles.musicOn
          : {}),
      }}
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

export const styles = {
  button: {
    whiteSpace: 'nowrap',
    minWidth: 'fit-content',
  },
  musicOn: {
    color: 'rgb(118, 101, 160)',
    backgroundColor: 'rgb(255, 255, 255)',
  },
  musicOff: {
    color: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(166, 155, 193)',
  },
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
