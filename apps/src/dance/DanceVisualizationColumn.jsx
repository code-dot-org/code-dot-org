import React from 'react';
import GameButtons from '../templates/GameButtons';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import * as gameLabConstants from './constants';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import AgeDialog, {signedOutOver13} from '../templates/AgeDialog';

const GAME_WIDTH = gameLabConstants.GAME_WIDTH;
const GAME_HEIGHT = gameLabConstants.GAME_HEIGHT;

const SongSelector = Radium(
  class extends React.Component {
    static propTypes = {
      enableSongSelection: PropTypes.bool,
      setSong: PropTypes.func.isRequired,
      selectedSong: PropTypes.string,
      songData: PropTypes.objectOf(PropTypes.object).isRequired,
      filterOff: PropTypes.bool.isRequired
    };

    changeSong = event => {
      const songId = event.target.value;
      this.props.setSong(songId);
    };

    render() {
      return (
        <div id="song-selector-wrapper">
          <label>
            <b>{i18n.selectSong()}</b>
          </label>
          <select
            id="song_selector"
            style={styles.selectStyle}
            onChange={this.changeSong}
            value={this.props.selectedSong}
            disabled={!this.props.enableSongSelection}
          >
            {Object.keys(this.props.songData).map(
              (option, i) =>
                (this.props.filterOff || !this.props.songData[option].pg13) && (
                  <option key={i} value={option}>
                    {this.props.songData[option].title}
                  </option>
                )
            )}
          </select>
        </div>
      );
    }
  }
);

class DanceVisualizationColumn extends React.Component {
  static propTypes = {
    showFinishButton: PropTypes.bool.isRequired,
    setSong: PropTypes.func.isRequired,
    selectedSong: PropTypes.string,
    levelIsRunning: PropTypes.bool,
    levelRunIsStarting: PropTypes.bool,
    isShareView: PropTypes.bool.isRequired,
    songData: PropTypes.objectOf(PropTypes.object).isRequired,
    userType: PropTypes.string.isRequired
  };

  state = {
    filterOff: this.setFilterStatus()
  };

  /*
    Turn the song filter off
  */
  turnFilterOff = () => {
    this.setState({filterOff: true});
  };

  /*
    The filter defaults to on. If the user is over 13 (identified via account or anon dialog), filter turns off
   */
  setFilterStatus() {
    // userType - 'teacher', assumed age > 13. 'student', age > 13.
    //            'student_y', age < 13. 'unknown', signed out users
    const signedInOver13 =
      this.props.userType === 'teacher' || this.props.userType === 'student';
    const signedOutAge = signedOutOver13();
    return signedInOver13 || signedOutAge;
  }

  render() {
    const divDanceStyle = {
      touchAction: 'none',
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      background: '#fff',
      position: 'relative',
      overflow: 'hidden'
    };

    const p5LoadingStyle = {
      width: 400,
      height: 400,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center'
    };

    const p5LoadingGifStyle = {
      width: 100,
      height: 100
    };

    const filenameToImgUrl = {
      'click-to-run': require('@cdo/static/dance/click-to-run.png')
    };

    const imgSrc = filenameToImgUrl['click-to-run'];

    const enableSongSelection =
      !this.props.levelIsRunning && !this.props.levelRunIsStarting;

    return (
      <div>
        {!this.props.isShareView && (
          <AgeDialog turnOffFilter={this.turnFilterOff} />
        )}
        <span>
          {!this.props.isShareView && (
            <SongSelector
              enableSongSelection={enableSongSelection}
              setSong={this.props.setSong}
              selectedSong={this.props.selectedSong}
              songData={this.props.songData}
              filterOff={this.state.filterOff}
            />
          )}
          <ProtectedVisualizationDiv>
            <div id="divDance" style={divDanceStyle}>
              <div id="divDanceLoading" style={p5LoadingStyle}>
                <img
                  src="//curriculum.code.org/images/DancePartyLoading.gif"
                  style={p5LoadingGifStyle}
                />
              </div>
              {this.props.isShareView && (
                <img src={imgSrc} id="danceClickToRun" />
              )}
            </div>
          </ProtectedVisualizationDiv>
          <GameButtons showFinishButton={this.props.showFinishButton}>
            <ArrowButtons />
          </GameButtons>
          <BelowVisualization />
        </span>
      </div>
    );
  }
}

const styles = {
  selectStyle: {
    width: '100%'
  }
};

export default connect(state => ({
  isShareView: state.pageConstants.isShareView,
  songData: state.songs.songData,
  selectedSong: state.songs.selectedSong,
  userType: state.currentUser.userType,
  levelIsRunning: state.runState.isRunning,
  levelRunIsStarting: state.songs.runIsStarting
}))(DanceVisualizationColumn);
