/** @file Top-level view for Music */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Provider, connect} from 'react-redux';
import Instructions from './Instructions';
import Controls from './Controls';
import Timeline from './Timeline';
import MusicPlayer from '../player/MusicPlayer';
import ProgramSequencer from '../player/ProgramSequencer';
import RandomSkipManager from '../player/RandomSkipManager';
import AnalyticsReporter from '../analytics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import moduleStyles from './music-view.module.scss';
import {AnalyticsContext, PlayerUtilsContext} from '../context';
import TopButtons from './TopButtons';
import Globals from '../globals';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import AppConfig from '../appConfig';
import SoundUploader from '../utils/SoundUploader';
import ProgressManager from '../progress/ProgressManager';
import MusicValidator from '../progress/MusicValidator';
import Video from './Video';
import MusicLibrary from '../player/MusicLibrary';
import {
  setIsPlaying,
  setCurrentPlayheadPosition,
  clearSelectedBlockId,
  selectBlockId,
  setShowInstructions,
  setInstructionsPosition,
  InstructionsPositions
} from '../redux/musicRedux';
import KeyHandler from './KeyHandler';

const baseUrl = 'https://curriculum.code.org/media/musiclab/';

/**
 * Top-level container for Music Lab. Manages all views on the page as well as the
 * Blockly workspace and music player.
 *
 * TODO: Split up this component into a pure view and class/component that manages
 * application state.
 */
