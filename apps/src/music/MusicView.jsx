/** @file Top-level view for Music */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Provider, connect} from 'react-redux';
import queryString from 'query-string';
import Instructions from './Instructions';
import SharePlaceholder from './SharePlaceholder';
import Controls from './Controls';
import Timeline from './Timeline';
import MusicPlayer from './player/MusicPlayer';
import AnalyticsReporter from './analytics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import moduleStyles from './music.module.scss';
import {AnalyticsContext} from './context';
import TopButtons from './TopButtons';
import Globals from './globals';
import MusicBlocklyWorkspace from './blockly/MusicBlocklyWorkspace';
import KeyHandler from './KeyHandler';
import {
  InstructionsPositions,
  setCurrentAudioElapsedTime,
  setSoundEvents
} from './musiclabRedux';

const baseUrl = 'https://curriculum.code.org/media/musiclab/';

const DEFAULT_GROUP_NAME = 'all';

class UnconnectedMusicView extends React.Component {
  static propTypes = {
    // populated by Redux
    userId: PropTypes.number,
    userType: PropTypes.string,
    signInState: PropTypes.oneOf(Object.values(SignInState)),
    timelineAtTop: PropTypes.bool.isRequired,
    showInstructions: PropTypes.bool.isRequired,
    instructionsPosition: PropTypes.oneOf(Object.values(InstructionsPositions))
      .isRequired,
    setCurrentAudioElapsedTime: PropTypes.func.isRequired,
    setSoundEvents: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.player = new MusicPlayer();
    this.analyticsReporter = new AnalyticsReporter();
    this.musicBlocklyWorkspace = new MusicBlocklyWorkspace();

    this.state = {
      library: null,
      instructions: null,
      isPlaying: false
    };
  }

  componentDidMount() {
    this.analyticsReporter.startSession().then(() => {
      this.analyticsReporter.setUserProperties(
        this.props.userId,
        this.props.userType,
        this.props.signInState
      );
    });
    // TODO: the 'beforeunload' callback is advised against as it is not guaranteed to fire on mobile browsers. However,
    // we need a way of reporting analytics when the user navigates away from the page. Check with Amplitude for the
    // correct approach.
    window.addEventListener('beforeunload', () =>
      this.analyticsReporter.endSession()
    );

    this.loadLibrary().then(library => {
      this.setState({library});
      this.musicBlocklyWorkspace.init(
        document.getElementById('blockly-div'),
        this.onBlockSpaceChange
      );
      this.player.initialize(library);
      setInterval(this.updateTimer, 1000 / 30);

      Globals.setLibrary(this.state.library);
      Globals.setPlayer(this.player);
    });

    this.loadInstructions().then(instructions => {
      this.setState({instructions});
    });
  }

  componentDidUpdate(prevProps) {
    this.musicBlocklyWorkspace.resizeBlockly();
    if (
      prevProps.userId !== this.props.userId ||
      prevProps.userType !== this.props.userType ||
      prevProps.signInState !== this.props.signInState
    ) {
      this.analyticsReporter.setUserProperties(
        this.props.userId,
        this.props.userType,
        this.props.signInState
      );
    }
  }

  updateTimer = () => {
    if (this.state.isPlaying) {
      this.props.setCurrentAudioElapsedTime(
        this.player.getCurrentAudioElapsedTime()
      );
    }
  };

  loadLibrary = async () => {
    let parameters = queryString.parse(location.search);
    const libraryFilename = parameters['library']
      ? `music-library-${parameters['library']}.json`
      : 'music-library.json';
    const response = await fetch(baseUrl + libraryFilename);
    const library = await response.json();
    return library;
  };

  loadInstructions = async () => {
    const libraryFilename = 'music-instructions.json';
    const response = await fetch(baseUrl + libraryFilename);
    const library = await response.json();
    return library;
  };

  clearCode = () => {
    this.musicBlocklyWorkspace.resetCode();

    this.setPlaying(false);

    this.player.clearAllSoundEvents();
  };

  onBlockSpaceChange = e => {
    // A drag event can leave the blocks in a temporarily unusable state,
    // e.g. when a disabled variable is dragged into a slot, it can still
    // be disabled.
    // A subsequent non-drag event should arrive and the blocks will be
    // usable then.
    // It's possible that other events should similarly be ignored here.
    if (e.type === Blockly.blockly_.Events.BLOCK_DRAG) {
      this.player.stopAndCancelPreviews();
      return;
    }

    // Stop all when_run sounds that are still to play, because if they
    // are still valid after the when_run code is re-executed, they
    // will be scheduled again.
    this.stopAllSoundsStillToPlay();

    // Also clear all when_run sounds from the events list, because it
    // will be recreated in its entirely when the when_run code is
    // re-executed.
    this.player.clearWhenRunEvents();

    this.executeSong();

    console.log('onBlockSpaceChange', Blockly.getWorkspaceCode());

    this.analyticsReporter.onBlocksUpdated(
      this.musicBlocklyWorkspace.getAllBlocks()
    );

    // This is a way to tell React to re-render the scene, notably
    // the timeline.
    // this.setState({updateNumber: this.state.updateNumber + 1});

    this.musicBlocklyWorkspace.saveCode();
  };

  setPlaying = play => {
    if (play) {
      this.playSong();
      this.analyticsReporter.onButtonClicked('play');
    } else {
      this.stopSong();
    }
  };

