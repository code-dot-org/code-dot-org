import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import {PaneButton} from '@cdo/apps/templates/PaneHeader';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import cookies from 'js-cookie';
import {setMuteMusic, SignInState} from '@cdo/apps/templates/currentUserRedux';
import UserPreferences from '../../lib/util/UserPreferences';

const MUTE_MUSIC = 'mute_music';

function BackgroundMusicMuteButton({
  className,
  signedIn,
  isMinecraft,
  isRtl,
  isBackgroundMusicMuted,
  setMuteMusic,
  muteBackgroundMusic,
  unmuteBackgroundMusic
}) {
  const updateMuteMusic = isBackgroundMusicMuted => {
    signedIn ? new UserPreferences().setMuteMusic(isBackgroundMusicMuted) : {};
    setMuteMusic(isBackgroundMusicMuted);
  };

  const handleMuteMusicTabClick = () => {
    isBackgroundMusicMuted = !isBackgroundMusicMuted;
    updateMuteMusic(isBackgroundMusicMuted);

    // Stop or start the music immediately
    isBackgroundMusicMuted ? muteBackgroundMusic() : unmuteBackgroundMusic();

    // Set or remove the cookie
    isBackgroundMusicMuted
      ? cookies.set(MUTE_MUSIC, 'true', {expires: 30, path: '/'})
      : cookies.remove(MUTE_MUSIC, {path: '/'});

    const labType = isMinecraft ? 'Minecraft' : 'Starwars';
    const muteLabel = isBackgroundMusicMuted ? 'mute' : 'unmute';

    const record = {
      study: 'mute-music',
      event: 'mute-toggle',
      data_json: JSON.stringify({
        labType: labType,
        muteLabel: muteLabel
      })
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
      onClick={handleMuteMusicTabClick}
      style={{
        ...(!isMinecraft
          ? isBackgroundMusicMuted
            ? styles.musicOff
            : styles.musicOn
          : {})
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
  isBackgroundMusicMuted: PropTypes.bool.isRequired,
  muteBackgroundMusic: PropTypes.func.isRequired,
  unmuteBackgroundMusic: PropTypes.func.isRequired
};

export const styles = {
  musicOn: {
    color: 'rgb(118, 101, 160)',
    backgroundColor: 'rgb(255, 255, 255)'
  },
  musicOff: {
    color: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(166, 155, 193)'
  }
};

export const UnconnectedBackgroundMusicMuteButton = BackgroundMusicMuteButton;

export default connect(
  state => ({
    isBackgroundMusicMuted: state.currentUser.isBackgroundMusicMuted,
    signedIn: state.currentUser.signInState === SignInState.SignedIn,
    muteBackgroundMusic: state.instructions.muteBackgroundMusic,
    unmuteBackgroundMusic: state.instructions.unmuteBackgroundMusic
  }),
  dispatch => ({
    setMuteMusic(isBackgroundMusicMuted) {
      dispatch(setMuteMusic(isBackgroundMusicMuted));
    }
  })
)(BackgroundMusicMuteButton);
