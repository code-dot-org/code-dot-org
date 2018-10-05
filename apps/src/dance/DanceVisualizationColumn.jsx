import React, {PropTypes} from 'react';
import GameButtons from '../templates/GameButtons';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import * as gameLabConstants from './constants';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import songLibrary from "../code-studio/songLibrary.json";
import Radium from "radium";
import {connect} from "react-redux";
import i18n from '@cdo/locale';
import * as danceRedux from "../dance/redux";

const GAME_WIDTH = gameLabConstants.GAME_WIDTH;
const GAME_HEIGHT = gameLabConstants.GAME_HEIGHT;

const styles = {
  selectStyle: {
    width: GAME_WIDTH,
  }
};

const SongSelector = Radium(class extends React.Component {
  static propTypes = {
    setSong: PropTypes.func.isRequired,
    selectedSong: PropTypes.string.isRequired
  };

  changeSong = (event) => {
    this.props.setSong(event.target.value);
  };

  render() {
    return (
      <div>
        <label><b>{i18n.selectSong()}</b></label>
        <select id="song_selector" style={styles.selectStyle} onChange={this.changeSong} value={this.props.selectedSong}>
          {Object.keys(songLibrary).map((option, i) => (
            <option key={i} value={option}>{songLibrary[option].title}</option>
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
    selectedSong: PropTypes.string.isRequired,
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
        <SongSelector setSong={this.props.setSong} selectedSong={this.props.selectedSong}/>
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
  selectedSong: state.selectedSong,
}), dispatch => ({
  setSong: song => dispatch(danceRedux.setSong(song))
}))(DanceVisualizationColumn);
