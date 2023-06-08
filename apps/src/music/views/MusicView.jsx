/** @file Top-level view for Music */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {connect} from 'react-redux';
import Instructions from './Instructions';
import Controls from './Controls';
import Timeline from './Timeline';
import MusicPlayer from '../player/MusicPlayer';
import ProgramSequencer from '../player/ProgramSequencer';
import RandomSkipManager from '../player/RandomSkipManager';
import AnalyticsReporter from '../analytics/AnalyticsReporter';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import moduleStyles from './music-view.module.scss';
import {AnalyticsContext} from '../context';
import TopButtons from './TopButtons';
import Globals from '../globals';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import AppConfig, {getBlockMode, setAppConfig} from '../appConfig';
import SoundUploader from '../utils/SoundUploader';
import {
  baseUrl,
  LevelSources,
  loadLibrary,
  loadProgressionStepFromSource,
} from '../utils/Loader';
import ProgressManager from '../progress/ProgressManager';
import MusicValidator from '../progress/MusicValidator';
import Video from './Video';
import {
  setIsPlaying,
  setCurrentPlayheadPosition,
  clearSelectedBlockId,
  selectBlockId,
  setShowInstructions,
  setInstructionsPosition,
  InstructionsPositions,
  setCurrentProgressState,
  addPlaybackEvents,
  clearPlaybackEvents,
  getCurrentlyPlayingBlockIds,
  setLevelCount,
} from '../redux/musicRedux';
import KeyHandler from './KeyHandler';
import {sendSuccessReport} from '@cdo/apps/code-studio/progressRedux';
import {
  levelsForLessonId,
  navigateToLevelId,
  getLevelDataPath,
  ProgressLevelType,
  getProgressLevelType,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {setIsLoading, setIsPageError} from '@cdo/apps/labs/labRedux';
import Simple2Sequencer from '../player/sequencer/Simple2Sequencer';
import MusicPlayerStubSequencer from '../player/sequencer/MusicPlayerStubSequencer';
import {BlockMode} from '../constants';
import header from '../../code-studio/header';
import {
  setProjectUpdatedAt,
  setProjectUpdatedError,
  setProjectUpdatedSaving,
} from '../../code-studio/projectRedux';
import {ProjectManagerEvent} from '../../labs/projects/ProjectManager';
import {logError} from '../utils/MusicMetrics';

/**
 * Top-level container for Music Lab. Manages all views on the page as well as the
 * Blockly workspace and music player.
 *
 * TODO: Split up this component into a pure view and class/component that manages
 * application state.
 */
class UnconnectedMusicView extends React.Component {
  static propTypes = {
    progressLevelType: PropTypes.string,
    appConfig: PropTypes.object,
    channelId: PropTypes.string,

    /**
     * True if Music Lab is being presented from the Incubator page (i.e. under /projectbeats),
     * false/undefined if as part of a script or standalone level.
     * */
    inIncubator: PropTypes.bool,

    // populated by Redux
    currentLevelIndex: PropTypes.number,
    levels: PropTypes.array,
    currentLevelId: PropTypes.string,
    levelCount: PropTypes.number,
    levelDataPath: PropTypes.string,
    isLabLoading: PropTypes.bool,
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
    setInstructionsPosition: PropTypes.func,
    setCurrentProgressState: PropTypes.func,
    navigateToLevelId: PropTypes.func,
    clearPlaybackEvents: PropTypes.func,
    addPlaybackEvents: PropTypes.func,
    currentlyPlayingBlockIds: PropTypes.array,
    sendSuccessReport: PropTypes.func,
    currentScriptId: PropTypes.number,
    setProjectUpdatedSaving: PropTypes.func,
    setProjectUpdatedAt: PropTypes.func,
    setProjectUpdatedError: PropTypes.func,
    setIsLoading: PropTypes.func,
    setIsPageError: PropTypes.func,
    setLevelCount: PropTypes.func,
  };

  constructor(props) {
    super(props);

    if (this.props.appConfig) {
      setAppConfig(this.props.appConfig);
    }

    this.player = new MusicPlayer();
    this.programSequencer = new ProgramSequencer();
    this.randomSkipManager = new RandomSkipManager();
    this.analyticsReporter = new AnalyticsReporter();
    this.musicBlocklyWorkspace = new MusicBlocklyWorkspace();
    this.soundUploader = new SoundUploader(this.player);
    this.playingTriggers = [];

    // Set default for instructions position.
    const defaultInstructionsPos = AppConfig.getValue(
      'instructions-position'
    )?.toUpperCase();
    if (defaultInstructionsPos) {
      this.props.setInstructionsPosition(defaultInstructionsPos);
    }

    this.state = {
      showingVideo: true,
    };

    // Music Lab currently does not support share and remix
    header.showHeaderForProjectBacked({showShareAndRemix: false});
  }

  componentDidMount() {
    const initialLevelIndex = this.props.currentLevelIndex;

    this.props.setIsLoading(true);

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
    window.addEventListener('beforeunload', event => {
      this.analyticsReporter.endSession();
      // Force a save before the page unloads, if there are unsaved changes.
      // If we need to force a save, prevent navigation so we can save first.
      if (this.musicBlocklyWorkspace.hasUnsavedChanges()) {
        this.musicBlocklyWorkspace.saveCode(true);
        event.preventDefault();
        event.returnValue = '';
      }
    });

    const musicValidator = new MusicValidator(
      this.getIsPlaying,
      this.getPlaybackEvents,
      this.player
    );

    const promises = [];

    // Load library data.
    promises.push(loadLibrary());

    if (this.hasProgression()) {
      this.progressManager = new ProgressManager(
        this.props.currentLevelIndex,
        musicValidator,
        this.onProgressChange
      );

      // Load progress data for current step.
      promises.push(this.loadProgressionStep());
    }

    Promise.all(promises)
      .then(values => {
        this.library = values[0];

        if (getBlockMode() === BlockMode.SIMPLE2) {
          this.sequencer = new Simple2Sequencer(this.library);
        } else {
          this.sequencer = new MusicPlayerStubSequencer();
        }

        Globals.setLibrary(this.library);
        Globals.setPlayer(this.player);

        this.setAllowedSoundsForProgress();

        this.musicBlocklyWorkspace
          .init(
            document.getElementById('blockly-div'),
            this.onBlockSpaceChange,
            this.player,
            this.getStartSources(),
            this.progressManager?.getCurrentStepDetails().toolbox,
            this.props.currentLevelId,
            this.props.currentScriptId,
            this.props.channelId
          )
          .then(() => {
            this.musicBlocklyWorkspace.addSaveEventListener(
              ProjectManagerEvent.SaveStart,
              () => {
                this.props.setProjectUpdatedSaving();
              }
            );
            this.musicBlocklyWorkspace.addSaveEventListener(
              ProjectManagerEvent.SaveSuccess,
              status => {
                this.props.setProjectUpdatedAt(status.updatedAt);
              }
            );
            this.musicBlocklyWorkspace.addSaveEventListener(
              ProjectManagerEvent.SaveNoop,
              status => {
                this.props.setProjectUpdatedAt(status.updatedAt);
              }
            );
            this.musicBlocklyWorkspace.addSaveEventListener(
              ProjectManagerEvent.SaveFail,
              () => {
                this.props.setProjectUpdatedError();
              }
            );
            this.player.initialize(this.library);
            setInterval(this.updateTimer, 1000 / 30);

            // If the level changed while we were loading, then hand off
            // to handlePanelChange to load that new level.
            if (this.props.currentLevelIndex !== initialLevelIndex) {
              this.handlePanelChange();
            } else {
              this.props.setIsLoading(false);
            }
          });
      })
      .catch(error => {
        this.onError(error);
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

    if (prevProps.currentLevelIndex !== this.props.currentLevelIndex) {
      this.goToPanel();
    }

    if (
      prevProps.selectedBlockId !== this.props.selectedBlockId &&
      !this.props.isPlaying
    ) {
      this.musicBlocklyWorkspace.selectBlock(this.props.selectedBlockId);
    }

    // Using stringified JSON for deep comparison
    if (
      JSON.stringify(prevProps.currentlyPlayingBlockIds) !==
      JSON.stringify(this.props.currentlyPlayingBlockIds)
    ) {
      this.updateHighlightedBlocks();
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

  onProgressChange = () => {
    const currentState = this.progressManager.getCurrentState();
    this.props.setCurrentProgressState(currentState);

    // Tell the external system (if there is one) about the success.
    if (this.hasLevels() && currentState.satisfied) {
      this.props.sendSuccessReport('music');
    }
  };

  onError = error => {
    this.props.setIsPageError(true);
    logError(error);
  };

  // Returns whether we just have a standalone level.
  isStandaloneLevel = () => {
    return this.props.progressLevelType === ProgressLevelType.LEVEL;
  };

  // Returns whether we have levels.
  hasLevels = () => {
    return this.props.progressLevelType === ProgressLevelType.SCRIPT_LEVEL;
  };

  // Returns whether we have a progression file.
  hasProgressionFile = () => {
    return AppConfig.getValue('load-progression') === 'true';
  };

  // Returns whether we have a progression.
  // Note that even a standalone level has a progression in the sense that we
  // will show instructions and feedback, but we'll only show them for that
  // standalone level.
  hasProgression = () => {
    return (
      this.isStandaloneLevel() || this.hasLevels() || this.hasProgressionFile()
    );
  };

  hasNoProgressHeader = () => {
    return this.isStandaloneLevel() || this.props.inIncubator;
  };

  getIsPlaying = () => {
    return this.props.isPlaying;
  };

  getPlaybackEvents = () => {
    return this.sequencer.getPlaybackEvents();
  };

  // When the user initiates going to the next panel in the app.
  onNextPanel = () => {
    this.progressManager?.next();

    // Tell the external system (if there is one) about the new level.
    if (this.hasLevels() && this.props.navigateToLevelId) {
      const progressState = this.progressManager.getCurrentState();
      const currentPanel = progressState.step;

      // Tell the external system, via the progress redux store, about the
      // new level ID.
      const level = this.props.levels[currentPanel];
      const levelId = '' + level.id;
      this.props.navigateToLevelId(levelId);
    }
  };

  // When the external system lets us know that the user changed level.
  goToPanel = () => {
    this.progressManager?.goToStep(this.props.currentLevelIndex);

    // If we are already loading, then the existing execution of handlePanelChange
    // will detect the change in active level and start loading again.
    if (!this.props.isLabLoading) {
      this.handlePanelChange();
    }
  };

  // Handle a change in panel, including loading necessary data.
  // Also handles a change in the active level index during this load.
  handlePanelChange = async () => {
    let currentLevelIndexLoading;

    this.stopSong();
    this.props.setIsLoading(true);

    do {
      currentLevelIndexLoading = this.props.currentLevelIndex;

      await this.loadProgressionStep();

      this.setToolboxForProgress();
      this.setAllowedSoundsForProgress();

      if (this.props.currentLevelId) {
        // Change levels for the projects system. Only do this if we have a level.
        await this.musicBlocklyWorkspace.changeLevels(
          this.getStartSources(),
          this.props.currentLevelId,
          this.props.currentScriptId
        );
      }
    } while (currentLevelIndexLoading !== this.props.currentLevelIndex);
    this.props.setIsLoading(false);
  };

  setToolboxForProgress = () => {
    if (this.progressManager) {
      const allowedToolbox =
        this.progressManager.getCurrentStepDetails().toolbox;
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
    this.musicBlocklyWorkspace.updateHighlightedBlocks(
      this.props.currentlyPlayingBlockIds
    );
  };

  loadProgressionStep = async () => {
    const progressionSource = this.hasLevels()
      ? LevelSources.LEVELS
      : this.isStandaloneLevel()
      ? LevelSources.LEVEL
      : this.hasProgressionFile()
      ? LevelSources.FILE
      : undefined;

    if (progressionSource) {
      let progressionStep, levelCount;

      try {
        const result = await loadProgressionStepFromSource(
          progressionSource,
          this.props.levelDataPath,
          // Special case: used for progression file:
          this.props.currentLevelIndex
        );
        progressionStep = result.progressionStep;
        levelCount = result.levelCount;
      } catch (e) {
        this.onError(e);
      }

      if (this.hasLevels()) {
        // Special case: we get the level count from the external array of levels.
        this.props.setLevelCount(this.props.levels.length);
      } else {
        this.props.setLevelCount(levelCount);
      }

      this.progressManager.setProgressionStep(progressionStep);
      this.props.setShowInstructions(!!progressionStep);
    }
  };

  clearCode = () => {
    this.musicBlocklyWorkspace.setStartSources(this.getStartSources());

    this.setPlaying(false);
  };

  getStartSources = () => {
    if (this.hasProgression()) {
      return this.progressManager.getProgressionStep().startSources;
    } else {
      const startSourcesFilename = 'startSources' + getBlockMode();
      return require(`@cdo/static/music/${startSourcesFilename}.json`);
    }
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

      // If code has changed mid-playback, clear and re-queue all events in the player
      if (this.props.isPlaying) {
        this.player.stopAllSoundsStillToPlay();
        this.player.playEvents(this.sequencer.getPlaybackEvents());
      }

      this.analyticsReporter.onBlocksUpdated(
        this.musicBlocklyWorkspace.getAllBlocks()
      );
    }

    if (e.type === Blockly.Events.SELECTED) {
      if (
        !this.props.isPlaying &&
        e.newElementId !== this.props.selectedBlockId
      ) {
        this.props.selectBlockId(e.newElementId);
      }
    }

    // This may no-op due to throttling.
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

  togglePlaying = () => {
    this.setPlaying(!this.props.isPlaying);
  };

  playTrigger = id => {
    if (!this.props.isPlaying) {
      return;
    }
    this.analyticsReporter.onButtonClicked('trigger', {id});
    const triggerStartPosition =
      this.musicBlocklyWorkspace.getTriggerStartPosition(
        id,
        this.player.getCurrentPlayheadPosition()
      );
    if (!triggerStartPosition) {
      return;
    }

    this.sequencer.clear();
    this.musicBlocklyWorkspace.executeTrigger(id, triggerStartPosition);
    const playbackEvents = this.sequencer.getPlaybackEvents();
    this.props.addPlaybackEvents({
      events: playbackEvents,
      lastMeasure: this.sequencer.getLastMeasure(),
    });
    this.player.playEvents(playbackEvents);

    this.playingTriggers.push({
      id,
      startPosition: triggerStartPosition,
    });
  };

  compileSong = () => {
    return this.musicBlocklyWorkspace.compileSong({
      getTriggerCount: () => this.playingTriggers.length,
      Sequencer: this.sequencer,
    });
  };

  executeCompiledSong = () => {
    // Clear the events list because it will be populated next.
    this.props.clearPlaybackEvents();

    this.sequencer.clear();
    this.musicBlocklyWorkspace.executeCompiledSong(this.playingTriggers);
    this.props.addPlaybackEvents({
      events: this.sequencer.getPlaybackEvents(),
      lastMeasure: this.sequencer.getLastMeasure(),
    });
  };

  playSong = () => {
    this.player.stopSong();
    this.playingTriggers = [];

    this.compileSong();

    this.executeCompiledSong();
    this.musicBlocklyWorkspace.saveCode(true);

    this.player.playSong(this.sequencer.getPlaybackEvents());

    this.props.setIsPlaying(true);
    this.props.setCurrentPlayheadPosition(1);
    this.props.clearSelectedBlockId();
  };

  stopSong = () => {
    this.player.stopSong();
    this.playingTriggers = [];

    this.executeCompiledSong();

    this.props.setIsPlaying(false);
    this.props.setCurrentPlayheadPosition(0);
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
          progressionStep={this.progressManager.getProgressionStep()}
          currentLevelIndex={this.props.currentLevelIndex}
          levelCount={this.props.levelCount}
          onNextPanel={this.onNextPanel}
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
          instructionsAvailable={!!this.progressManager}
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
        <KeyHandler
          togglePlaying={this.togglePlaying}
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
                  canShowSaveStatus={this.hasNoProgressHeader()}
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
      </AnalyticsContext.Provider>
    );
  }
}

const MusicView = connect(
  state => ({
    // The progress redux store tells us whether we are in a script level
    // or a standalone level.
    progressLevelType: getProgressLevelType(state),

    // The current level index has two potential sources of truth:
    // If we are part of a "script level", then it comes from the current level.
    // Otherwise, we fall back to the music progress manager's current step.
    currentLevelIndex:
      getProgressLevelType(state) === ProgressLevelType.SCRIPT_LEVEL
        ? levelsForLessonId(
            state.progress,
            state.progress.currentLessonId
          ).findIndex(level => level.isCurrentLevel)
        : state.music.currentProgressState.step,

    // When we are in a lesson with multiple levels, they are here.
    levels:
      getProgressLevelType(state) === ProgressLevelType.SCRIPT_LEVEL
        ? levelsForLessonId(state.progress, state.progress.currentLessonId)
        : undefined,

    // The current level ID, whether we're in a lesson with multiple levels, or
    // directly viewing a standalone level.
    currentLevelId: state.progress.currentLevelId,

    // The number of levels.
    levelCount: state.music.levelCount,

    // The URL path for retrieving level_data from the server.
    levelDataPath: getLevelDataPath(state),

    isLabLoading: state.lab?.isLoading,

    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
    signInState: state.currentUser.signInState,

    isPlaying: state.music.isPlaying,
    selectedBlockId: state.music.selectedBlockId,
    timelineAtTop: state.music.timelineAtTop,
    showInstructions: state.music.showInstructions,
    instructionsPosition: state.music.instructionsPosition,
    currentScriptId: state.progress.scriptId,
    currentlyPlayingBlockIds: getCurrentlyPlayingBlockIds(state),
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
      dispatch(setInstructionsPosition(instructionsPosition)),
    setCurrentProgressState: progressState =>
      dispatch(setCurrentProgressState(progressState)),
    navigateToLevelId: levelId => dispatch(navigateToLevelId(levelId)),
    clearPlaybackEvents: () => dispatch(clearPlaybackEvents()),
    addPlaybackEvents: playbackEvents =>
      dispatch(addPlaybackEvents(playbackEvents)),
    setLevelCount: levelCount => dispatch(setLevelCount(levelCount)),
    sendSuccessReport: appType => dispatch(sendSuccessReport(appType)),
    setProjectUpdatedSaving: () => dispatch(setProjectUpdatedSaving()),
    setProjectUpdatedAt: updatedAt => dispatch(setProjectUpdatedAt(updatedAt)),
    setProjectUpdatedError: () => dispatch(setProjectUpdatedError()),
    setIsLoading: isLoading => dispatch(setIsLoading(isLoading)),
    setIsPageError: isPageError => dispatch(setIsPageError(isPageError)),
  })
)(UnconnectedMusicView);

export default MusicView;
