import React, {PropTypes} from 'react';
import GameButtons from '../templates/GameButtons';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import * as gameLabConstants from './constants';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import Radium from "radium";
import {connect} from "react-redux";
import i18n from '@cdo/locale';

const GAME_WIDTH = gameLabConstants.GAME_WIDTH;
const GAME_HEIGHT = gameLabConstants.GAME_HEIGHT;

const styles = {
  selectStyle: {
    width: '100%',
  }
};

const SongSelector = Radium(class extends React.Component {
  static propTypes = {
    setSong: PropTypes.func.isRequired,
    selectedSong: PropTypes.string,
    songData: PropTypes.objectOf(PropTypes.object).isRequired,
    filterOff: PropTypes.bool.isRequired
  };

  changeSong = (event) => {
    const songId = event.target.value;
    this.props.setSong(songId);
  };

  render() {
    return (
      <div>
        <label><b>{i18n.selectSong()}</b></label>
        <select id="song_selector" style={styles.selectStyle} onChange={this.changeSong} value={this.props.selectedSong}>
          {Object.keys(this.props.songData).map((option, i) => (
            <option key={i} value={option}>{this.props.songData[option].title}</option>
          ))}
        </select>
      </div>
    );
  }
});

class DanceVisualizationColumn extends React.Component {
  static propTypes = {
    showFinishButton: PropTypes.bool.isRequired,
    setSong: PropTypes.func.isRequired,
    selectedSong: PropTypes.string,
    isShareView: PropTypes.bool.isRequired,
    songData: PropTypes.objectOf(PropTypes.object).isRequired,
    userType: PropTypes.string.isRequired
  };

  render() {
    const divDanceStyle = {
      touchAction: 'none',
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: '#fff',
      position: 'relative',
      overflow: 'hidden',
    };

    // userType - 'teacher', assumed age > 13. 'student', age > 13.
    //            'student_y', age < 13. 'unknown', signed out users
    const signedInOver13 = this.props.userType === 'teacher' || this.props.userType === 'student';
    const filterOff = signedInOver13 || sessionStorage.getItem('anon_over13');

    return (
      <span>
        {!this.props.isShareView &&
          <SongSelector
            setSong={this.props.setSong}
            selectedSong={this.props.selectedSong}
            songData={this.props.songData}
            filterOff={filterOff}
          />
        }
        <ProtectedVisualizationDiv>
          <div
            id="divDance"
            style={divDanceStyle}
          />
        </ProtectedVisualizationDiv>
        <GameButtons showFinishButton={this.props.showFinishButton}>
          <ArrowButtons />
        </GameButtons>
        <BelowVisualization />
      </span>
    );
  }
}

export default connect(state => ({
  isShareView: state.pageConstants.isShareView,
  songData: state.songs.songData,
  selectedSong: state.songs.selectedSong,
  userType: state.progress.userType
}))(DanceVisualizationColumn);
