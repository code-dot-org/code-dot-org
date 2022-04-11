import React from 'react';
import color from '../../util/color';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import cookies from 'js-cookie';
import {setMuteMusic} from '@cdo/apps/templates/currentUserRedux';
import UserPreferences from '../lib/util/UserPreferences';

const MUTE_MUSIC = 'mute_music';

function BackgroundMusicMuteButton({isMinecraft}) {
  const updateMuteMusic = isBackgroundMusicMuted => {
    new UserPreferences()
      .setMuteMusic(isBackgroundMusicMuted)
      .then(isBackgroundMusicMuted => {
        this.setMuteMusic(isBackgroundMusicMuted);
      })
      .catch(result => {
        // do some sort of something so we know it didn't work
      });
  };

  const handleMuteMusicTabClick = () => {
    this.isBackgroundMusicMuted = !this.isBackgroundMusicMuted;
    updateMuteMusic(this.isBackgroundMusicMuted);
    cookies.set(MUTE_MUSIC, 'true', {expires: 30, path: '/'});

    const record = {
      study: 'mute-music',
      event: 'mute-toggle'
    };
    firehoseClient.putRecord(record);
  };

  return (
    <button
      type="button"
      className="uitest-backgroundMusicTab"
      onClick={handleMuteMusicTabClick}
      style={[styles, isMinecraft && craftStyle]}
    >
      isBackgroundMusicMuted ? {i18n.backgroundMusicOn()} :
      {i18n.backgroundMusicOff()}
    </button>
  );
}

BackgroundMusicMuteButton.propTypes = {
  isMinecraft: PropTypes.bool.isRequired,

  // from redux
  isBackgroundMusicMuted: PropTypes.bool.isRequired
};

export const styles = {
  backgroundColor: color.table_light_row
};

export const craftStyle = {
  color: color.white,
  backgroundColor: '#3b3b3b'
};

export const UnconnectedBackgroundMusicMuteButton = BackgroundMusicMuteButton;

export default connect(
  state => ({
    isBackgroundMusicMuted: state.isBackgroundMusicMuted
  }),
  dispatch => ({
    setMuteMusic(isMuted) {
      dispatch(setMuteMusic(isMuted));
    }
  })
)(BackgroundMusicMuteButton);
