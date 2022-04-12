import React from 'react';
import color from '../../util/color';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import cookies from 'js-cookie';
import {setMuteMusic} from '@cdo/apps/templates/currentUserRedux';
import UserPreferences from '../../lib/util/UserPreferences';

const MUTE_MUSIC = 'mute_music';

function BackgroundMusicMuteButton({isMinecraft, isBackgroundMusicMuted}) {
  const updateMuteMusic = isBackgroundMusicMuted => {
    var currentMuteValue = isBackgroundMusicMuted;
    new UserPreferences().setMuteMusic(isBackgroundMusicMuted);
    if (isBackgroundMusicMuted !== currentMuteValue) {
      setMuteMusic(isBackgroundMusicMuted);
    }
    // find a way to catch an error if we get one
    // and to re-render this so the button is the new text
  };

  const handleMuteMusicTabClick = () => {
    isBackgroundMusicMuted = !isBackgroundMusicMuted;
    updateMuteMusic(isBackgroundMusicMuted);
    cookies.set(MUTE_MUSIC, 'true', {expires: 30, path: '/'});

    const record = {
      study: 'mute-music',
      event: 'mute-toggle'
    };
    firehoseClient.putRecord(record);
  };

  const displayText = () => {
    console.log(isBackgroundMusicMuted);
    return isBackgroundMusicMuted
      ? i18n.backgroundMusicOn()
      : i18n.backgroundMusicOff();
  };

  return (
    <button
      type="button"
      className="uitest-backgroundMusicTab"
      onClick={handleMuteMusicTabClick}
      style={{...styles, ...(isMinecraft ? craftStyle : {})}}
    >
      {displayText()}
    </button>
  );
}

BackgroundMusicMuteButton.propTypes = {
  isMinecraft: PropTypes.bool.isRequired,

  // from redux
  isBackgroundMusicMuted: PropTypes.bool.isRequired
};

export const styles = {
  backgroundColor: color.table_light_row,
  fontSize: 'small',
  float: 'right'
};

export const craftStyle = {
  color: color.white,
  backgroundColor: '#3b3b3b'
};

export const UnconnectedBackgroundMusicMuteButton = BackgroundMusicMuteButton;

export default connect(
  state => ({
    isBackgroundMusicMuted: state.currentUser.isBackgroundMusicMuted
  }),
  dispatch => ({
    setMuteMusic(isBackgroundMusicMuted) {
      dispatch(setMuteMusic(isBackgroundMusicMuted));
    }
  })
)(BackgroundMusicMuteButton);
