import React from 'react';
import color from '../../util/color';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';

function BackgroundMusicMuteButton({isMinecraft, handleMuteMusicTabClick}) {
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
  handleMuteMusicTabClick: PropTypes.func.isRequired,

  // from redux
  BackgroundMusicIsMuted: PropTypes.bool.isRequired
};

export const styles = {
  backgroundColor: color.table_light_row
};

export const craftStyle = {
  color: color.white,
  backgroundColor: '#3b3b3b'
};

export const UnconnectedBackgroundMusicMuteButton = BackgroundMusicMuteButton;
export default connect((state, ownProps) => ({
  BackgroundMusicIsMuted: state.BackgroundMusicIsMuted
}))(BackgroundMusicMuteButton);
