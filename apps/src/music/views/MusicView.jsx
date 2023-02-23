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
import {Triggers} from '../constants';
import AnalyticsReporter from '../analytics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import moduleStyles from './music-view.module.scss';
import {AnalyticsContext, PlayerUtilsContext} from '../context';
import TopButtons from './TopButtons';
import Globals from '../globals';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import AppConfig, {getBlockMode} from '../appConfig';
import SoundUploader from '../utils/SoundUploader';

const baseUrl = 'https://curriculum.code.org/media/musiclab/';

const InstructionsPositions = {
  TOP: 'TOP',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
};

const instructionPositionOrder = [
  InstructionsPositions.TOP,
  InstructionsPositions.LEFT,
  InstructionsPositions.RIGHT
];

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
    signInState: PropTypes.oneOf(Object.values(SignInState))
  };

  constructor(props) {
    super(props);

    this.player = new MusicPlayer();
    this.programSequencer = new ProgramSequencer();
    this.analyticsReporter = new AnalyticsReporter();
    this.musicBlocklyWorkspace = new MusicBlocklyWorkspace();
    this.soundUploader = new SoundUploader(this.player);
    // Increments every time a trigger is pressed;
    // used to differentiate tracks created on the same trigger
    this.triggerCount = 0;

    // Set default for instructions position.
    let instructionsPosIndex = 1;
    const defaultInstructionsPos = AppConfig.getValue(
      'instructions-position'
    )?.toUpperCase();
    if (defaultInstructionsPos) {
      const posIndex = instructionPositionOrder.indexOf(defaultInstructionsPos);
      if (posIndex !== -1) {
        instructionsPosIndex = posIndex;
      }
    }

    this.state = {
      instructions: null,
      isPlaying: false,
      currentPlayheadPosition: 0,
      updateNumber: 0,
      timelineAtTop: false,
      showInstructions: false,
      instructionsPosIndex
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

    document.body.addEventListener('keyup', this.handleKeyUp);

    this.loadLibrary().then(library => {
      this.musicBlocklyWorkspace.init(
        document.getElementById('blockly-div'),
        this.onBlockSpaceChange,
        this.player
      );
      this.player.initialize(library);
      setInterval(this.updateTimer, 1000 / 30);

      Globals.setLibrary(library);
      Globals.setPlayer(this.player);
    });

    // Only attempt to load instructions if configured to.
    if (AppConfig.getValue('show-instructions') === 'true') {
      this.loadInstructions().then(instructions => {
        this.setState({
          instructions: instructions,
          showInstructions: !!instructions
        });
      });
    }
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
      this.setState({
        currentPlayheadPosition: this.player.getCurrentPlayheadPosition()
      });
    }
  };

  loadLibrary = async () => {
    const defaultLibraryFilename = 'music-library';
    const defaultCode = require(`@cdo/static/music/${defaultLibraryFilename}.json`);
    return defaultCode;
    /*
    const libraryParameter = AppConfig.getValue('library');
    const libraryFilename = libraryParameter
      ? `music-library-${libraryParameter}.json`
      : 'music-library.json';
    const response = await fetch(baseUrl + libraryFilename);
    const library = await response.json();
    return library;
    */
  };

  loadInstructions = async () => {
    const instructionsFilename = `music-instructions-${getBlockMode().toLowerCase()}.json`;
    const response = await fetch(baseUrl + instructionsFilename);
    let instructions;
    try {
      instructions = await response.json();
    } catch (error) {
      console.error('Instructions load error.', error);
      instructions = null;
    }
    return instructions;
  };

  clearCode = () => {
    this.musicBlocklyWorkspace.resetCode();

    this.setPlaying(false);

    // this.player.clearAllSoundEvents();
  };

  onBlockSpaceChange = e => {
    // A drag event can leave the blocks in a temporarily unusable state,
    // e.g. when a disabled variable is dragged into a slot, it can still
    // be disabled.
    // A subsequent non-drag event should arrive and the blocks will be
    // usable then.
    // It's possible that other events should similarly be ignored here.
    if (e.type === Blockly.Events.BLOCK_DRAG) {
      // this.player.stopAndCancelPreviews();
      return;
    }

    // Prevent a rapid cycle of workspace resizing from occurring when
    // dragging a block near the bottom of the workspace.
    if (e.type === Blockly.Events.VIEWPORT_CHANGE) {
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

    this.analyticsReporter.onBlocksUpdated(
      this.musicBlocklyWorkspace.getAllBlocks()
    );

    // This is a way to tell React to re-render the scene, notably
    // the timeline.
    this.setState({updateNumber: this.state.updateNumber + 1});

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
    this.triggerCount++;
  };

  toggleInstructions = fromKeyboardShortcut => {
    this.analyticsReporter.onButtonClicked('show-hide-instructions', {
      showing: !this.state.showInstructions,
      fromKeyboardShortcut
    });
    this.setState({
      showInstructions: !this.state.showInstructions
    });
  };

  executeSong = () => {
    this.musicBlocklyWorkspace.executeSong({
      MusicPlayer: this.player,
      ProgramSequencer: this.programSequencer,
      getTriggerCount: () => this.triggerCount
    });
  };

  playSong = () => {
    this.player.stopSong();

    // Clear the events list of when_run sounds, because it will be
    // populated next.
    this.player.clearWhenRunEvents();

    this.executeSong();

    this.player.playSong();

    this.setState({isPlaying: true, currentPlayheadPosition: 1});
  };

  stopSong = () => {
    this.player.stopSong();

    // Clear the events list, and hence the visual timeline, of any
    // user-triggered sounds.
    this.player.clearTriggeredEvents();

    this.setState({isPlaying: false, currentPlayheadPosition: 0});
    this.triggerCount = 0;
  };

  stopAllSoundsStillToPlay = () => {
    this.player.stopAllSoundsStillToPlay();
  };

  handleKeyUp = event => {
    // Don't handle a keyboard shortcut if the active element is an
    // input field, since the user is probably trying to type something.
    if (document.activeElement.tagName.toLowerCase() === 'input') {
      return;
    }

    if (event.key === 't') {
      this.setState({timelineAtTop: !this.state.timelineAtTop});
    }
    if (event.key === 'i') {
      this.toggleInstructions(true);
    }
    if (event.key === 'n') {
      this.setState({
        instructionsPosIndex:
          (this.state.instructionsPosIndex + 1) %
          instructionPositionOrder.length
      });
    }
    Triggers.map(trigger => {
      if (event.key === trigger.keyboardKey) {
        this.playTrigger(trigger.id);
      }
    });
    if (event.code === 'Space') {
      this.setPlaying(!this.state.isPlaying);
    }
  };

  onFeedbackClicked = () => {
    this.analyticsReporter.onButtonClicked('feedback');
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLScnUgehPPNjhSNIcCpRMcHFgtE72TlfTOh6GkER6aJ-FtIwTQ/viewform?usp=sf_link',
      '_blank'
    );
  };

  renderInstructions(position) {
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
          instructions={this.state.instructions}
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
          isPlaying={this.state.isPlaying}
          setPlaying={this.setPlaying}
          playTrigger={this.playTrigger}
          top={timelineAtTop}
          instructionsAvailable={!!this.state.instructions}
          toggleInstructions={() => this.toggleInstructions(false)}
          instructionsOnRight={instructionsOnRight}
        />
        <Timeline
          isPlaying={this.state.isPlaying}
          currentPlayheadPosition={this.state.currentPlayheadPosition}
        />
      </div>
    );
  }

  render() {
    const instructionsPosition =
      instructionPositionOrder[this.state.instructionsPosIndex];

    return (
      <AnalyticsContext.Provider value={this.analyticsReporter}>
        <PlayerUtilsContext.Provider
          value={{
            getPlaybackEvents: () => this.player.getPlaybackEvents(),
            convertMeasureToSeconds: measure =>
              this.player.convertMeasureToSeconds(measure),
            getTracksMetadata: () => this.player.getTracksMetadata(),
            getLengthForId: id => this.player.getLengthForId(id),
            getTypeForId: id => this.player.getTypeForId(id)
          }}
        >
          <div id="music-lab-container" className={moduleStyles.container}>
            {this.state.showInstructions &&
              instructionsPosition === InstructionsPositions.TOP &&
              this.renderInstructions(InstructionsPositions.TOP)}

            {this.state.timelineAtTop &&
              this.renderTimelineArea(
                true,
                instructionsPosition === InstructionsPositions.RIGHT
              )}

            <div className={moduleStyles.middleArea}>
              {this.state.showInstructions &&
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

              {this.state.showInstructions &&
                instructionsPosition === InstructionsPositions.RIGHT &&
                this.renderInstructions(InstructionsPositions.RIGHT)}
            </div>

            {!this.state.timelineAtTop &&
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

const MusicView = connect(state => ({
  userId: state.currentUser.userId,
  userType: state.currentUser.userType,
  signInState: state.currentUser.signInState
}))(UnconnectedMusicView);

const MusicLabView = () => {
  return (
    <Provider store={getStore()}>
      <MusicView />
    </Provider>
  );
};

export default MusicLabView;
