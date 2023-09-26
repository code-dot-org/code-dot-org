import React from 'react';
import GameButtons from '../templates/GameButtons';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import {MAX_GAME_WIDTH, GAME_HEIGHT} from './constants';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import AgeDialog from '../templates/AgeDialog';
import {getFilterStatus} from '@cdo/apps/dance/songs';
import SongSelector from './SongSelector';

class DanceVisualizationColumn extends React.Component {
  static propTypes = {
    showFinishButton: PropTypes.bool.isRequired,
    setSong: PropTypes.func.isRequired,
    selectedSong: PropTypes.string,
    levelIsRunning: PropTypes.bool,
    levelRunIsStarting: PropTypes.bool,
    isShareView: PropTypes.bool.isRequired,
    songData: PropTypes.objectOf(PropTypes.object).isRequired,
    userType: PropTypes.string.isRequired,
    under13: PropTypes.bool.isRequired,
  };

  state = {
    filterOn: getFilterStatus(this.props.userType, this.props.under13),
  };

  /*
    Turn the song filter off
  */
  turnFilterOff = () => {
    this.setState({filterOn: false});
  };

  render() {
    const filenameToImgUrl = {
      'click-to-run': require('@cdo/static/dance/click-to-run.png'),
    };

    const imgSrc = filenameToImgUrl['click-to-run'];

    const enableSongSelection =
      !this.props.levelIsRunning && !this.props.levelRunIsStarting;

    return (
      <div>
        {!this.props.isShareView && (
          <AgeDialog turnOffFilter={this.turnFilterOff} />
        )}
        <div style={{maxWidth: MAX_GAME_WIDTH}}>
          {!this.props.isShareView && (
            <SongSelector
              enableSongSelection={enableSongSelection}
              setSong={this.props.setSong}
              selectedSong={this.props.selectedSong}
              songData={this.props.songData}
              filterOn={this.state.filterOn}
            />
          )}
          <ProtectedVisualizationDiv>
            <div
              id="divDance"
              style={{...styles.visualization, ...styles.container}}
            >
              <div
                id="divDanceLoading"
                style={{...styles.visualization, ...styles.loadingContainer}}
              >
                <img
                  src="//curriculum.code.org/images/DancePartyLoading.gif"
                  style={styles.loadingGif}
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
        </div>
      </div>
    );
  }
}

const styles = {
  visualization: {
    width: MAX_GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  container: {
    touchAction: 'none',
    background: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  loadingContainer: {
    // The value of display is controlled by StudioApp.
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingGif: {
    width: 100,
    height: 100,
  },
  selectStyle: {
    width: '100%',
  },
};

export default connect(state => ({
  isShareView: state.pageConstants.isShareView,
  songData: state.dance.songData,
  selectedSong: state.dance.selectedSong,
  userType: state.currentUser.userType,
  under13: state.currentUser.under13,
  levelIsRunning: state.runState.isRunning,
  levelRunIsStarting: state.dance.runIsStarting,
}))(DanceVisualizationColumn);
