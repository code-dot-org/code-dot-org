import cookies from 'js-cookie';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {getFilterStatus} from '@cdo/apps/dance/songs';
import SongSelector from '@cdo/apps/dance/SongSelector';
import DCDO from '@cdo/apps/dcdo';

import AgeDialog from '../templates/AgeDialog';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import GameButtons from '../templates/GameButtons';
import HourOfCodeGuideEmailDialog from '../templates/HourOfCodeGuideEmailDialog';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';

import DanceAiModal from './ai/DanceAiModal';
import {MAX_GAME_WIDTH, GAME_HEIGHT} from './constants';
import danceMsg from './locale';

const isHocEmailTimeOfYear = ['soon-hoc', 'actual-hoc'].includes(
  DCDO.get('hoc_mode', false)
);

class DanceVisualizationColumn extends React.Component {
  static propTypes = {
    showFinishButton: PropTypes.bool.isRequired,
    setSong: PropTypes.func.isRequired,
    selectedSong: PropTypes.string,
    levelIsRunning: PropTypes.bool,
    levelRunIsStarting: PropTypes.bool,
    isShareView: PropTypes.bool.isRequired,
    unitId: PropTypes.number,
    songData: PropTypes.objectOf(PropTypes.object).isRequired,
    userType: PropTypes.string.isRequired,
    under13: PropTypes.bool.isRequired,
    over21: PropTypes.bool.isRequired,
    currentAiModalBlockId: PropTypes.string,
    resetProgram: PropTypes.func.isRequired,
    playSound: PropTypes.func.isRequired,
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
    if (!prevProps.currentAiModalBlockId && this.props.currentAiModalBlockId) {
      this.props.resetProgram();
    }
  }

  render() {
    const {levelIsRunning, playSound} = this.props;
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
          isHocEmailTimeOfYear &&
          cookies.get('HourOfCodeGuideEmailDialogSeen') !== 'true' && (
            <HourOfCodeGuideEmailDialog
              isSignedIn={isSignedIn}
              unitId={this.props.unitId}
            />
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
                  alt={danceMsg.dancePartyLoading()}
                />
              </div>
              {this.props.isShareView && (
                <img
                  src={imgSrc}
                  id="danceClickToRun"
                  alt={danceMsg.clickToRunDanceParty()}
                />
              )}
            </div>
          </ProtectedVisualizationDiv>
          <GameButtons showFinishButton={this.props.showFinishButton}>
            <ArrowButtons />
          </GameButtons>
          <BelowVisualization />
          {this.props.currentAiModalBlockId && (
            <DanceAiModal playSound={playSound} />
          )}
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
  unitId: state.pageConstants.serverScriptId,
  songData: state.dance.songData,
  selectedSong: state.dance.selectedSong,
  userType: state.currentUser.userType,
  under13: state.currentUser.under13,
  over21: state.currentUser.over21,
  levelIsRunning: state.runState.isRunning,
  levelRunIsStarting: state.dance.runIsStarting,
  currentAiModalBlockId: state.dance.currentAiModalBlockId,
}))(DanceVisualizationColumn);
