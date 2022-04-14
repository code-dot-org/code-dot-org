import React from 'react';
import color from '../../util/color';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import cookies from 'js-cookie';
import {setMuteMusic} from '@cdo/apps/templates/currentUserRedux';
import UserPreferences from '../../lib/util/UserPreferences';

const MUTE_MUSIC = 'mute_music';

function BackgroundMusicMuteButton({
  isMinecraft,
  isBackgroundMusicMuted,
  setMuteMusic,
  muteBackgroundMusic,
  unmuteBackgroundMusic
}) {
  const updateMuteMusic = isBackgroundMusicMuted => {
    new UserPreferences().setMuteMusic(isBackgroundMusicMuted);
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

  const displayText = () => {
    return isBackgroundMusicMuted
      ? i18n.backgroundMusicOff()
      : i18n.backgroundMusicOn();
  };

  const displayIcon = () => {
    return isBackgroundMusicMuted ? 'music-slash' : 'music';
  };

  return (
    <button
      type="button"
      className="uitest-backgroundMusicTab"
      onClick={handleMuteMusicTabClick}
      style={{...styles, ...(isMinecraft ? craftStyle : {})}}
    >
      {<FontAwesome icon={displayIcon()} />}
      {displayText()}
    </button>
  );
}

BackgroundMusicMuteButton.propTypes = {
  isMinecraft: PropTypes.bool.isRequired,

  // from redux
  setMuteMusic: PropTypes.func.isRequired,
  isBackgroundMusicMuted: PropTypes.bool.isRequired,
  muteBackgroundMusic: PropTypes.func.isRequired,
  unmuteBackgroundMusic: PropTypes.func.isRequired
};

export const styles = {
  backgroundColor: color.table_light_row,
  color: 'rgb(118, 101, 160)',
  fontSize: 'small',
  fontWeight: 'bolder',
  float: 'right',
  padding: '2px 4px 2px 4px',
  margin: '2px'
};

export const craftStyle = {
  backgroundColor: '#F2F2F2'
};

export const UnconnectedBackgroundMusicMuteButton = BackgroundMusicMuteButton;

export default connect(
  state => ({
    isBackgroundMusicMuted: state.currentUser.isBackgroundMusicMuted,
    muteBackgroundMusic: state.instructions.muteBackgroundMusic,
    unmuteBackgroundMusic: state.instructions.unmuteBackgroundMusic
  }),
  dispatch => ({
    setMuteMusic(isBackgroundMusicMuted) {
      dispatch(setMuteMusic(isBackgroundMusicMuted));
    }
  })
)(BackgroundMusicMuteButton);