  playTrigger = id => {
    if (!this.state.isPlaying) {
      return;
    }
    this.analyticsReporter.onButtonClicked('trigger', {id});
    this.musicBlocklyWorkspace.executeTrigger(id);
    this.props.setSoundEvents(this.player.getSoundEvents());
  };

  executeSong = () => {
    this.musicBlocklyWorkspace.executeSong({
      MusicPlayer: this.player
    });
    this.props.setSoundEvents(this.player.getSoundEvents());
  };

  playSong = () => {
    this.player.stopSong();

    // Clear the events list of when_run sounds, because it will be
    // populated next.
    this.player.clearWhenRunEvents();

    this.executeSong();

    this.player.playSong();

    this.setState({isPlaying: true});

    console.log('playSong', Blockly.getWorkspaceCode());
  };

  stopSong = () => {
    this.player.stopSong();

    // Clear the events list, and hence the visual timeline, of any
    // user-triggered sounds.
    this.player.clearTriggeredEvents();

    this.setState({isPlaying: false});
    this.props.setSoundEvents(this.player.getSoundEvents());
    this.props.setCurrentAudioElapsedTime(0);
  };

  stopAllSoundsStillToPlay = () => {
    this.player.stopAllSoundsStillToPlay();
  };

  getCurrentGroup = () => {
    const currentGroup =
      this.state.library &&
      this.state.library.groups.find(group => group.id === DEFAULT_GROUP_NAME);

    return currentGroup;
  };

  getCurrentGroupSounds = () => {
    return this.getCurrentGroup()?.folders;
  };

  renderInstructions(position) {
    if (position === InstructionsPositions.TOP) {
      return (
        <div
          id="instructions-area"
          className={classNames(
            moduleStyles.instructionsArea,
            moduleStyles.instructionsTop
          )}
        >
          <Instructions
            instructions={this.state.instructions}
            baseUrl={baseUrl}
          />
          <div
            id="share-area"
            className={classNames(
              moduleStyles.shareArea,
              moduleStyles.shareTop
            )}
          >
            <SharePlaceholder />
          </div>
        </div>
      );
    }

    return (
      <div
        className={classNames(
          moduleStyles.instructionsArea,
          moduleStyles.instructionsSide,
          position === InstructionsPositions.LEFT
            ? moduleStyles.instructionsLeft
            : moduleStyles.instructionsRight
        )}
      >
        <Instructions
          instructions={this.state.instructions}
          baseUrl={baseUrl}
          vertical={true}
          right={position === InstructionsPositions.RIGHT}
        />
      </div>
    );
  }

  renderTimelineArea(timelineAtTop, instructionsOnRight) {
    return (
      <div
        id="timeline-area"
        className={classNames(
          moduleStyles.timelineArea,
          timelineAtTop ? moduleStyles.timelineTop : moduleStyles.timelineBottom
        )}
      >
        <Controls
          isPlaying={this.state.isPlaying}
          setPlaying={this.setPlaying}
          playTrigger={this.playTrigger}
          top={timelineAtTop}
          instructionsOnRight={instructionsOnRight}
        />
        <Timeline
          isPlaying={this.state.isPlaying}
          convertMeasureToSeconds={measure =>
            this.player.convertMeasureToSeconds(measure)
          }
          currentMeasure={this.player.getCurrentMeasure()}
          sounds={this.getCurrentGroupSounds()}
        />
      </div>
    );
  }

  render() {
    const {showInstructions, timelineAtTop, instructionsPosition} = this.props;

    return (
      <AnalyticsContext.Provider value={this.analyticsReporter}>
        <KeyHandler
          togglePlaying={() => this.setPlaying(!this.state.isPlaying)}
          playTrigger={this.playTrigger}
        />
        <div id="music-lab-container" className={moduleStyles.container}>
          {showInstructions &&
            instructionsPosition === InstructionsPositions.TOP &&
            this.renderInstructions(InstructionsPositions.TOP)}

          {timelineAtTop &&
            this.renderTimelineArea(
              true,
              instructionsPosition === InstructionsPositions.RIGHT
            )}

          <div className={moduleStyles.middleArea}>
            {showInstructions &&
              instructionsPosition === InstructionsPositions.LEFT &&
              this.renderInstructions(InstructionsPositions.LEFT)}

            <div id="blockly-area" className={moduleStyles.blocklyArea}>
              <div className={moduleStyles.topButtonsContainer}>
                <TopButtons clearCode={this.clearCode} />
              </div>
              <div id="blockly-div" />
            </div>

            {showInstructions &&
              instructionsPosition === InstructionsPositions.RIGHT &&
              this.renderInstructions(InstructionsPositions.RIGHT)}
          </div>

          {!timelineAtTop &&
            this.renderTimelineArea(
              false,
              instructionsPosition === InstructionsPositions.RIGHT
            )}
        </div>
      </AnalyticsContext.Provider>
    );
  }
}

const MusicView = connect(
  state => ({
    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
    signInState: state.currentUser.signInState,
    timelineAtTop: state.music.timelineAtTop,
    showInstructions: state.music.showInstructions,
    instructionsPosition: state.music.instructionsPosition
  }),
  dispatch => ({
    setCurrentAudioElapsedTime: time =>
      dispatch(setCurrentAudioElapsedTime(time)),
    setSoundEvents: events => dispatch(setSoundEvents(events))
  })
)(UnconnectedMusicView);

const MusicLabView = () => {
  return (
    <Provider store={getStore()}>
      <MusicView />
    </Provider>
  );
};

export default MusicLabView;
