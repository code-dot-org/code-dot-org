import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import GameButtons from '../templates/GameButtons';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import * as gameLabConstants from './constants';
import CompletionButton from '../templates/CompletionButton';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import experiments from "@cdo/apps/util/experiments";
import songLibrary from "../code-studio/songLibrary.json";
import gamelabMsg from '@cdo/gamelab/locale';

const GAME_WIDTH = gameLabConstants.GAME_WIDTH;
const GAME_HEIGHT = gameLabConstants.GAME_HEIGHT;

const styles = {
  selectStyle: {
    width: GAME_WIDTH,
  }
};

const SongSelector = class extends React.Component {
  render() {
    return (
      <div id="song_selector">
        <label><b>{gamelabMsg.selectSong()}</b></label>
        <select style={styles.selectStyle}>
          {Object.keys(songLibrary).map((option, i) => (
            <option key={i}>{songLibrary[option].title}</option>
          ))}
        </select>
      </div>
    );
  }
};


class GameLabVisualizationColumn extends React.Component {
  static propTypes = {
    finishButton: PropTypes.bool.isRequired,
    isResponsive: PropTypes.bool.isRequired,
    isShareView: PropTypes.bool.isRequired,
  };

  render() {
    const divGameLabStyle = {
      touchAction: 'none',
      width: GAME_WIDTH,
      height: GAME_HEIGHT
    };
    return (
      <span>
        {experiments.isEnabled("songSelector") &&
          <SongSelector/>
        }
        <ProtectedVisualizationDiv>
          <div
            id="divGameLab"
            style={divGameLabStyle}
          />
        </ProtectedVisualizationDiv>
        <GameButtons>
          <ArrowButtons />
          <CompletionButton />
        </GameButtons>
        <BelowVisualization />
      </span>
    );
  }
}

export default connect(state => ({
  isResponsive: state.pageConstants.isResponsive,
  isShareView: state.pageConstants.isShareView,
}))(GameLabVisualizationColumn);