class UnconnectedMusicView extends React.Component {
  static propTypes = {
    // populated by Redux
    userId: PropTypes.number,
    userType: PropTypes.string,
    signInState: PropTypes.oneOf(Object.values(SignInState)),
    isPlaying: PropTypes.bool,
    setIsPlaying: PropTypes.func,
    setCurrentPlayheadPosition: PropTypes.func,
    selectedBlockId: PropTypes.string,
    selectBlockId: PropTypes.func,
    clearSelectedBlockId: PropTypes.func,
    timelineAtTop: PropTypes.bool,
    showInstructions: PropTypes.bool,
    instructionsPosition: PropTypes.string,
    setShowInstructions: PropTypes.func,
    setInstructionsPosition: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.player = new MusicPlayer();
    this.programSequencer = new ProgramSequencer();
    this.randomSkipManager = new RandomSkipManager();
    this.analyticsReporter = new AnalyticsReporter();
    this.musicBlocklyWorkspace = new MusicBlocklyWorkspace();
    this.soundUploader = new SoundUploader(this.player);

    // Increments every time a trigger is pressed;
    // used to differentiate tracks created on the same trigger
    this.triggerCount = 0;

    // Set default for instructions position.
    const defaultInstructionsPos = AppConfig.getValue(
      'instructions-position'
    )?.toUpperCase();
    if (defaultInstructionsPos) {
      this.props.setInstructionsPosition(defaultInstructionsPos);
    }

    this.state = {
      updateNumber: 0,
      showingVideo: true
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

    // document.body.addEventListener('keyup', this.handleKeyUp);

    const promises = [];
    promises.push(this.loadLibrary());
    if (AppConfig.getValue('load-progression') === 'true') {
      promises.push(this.loadProgression());
    }

    Promise.all(promises).then(values => {
      // Process library, which includes setting up the toolbox.
      const libraryJson = values[0];
      this.library = new MusicLibrary(libraryJson);

      // Process progression first, if there is one, since
      // it might affect the toolbox.
      if (AppConfig.getValue('load-progression') === 'true') {
        const progression = values[1];

        const musicValidator = new MusicValidator(
          this.getIsPlaying,
          this.player
        );

        this.progressManager = new ProgressManager(
          progression,
          musicValidator,
          this.onProgresschange
        );
        this.props.setShowInstructions(!!progression);
        this.setAllowedSoundsForProgress();
      }

      this.musicBlocklyWorkspace.init(
        document.getElementById('blockly-div'),
        this.onBlockSpaceChange,
        this.player,
        this.progressManager?.getCurrentStepDetails().toolbox
      );
      this.player.initialize(this.library);
      setInterval(this.updateTimer, 1000 / 30);

      Globals.setLibrary(this.library);
      Globals.setPlayer(this.player);
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

    if (
      prevProps.selectedBlockId !== this.props.selectedBlockId &&
      !this.props.isPlaying
    ) {
      this.musicBlocklyWorkspace.selectBlock(this.props.selectedBlockId);
    }
  }

  updateTimer = () => {
    if (this.props.isPlaying) {
      this.props.setCurrentPlayheadPosition(
        this.player.getCurrentPlayheadPosition()
      );

      this.updateHighlightedBlocks();

      this.progressManager?.updateProgress();
    }
  };

  onProgresschange = () => {
    // This is a way to tell React to re-render the scene, notably
    // the instructions.
    this.setState({updateNumber: this.state.updateNumber + 1});
  };

  getIsPlaying = () => {
    return this.props.isPlaying;
  };

  onNextPanel = () => {
    this.progressManager?.next();
    this.stopSong();
    this.clearCode();
    this.setToolboxForProgress();
    this.setAllowedSoundsForProgress();
  };

  setToolboxForProgress = () => {
    if (this.progressManager) {
      const allowedToolbox = this.progressManager.getCurrentStepDetails()
        .toolbox;
      this.musicBlocklyWorkspace.updateToolbox(allowedToolbox);
    }
  };

  setAllowedSoundsForProgress = () => {
    if (this.progressManager) {
      this.library.setAllowedSounds(
        this.progressManager.getCurrentStepDetails().sounds
      );
    }
  };

  updateHighlightedBlocks = () => {
    const playingBlockIds = this.player.getCurrentlyPlayingBlockIds();
    this.musicBlocklyWorkspace.updateHighlightedBlocks(playingBlockIds);
  };

  loadLibrary = async () => {
    if (AppConfig.getValue('local-library') === 'true') {
      const localLibraryFilename = 'music-library';
      const localLibrary = require(`@cdo/static/music/${localLibraryFilename}.json`);
      return localLibrary;
    } else {
      const libraryParameter = AppConfig.getValue('library');
      const libraryFilename = libraryParameter
        ? `music-library-${libraryParameter}.json`
        : 'music-library.json';
      const response = await fetch(baseUrl + libraryFilename);
      const library = await response.json();
      return library;
    }
  };

  loadProgression = async () => {
    if (AppConfig.getValue('local-progression') === 'true') {
      const defaultProgressionFilename = 'music-progression';
      const progression = require(`@cdo/static/music/${defaultProgressionFilename}.json`);
      return progression;
    } else {
      const progressionParameter = AppConfig.getValue('progression');
      const progressionFilename = progressionParameter
        ? `music-progression-${progressionParameter}.json`
        : 'music-progression.json';
      const response = await fetch(baseUrl + progressionFilename);
      const progression = await response.json();
      return progression;
    }
  };

  clearCode = () => {
    this.musicBlocklyWorkspace.resetCode();

    this.setPlaying(false);
  };

  onBlockSpaceChange = e => {
    // A drag event can leave the blocks in a temporarily unusable state,
    // e.g. when a disabled variable is dragged into a slot, it can still
    // be disabled.
    // A subsequent non-drag event should arrive and the blocks will be
    // usable then.
    // It's possible that other events should similarly be ignored here.
    if (e.type === Blockly.Events.BLOCK_DRAG) {
      this.player.cancelPreviews();
      return;
    }

    // Prevent a rapid cycle of workspace resizing from occurring when
    // dragging a block near the bottom of the workspace.
    if (e.type === Blockly.Events.VIEWPORT_CHANGE) {
      return;
    }

    const codeChanged = this.compileSong();
    if (codeChanged) {
      this.executeCompiledSong();

      this.analyticsReporter.onBlocksUpdated(
        this.musicBlocklyWorkspace.getAllBlocks()
      );

      // This is a way to tell React to re-render the scene, notably
      // the timeline.
      this.setState({updateNumber: this.state.updateNumber + 1});
    }

    if (e.type === Blockly.Events.SELECTED) {
      if (
        !this.props.isPlaying &&
        e.newElementId !== this.props.selectedBlockId
      ) {
        this.props.selectBlockId(e.newElementId);
      }
    }

    // Save the workspace.
    this.musicBlocklyWorkspace.saveCode();
  };

  setPlaying = play => {
    if (play) {
      this.playSong();
      this.analyticsReporter.onButtonClicked('play');
    } else {
      this.stopSong();
      this.updateHighlightedBlocks();
    }
  };

  playTrigger = id => {
    if (!this.props.isPlaying) {
      return;
    }
    this.analyticsReporter.onButtonClicked('trigger', {id});
    this.musicBlocklyWorkspace.executeTrigger(id);
    this.triggerCount++;
  };

  compileSong = () => {
    return this.musicBlocklyWorkspace.compileSong({
      MusicPlayer: this.player,
      ProgramSequencer: this.programSequencer,
      RandomSkipManager: this.randomSkipManager,
      getTriggerCount: () => this.triggerCount,
      MusicLibrary: this.library
    });
  };

  executeCompiledSong = () => {
    // Clear the events list of when_run sounds, because it will be
    // populated next.
    this.player.clearWhenRunEvents();

    this.musicBlocklyWorkspace.executeCompiledSong();
  };

  playSong = () => {
    this.player.stopSong();

    this.compileSong();

    this.executeCompiledSong();

    this.player.playSong();

    this.props.setIsPlaying(true);
    this.props.setCurrentPlayheadPosition(1);
    this.props.clearSelectedBlockId();
  };

  stopSong = () => {
    this.player.stopSong();

    this.executeCompiledSong();

    this.props.setIsPlaying(false);
    this.props.setCurrentPlayheadPosition(0);
    this.triggerCount = 0;
  };

  onFeedbackClicked = () => {
    this.analyticsReporter.onButtonClicked('feedback');
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLScnUgehPPNjhSNIcCpRMcHFgtE72TlfTOh6GkER6aJ-FtIwTQ/viewform?usp=sf_link',
      '_blank'
    );
  };

  onVideoClosed = () => {
    this.setState({showingVideo: false});
  };

  renderInstructions(position) {
    if (!this.progressManager) {
      return;
    }

    // For now, the instructions are intended for use with a
    // progression.  We might decide to make them agnostic at
    // some point.
    // One advantage of passing everything through is that the
    // instructions can potentially size themselves to the
    // maximum possible content size, requiring no dynamic
    // resizing or user scrolling.  We did this for the dynamic
    // instructions in AI Lab.
    const progression = this.progressManager.getProgression();

    const progressState = this.progressManager.getCurrentState();
    const currentPanel = progressState.step;
    const message = progressState.message;
    const satisfied = progressState.satisfied;

    return (
      <div
        className={classNames(
          moduleStyles.instructionsArea,
          position === InstructionsPositions.TOP
            ? moduleStyles.instructionsTop
            : moduleStyles.instructionsSide,
          position === InstructionsPositions.LEFT &&
            moduleStyles.instructionsLeft,
          position === InstructionsPositions.RIGHT &&
            moduleStyles.instructionsRight
        )}
      >
        <Instructions
          progression={progression}
          currentPanel={currentPanel}
          message={message}
          onNextPanel={satisfied ? this.onNextPanel : null}
          baseUrl={baseUrl}
          vertical={position !== InstructionsPositions.TOP}
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
          setPlaying={this.setPlaying}
          playTrigger={this.playTrigger}
          top={timelineAtTop}
          instructionsAvailable={!!this.state.instructions}
          toggleInstructions={() => this.toggleInstructions(false)}
          instructionsOnRight={instructionsOnRight}
        />
        <Timeline />
      </div>
    );
  }

  render() {
    const showVideo =
      AppConfig.getValue('show-video') !== 'false' && this.state.showingVideo;

    const {timelineAtTop, showInstructions, instructionsPosition} = this.props;

    return (
      <AnalyticsContext.Provider value={this.analyticsReporter}>
        <PlayerUtilsContext.Provider
          value={{
            getPlaybackEvents: () => this.player.getPlaybackEvents(),
            getTracksMetadata: () => this.player.getTracksMetadata(),
            getLastMeasure: () => this.player.getLastMeasure()
          }}
        >
          <KeyHandler
            togglePlaying={() => this.setPlaying(!this.props.isPlaying)}
            playTrigger={this.playTrigger}
          />
          <div id="music-lab-container" className={moduleStyles.container}>
            {showInstructions &&
              instructionsPosition === InstructionsPositions.TOP &&
              this.renderInstructions(InstructionsPositions.TOP)}

            {showVideo && (
              <Video id="initial-modal-0" onClose={this.onVideoClosed} />
            )}

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
                  <TopButtons
                    clearCode={this.clearCode}
                    uploadSound={file => this.soundUploader.uploadSound(file)}
                  />
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
        </PlayerUtilsContext.Provider>
      </AnalyticsContext.Provider>
    );
  }
}

const MusicView = connect(
  state => ({
    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
    signInState: state.currentUser.signInState,
    isPlaying: state.music.isPlaying,
    selectedBlockId: state.music.selectedBlockId,
    timelineAtTop: state.music.timelineAtTop,
    showInstructions: state.music.showInstructions,
    instructionsPosition: state.music.instructionsPosition
  }),
  dispatch => ({
    setIsPlaying: isPlaying => dispatch(setIsPlaying(isPlaying)),
    setCurrentPlayheadPosition: currentPlayheadPosition =>
      dispatch(setCurrentPlayheadPosition(currentPlayheadPosition)),
    selectBlockId: blockId => dispatch(selectBlockId(blockId)),
    clearSelectedBlockId: () => dispatch(clearSelectedBlockId()),
    setShowInstructions: showInstructions =>
      dispatch(setShowInstructions(showInstructions)),
    setInstructionsPosition: instructionsPosition =>
      dispatch(setInstructionsPosition(instructionsPosition))
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
