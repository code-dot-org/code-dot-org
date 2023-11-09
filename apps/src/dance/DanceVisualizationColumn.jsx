import React from 'react';
import cookies from 'js-cookie';
import GameButtons from '../templates/GameButtons';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import {MAX_GAME_WIDTH, GAME_HEIGHT} from './constants';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import AgeDialog from '../templates/AgeDialog';
import HourOfCodeGuideEmailDialog from '../templates/HourOfCodeGuideEmailDialog';
import {getFilterStatus} from '@cdo/apps/dance/songs';
import DanceAiModal from './ai/DanceAiModal';
import SongSelector from '@cdo/apps/dance/SongSelector';

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
    over21: PropTypes.bool.isRequired,
    currentAiModalField: PropTypes.object,
    resetProgram: PropTypes.func.isRequired,
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

  componentDidUpdate(prevProps) {
    // Reset the program when the AI modal is opened
    if (
      prevProps.currentAiModalField === undefined &&
      this.props.currentAiModalField
    ) {
      this.props.resetProgram();
    }
  }

  render() {
    const {levelIsRunning} = this.props;
    const filenameToImgUrl = {
      'click-to-run': require('@cdo/static/dance/click-to-run.png'),
    };

    const imgSrc = filenameToImgUrl['click-to-run'];

    const enableSongSelection =
      !this.props.levelIsRunning && !this.props.levelRunIsStarting;

    const isSignedIn =
      this.props.userType === 'teacher' || this.props.userType === 'student';

    return (
      <div>
        {!this.props.isShareView && (
          <AgeDialog turnOffFilter={this.turnFilterOff} />
        )}
        {(this.props.over21 || this.props.userType === 'teacher') &&
          cookies.get('HourOfCodeGuideEmailDialogSeen') !== 'true' && (
            <HourOfCodeGuideEmailDialog isSignedIn={isSignedIn} />
          )}
        <div style={{maxWidth: MAX_GAME_WIDTH}}>
          {!this.props.isShareView && (
            <SongSelector
              enableSongSelection={enableSongSelection}
              levelIsRunning={levelIsRunning}
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
          {this.props.currentAiModalField && <DanceAiModal />}
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
};

export default connect(state => ({
  isShareView: state.pageConstants.isShareView,
  songData: state.dance.songData,
  selectedSong: state.dance.selectedSong,
  userType: state.currentUser.userType,
  under13: state.currentUser.under13,
  over21: state.currentUser.over21,
  levelIsRunning: state.runState.isRunning,
  levelRunIsStarting: state.dance.runIsStarting,
  currentAiModalField: state.dance.currentAiModalField,
}))(DanceVisualizationColumn);
