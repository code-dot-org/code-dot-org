import React, {PropTypes} from 'react';
import GameButtons from '../templates/GameButtons';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import * as gameLabConstants from './constants';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
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


export default class DanceVisualizationColumn extends React.Component {
  static propTypes = {
    showFinishButton: PropTypes.bool.isRequired,
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
    return (
      <span>
        <SongSelector/>
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
