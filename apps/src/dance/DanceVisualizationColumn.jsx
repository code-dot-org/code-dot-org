import React, {useCallback, useState} from 'react';
import {setCurrentAiModalField} from './danceRedux';
import GameButtons from '../templates/GameButtons';
import ArrowButtons from '../templates/ArrowButtons';
import BelowVisualization from '../templates/BelowVisualization';
import {MAX_GAME_WIDTH, GAME_HEIGHT} from './constants';
import ProtectedVisualizationDiv from '../templates/ProtectedVisualizationDiv';
import PropTypes from 'prop-types';
// import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import AgeDialog from '../templates/AgeDialog';
import HourOfCodeGuideEmailDialog from '../templates/HourOfCodeGuideEmailDialog';
import {getFilteredSongKeys, getFilterStatus} from '@cdo/apps/dance/songs';
import DanceAiModal from './ai/DanceAiModal';
import {commands as audioCommands} from '@cdo/apps/lib/util/audioApi';

export const SongSelector = ({
  selectedSong,
  levelIsRunning,
  setSong,
  songData,
  enableSongSelection,
  filterOn,
}) => {
  const [songInPreview, setSongInPreview] = useState(false);
  // useEffect(() => {
  //   console.log('songInPreview', songInPreview);
  //   console.log('levelIsRunning', levelIsRunning);
  //   console.log('selectedSong', selectedSong);
  //   if (songInPreview && (levelIsRunning || songInPreview !== selectedSong)) {
  //     console.log('stop playing song')
  //     audioCommands.stopSound({url: songData[songInPreview]?.url});
  //     console.log(songData[songInPreview]?.url)
  //     setSongInPreview(null);
  //   }
  //   console.log('-=-=-=-');
  // }, [songData, songInPreview, levelIsRunning, selectedSong]);

  const songKeys = getFilteredSongKeys(songData, filterOn);
  const changeSong = useCallback(
    event => {
      const songId = event.target.value;
      setSong(songId);
    },
    [setSong]
  );

  return (
    <div id="song-selector-wrapper">
      <label>
        <b>{i18n.selectSong()}</b>
      </label>
      <button
        type="button"
        disabled={levelIsRunning}
        onClick={() => {
          if (songInPreview) {
            console.log('double click stop playing song');
            audioCommands.stopSound({url: songData[selectedSong].url});
            setSongInPreview(false);
          } else {
            console.log('start playing song');
            audioCommands.playSound({
              url: `${songData[selectedSong].url}`,
              callback: () => {
                setSongInPreview(true);
                // console.log(songInPreview)
                setTimeout(() => {
                  console.log('stop playing song');
                  // console.log(levelIsRunning, songInPreview);
                  if (!levelIsRunning) {
                    audioCommands.stopSound({url: songData[selectedSong].url});
                    console.log('end song - ', songData[selectedSong].url);
                    setSongInPreview(false);
                  }
                }, 10000);
                console.log('callback');
              },
              onEnded: () => {
                setSongInPreview(false);
                console.log('end');
              },
            });
          }
        }}
      >
        {!levelIsRunning && songInPreview ? 'Stop Preview' : 'Preview'} song
      </button>
      <select
        id="song_selector"
        style={styles.selectStyle}
        onChange={changeSong}
        value={selectedSong}
        disabled={!enableSongSelection}
      >
        {songKeys.map((option, i) => (
          <option key={i} value={option}>
            {songData[option].title}
          </option>
        ))}
      </select>
    </div>
  );
};

SongSelector.propTypes = {
  enableSongSelection: PropTypes.bool,
  levelIsRunning: PropTypes.bool,
  setSong: PropTypes.func.isRequired,
  selectedSong: PropTypes.string,
  songData: PropTypes.objectOf(PropTypes.object).isRequired,
  filterOn: PropTypes.bool.isRequired,
};

// export const SongSelector = Radium(
//   class extends React.Component {
//     static propTypes = {
//       enableSongSelection: PropTypes.bool,
//       levelIsRunning: PropTypes.bool,
//       setSong: PropTypes.func.isRequired,
//       selectedSong: PropTypes.string,
//       songData: PropTypes.objectOf(PropTypes.object).isRequired,
//       filterOn: PropTypes.bool.isRequired,
//     };
//
//     changeSong = event => {
//       const songId = event.target.value;
//       this.props.setSong(songId);
//     };
//
//     render() {
//       const {
//         selectedSong,
//         songData,
//         enableSongSelection,
//         filterOn,
//         hideRunButton,
//       } = this.props;
//
//       const songKeys = getFilteredSongKeys(songData, filterOn);
//
//       return (
//         <div id="song-selector-wrapper">
//           <label>
//             <b>{i18n.selectSong()}</b>
//           </label>
//           <button
//             type="button"
//             onClick={() => {
//               console.log('start playing song');
//               audioCommands.playSound({
//                 url: songData[selectedSong].url,
//                 callback: () => {
//                   setTimeout(() => {
//                     audioCommands.stopSound({url: songData[selectedSong].url});
//                   }, 10000);
//                   console.log('callback');
//                 },
//                 onEnded: () => {
//                   console.log('end');
//                   // onEnded();
//                   // this.studioApp_.toggleRunReset('run');
//                 },
//               });
//             }}
//           >
//             Preview song
//           </button>
//           <select
//             id="song_selector"
//             style={styles.selectStyle}
//             onChange={this.changeSong}
//             value={selectedSong}
//             disabled={!enableSongSelection}
//           >
//             {songKeys.map((option, i) => (
//               <option key={i} value={option}>
//                 {songData[option].title}
//               </option>
//             ))}
//           </select>
//         </div>
//       );
//     }
//   }
// );

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
    setCurrentAiModalField: PropTypes.func,
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
    // console.log('levelIsRunning', levelIsRunning);
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
        {(this.props.over21 || this.props.userType === 'teacher') && (
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
          {this.props.currentAiModalField && (
            <DanceAiModal
              onClose={() => this.props.setCurrentAiModalField(undefined)}
            />
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
  selectStyle: {
    width: '100%',
  },
};

export default connect(
  state => ({
    isShareView: state.pageConstants.isShareView,
    songData: state.dance.songData,
    selectedSong: state.dance.selectedSong,
    userType: state.currentUser.userType,
    under13: state.currentUser.under13,
    over21: state.currentUser.over21,
    levelIsRunning: state.runState.isRunning,
    levelRunIsStarting: state.dance.runIsStarting,
    currentAiModalField: state.dance.currentAiModalField,
  }),
  dispatch => ({
    setCurrentAiModalField: value => dispatch(setCurrentAiModalField(value)),
  })
)(DanceVisualizationColumn);
