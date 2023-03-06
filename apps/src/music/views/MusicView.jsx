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
import {Triggers} from '../constants';
import AnalyticsReporter from '../analytics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import moduleStyles from './music-view.module.scss';
import {AnalyticsContext, PlayingContext, PlayerUtilsContext} from '../context';
import TopButtons from './TopButtons';
import Globals from '../globals';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import AppConfig from '../appConfig';
import SoundUploader from '../utils/SoundUploader';
import Validation from '../validation';

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
    this.randomSkipManager = new RandomSkipManager();
    this.analyticsReporter = new AnalyticsReporter();
    this.musicBlocklyWorkspace = new MusicBlocklyWorkspace();
    this.soundUploader = new SoundUploader(this.player);
    this.validation = new Validation();
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
      progression: null,
      isPlaying: false,
      currentPlayheadPosition: 0,
      updateNumber: 0,
      timelineAtTop: false,
      showInstructions: false,
      instructionsPosIndex,
      progressionStep: 0,
      levelPassing: false,
      progressMessage: null
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

      this.setToolboxForProgress(0);
    });

    // Only attempt to load progression if configured to.
    if (AppConfig.getValue('load-progression') === 'true') {
      this.loadProgression().then(progression => {
        this.setState({
          progression: progression,
          showInstructions: !!progression
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

    if (this.state.progression) {
      this.checkValidation();
    }
  };

  checkValidation = () => {
    if (this.state.isPlaying) {
      if (this.player.getPlaybackEvents().length > 0) {
        this.validation.addCurrentCondition('played_one_sound', true);
      }

      // get number of sounds currently playing simultaneously?
      let currentNumberSounds = 0;

      this.player.getPlaybackEvents().forEach(eventData => {
        const length = this.player.getLengthForId(eventData.id);
        if (
          eventData.when <= this.state.currentPlayheadPosition &&
          eventData.when + length > this.state.currentPlayheadPosition
        ) {
          currentNumberSounds++;
        }
      });

      if (currentNumberSounds === 3) {
        this.validation.addCurrentCondition(
          'played_three_sounds_together',
          true
        );
      }
      if (currentNumberSounds === 2) {
        this.validation.addCurrentCondition('played_two_sounds_together', true);
      }

      // next, let's check against each progress for the current step.
      const currentValidations = this.state.progression.panels[
        this.state.progressionStep
      ].validations;

      if (!currentValidations) {
        // maybe it's a final level with no validations.
        return;
      }

      // go through each validation until one fails.
      for (const validation of currentValidations) {
        if (validation.conditions) {
          const met = this.validation.checkRequirementConditions(
            validation.conditions
          );
          if (met) {
            console.log('met conditios', validation);

            this.setState({
              levelPassing: validation.next,
              progressMessage: validation.message
            });
            return;
          }
        } else {
          // we've fallen through to a fallback without conditions.
          console.log('message', validation);
          this.setState({progressMessage: validation.message});
        }
      }
    }
  };

  onNextPanel = () => {
    const nextProgressionStep = this.state.progressionStep + 1;
    this.setState({
      progressionStep: nextProgressionStep,
      levelPassing: false,
      progressMessage: null
    });
    this.validation.clear();
    this.stopSong();
    this.clearCode();
    this.setToolboxForProgress(nextProgressionStep);
  };

  setToolboxForProgress = step => {
    const toolbox = this.state.progression.panels[step].toolbox;
    this.musicBlocklyWorkspace.updateToolbox(toolbox);
  };

  loadLibrary = async () => {
    const libraryParameter = AppConfig.getValue('library');
    const libraryFilename = libraryParameter
      ? `music-library-${libraryParameter}.json`
      : 'music-library.json';
    const response = await fetch(baseUrl + libraryFilename);
    const library = await response.json();
    return library;
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

    // Save the workspace.
    this.musicBlocklyWorkspace.saveCode();
  };

  setPlaying = play => {
    if (play) {
      this.playSong();
      this.analyticsReporter.onButtonClicked('play');
      this.setState({levelPassing: false});
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

  compileSong = () => {
    return this.musicBlocklyWorkspace.compileSong({
      MusicPlayer: this.player,
      ProgramSequencer: this.programSequencer,
      RandomSkipManager: this.randomSkipManager,
      getTriggerCount: () => this.triggerCount
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

    this.setState({isPlaying: true, currentPlayheadPosition: 1});
  };

  stopSong = () => {
    this.player.stopSong();

    this.executeCompiledSong();

    this.setState({isPlaying: false, currentPlayheadPosition: 0});
    this.triggerCount = 0;
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
          progression={this.state.progression}
          currentPanel={this.state.progressionStep}
          lastMessage={this.state.progressMessage}
          onNextPanel={this.state.levelPassing ? this.onNextPanel : null}
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
            getTracksMetadata: () => this.player.getTracksMetadata(),
            getLengthForId: id => this.player.getLengthForId(id),
            getTypeForId: id => this.player.getTypeForId(id),
            getLastMeasure: () => this.player.getLastMeasure()
          }}
        >
          <PlayingContext.Provider value={{isPlaying: this.state.isPlaying}}>
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
          </PlayingContext.Provider>
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
