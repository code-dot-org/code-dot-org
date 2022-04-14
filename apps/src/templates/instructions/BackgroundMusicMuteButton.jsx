import React from 'react';
import color from '../../util/color';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import {getStore} from '../../redux';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import cookies from 'js-cookie';
import {setMuteMusic} from '@cdo/apps/templates/currentUserRedux';
import UserPreferences from '../../lib/util/UserPreferences';

const MUTE_MUSIC = 'mute_music';

function BackgroundMusicMuteButton({isMinecraft, isBackgroundMusicMuted}) {
  const updateMuteMusic = isBackgroundMusicMuted => {
    new UserPreferences().setMuteMusic(isBackgroundMusicMuted);
    getStore().dispatch(setMuteMusic(isBackgroundMusicMuted));

    // find a way to catch an error if we get one
    // and to re-render this so the button is the new text
  };

  const handleMuteMusicTabClick = () => {
    isBackgroundMusicMuted = !isBackgroundMusicMuted;
    updateMuteMusic(isBackgroundMusicMuted);
    cookies.set(MUTE_MUSIC, 'true', {expires: 30, path: '/'});

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
    isBackgroundMusicMuted: state.currentUser.isBackgroundMusicMuted
  }),
  dispatch => ({
    setMuteMusic(isBackgroundMusicMuted) {
      dispatch(setMuteMusic(isBackgroundMusicMuted));
    }
  })
)(BackgroundMusicMuteButton);
