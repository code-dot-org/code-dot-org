import React, {PropTypes} from 'react';
import GameButtons from '../templates/GameButtons';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import * as gameLabConstants from './constants';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import Radium from "radium";
import {connect} from "react-redux";
import i18n from '@cdo/locale';
import * as danceRedux from "../dance/redux";
import Sounds from "../Sounds";
import project from "../code-studio/initApp/project";

const GAME_WIDTH = gameLabConstants.GAME_WIDTH;
const GAME_HEIGHT = gameLabConstants.GAME_HEIGHT;

const styles = {
  selectStyle: {
    width: '100%',
  }
};

const SongSelector = Radium(class extends React.Component {
  static propTypes = {
    retrieveMetadata: PropTypes.func.isRequired,
    setSong: PropTypes.func.isRequired,
    selectedSong: PropTypes.string.isRequired,
    isProjectLevel: PropTypes.bool.isRequired
  };

  state = {
    songsData: []
  };

  changeSong = (event) => {
    const song = event.target.value;
    this.props.setSong(song);
    this.loadSong(song);
  };

  loadSong(song) {
    //Load song
    let options = {id: song};
    options['mp3'] = `https://curriculum.code.org/media/uploads/${this.state.songsData[options.id].url}.mp3`;
    Sounds.getSingleton().register(options);

    this.props.retrieveMetadata(song);

    if (this.props.isProjectLevel) {
      //Save song to project
      project.saveSelectedSong(song);
    }
  }

  componentDidMount() {
    fetch(`/api/v1/sound-library/hoc_song_meta/songManifest.json`)
      .then(response => response.json())
      .then(data => this.parseSongOptions(data));
  }

  parseSongOptions(data) {
    let songs = {};
    if (data) {
      data.songs.forEach((song) => {
          songs[song.id] = {title: song.text, url: song.url};
      });
    }
    this.setState({songsData: songs}, () => {
      this.loadSong(this.props.selectedSong);
    });
  }

  render() {
    return (
      <div>
        <label><b>{i18n.selectSong()}</b></label>
        <select id="song_selector" style={styles.selectStyle} onChange={this.changeSong} value={this.props.selectedSong}>
          {Object.keys(this.state.songsData).map((option, i) => (
            <option key={i} value={option}>{this.state.songsData[option].title}</option>
          ))}
        </select>
      </div>
    );
  }
});

class DanceVisualizationColumn extends React.Component {
  static propTypes = {
    showFinishButton: PropTypes.bool.isRequired,
    retrieveMetadata: PropTypes.func.isRequired,
    setSong: PropTypes.func.isRequired,
    selectedSong: PropTypes.string.isRequired,
    isShareView: PropTypes.bool.isRequired,
    isProjectLevel: PropTypes.bool.isRequired
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
        {!this.props.isShareView &&
          <SongSelector
            retrieveMetadata={this.props.retrieveMetadata}
            setSong={this.props.setSong}
            selectedSong={this.props.selectedSong}
            isProjectLevel={this.props.isProjectLevel}
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
  isProjectLevel: state.pageConstants.isProjectLevel,
  isShareView: state.pageConstants.isShareView,
  selectedSong: state.selectedSong,
}), dispatch => ({
  setSong: song => dispatch(danceRedux.setSong(song))
}))(DanceVisualizationColumn);
