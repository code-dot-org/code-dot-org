/** @file Top-level view for Music */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {connect} from 'react-redux';
import PanelContainer from './PanelContainer';
import Instructions from './Instructions';
import Controls from './Controls';
import Timeline from './Timeline';
import MusicPlayer from '../player/MusicPlayer';
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
import {
  sendSuccessReport,
  navigateToLevelId,
} from '@cdo/apps/code-studio/progressRedux';
import {
  levelsForLessonId,
  getLevelDataPath,
  ProgressLevelType,
  getProgressLevelType,
} from '@cdo/apps/code-studio/progressReduxSelectors';
import {
  setIsLoading,
  setIsPageError,
  setLabReadyForReload,
} from '@cdo/apps/labs/labRedux';
import Simple2Sequencer from '../player/sequencer/Simple2Sequencer';
import MusicPlayerStubSequencer from '../player/sequencer/MusicPlayerStubSequencer';
import {BlockMode} from '../constants';
import header from '../../code-studio/header';
import {
  setProjectUpdatedAt,
  setProjectUpdatedError,
  setProjectUpdatedSaving,
} from '../../code-studio/projectRedux';
import {logError} from '../utils/MusicMetrics';
import musicI18n from '../locale';

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

    /**
     * True if Music Lab is being presented from the Incubator page (i.e. under /projectbeats),
     * false/undefined if as part of a script or single level.
     * */
    inIncubator: PropTypes.bool,

    // populated by Redux
    currentLevelIndex: PropTypes.number,
    levels: PropTypes.array,
    currentLevelId: PropTypes.string,
    levelCount: PropTypes.number,
    levelDataPath: PropTypes.string,
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
    isHeadersShowing: PropTypes.bool,
    sendSuccessReport: PropTypes.func,
    currentScriptId: PropTypes.number,
    setProjectUpdatedSaving: PropTypes.func,
    setProjectUpdatedAt: PropTypes.func,
    setProjectUpdatedError: PropTypes.func,
    setIsLoading: PropTypes.func,
    setIsPageError: PropTypes.func,
    setLevelCount: PropTypes.func,
    source: PropTypes.object,
    labReadyForReload: PropTypes.bool,
    setLabReadyForReload: PropTypes.func,
  };

  constructor(props) {
    super(props);

    if (this.props.appConfig) {
      setAppConfig(this.props.appConfig);
    }

    const bpm = AppConfig.getValue('bpm');
    const key = AppConfig.getValue('key');

    this.player = new MusicPlayer(bpm, key);
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
      changingPanels: false,
    };

    // Music Lab currently does not support share and remix
    header.showHeaderForProjectBacked({showShareAndRemix: false});
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
    window.addEventListener('beforeunload', event => {
      this.analyticsReporter.endSession();
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

        this.musicBlocklyWorkspace.init(
          document.getElementById('blockly-div'),
          this.onBlockSpaceChange,
          this.player,
          this.progressManager?.getCurrentStepDetails().toolbox
        );
        this.player.initialize(this.library);
        setInterval(this.updateTimer, 1000 / 30);
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
    // If we just finished loading the lab, then we need to update the
    // sources in musicBlocklyWorkspace.
    if (
      !prevProps.labReadyForReload &&
      this.props.labReadyForReload &&
      (this.getStartSources() || this.props.source)
    ) {
      let codeToLoad = this.getStartSources();
      if (this.props.source && this.props.source.source) {
        codeToLoad = JSON.parse(this.props.source.source);
      }
      this.musicBlocklyWorkspace.loadCode(codeToLoad);
      this.props.setLabReadyForReload(false);
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
    if (this.isScriptLevel() && currentState.satisfied) {
      this.props.sendSuccessReport('music');
    }
  };

  onError = error => {
    this.props.setIsPageError(true);
    logError(error);
  };

  // Returns whether we just have a single level.
  isSingleLevel = () => {
    return this.props.progressLevelType === ProgressLevelType.LEVEL;
  };

  // Returns whether we have multiple levels.
  isScriptLevel = () => {
    return this.props.progressLevelType === ProgressLevelType.SCRIPT_LEVEL;
  };

  // Returns whether we have a progression.
  // Note that even a single level has a progression in the sense that we
  // will show instructions and feedback, but we'll only show them for that
  // single level.
  hasProgression = () => {
    return this.isSingleLevel() || this.isScriptLevel();
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
    if (this.isScriptLevel() && this.props.navigateToLevelId) {
      const progressState = this.progressManager.getCurrentState();
      const currentPanel = progressState.step;

      // Tell the external system, via the progress redux store, about the
      // new level ID.
      const level = this.props.levels[currentPanel];
      const levelId = '' + level.id;
      this.props.navigateToLevelId(levelId);
    }
  };

  // When the external system lets us know that the user changed level,
  // we need to update our progress manager to reflect that.
  goToPanel = () => {
    this.progressManager?.goToStep(this.props.currentLevelIndex);

    // If we are already changing panels, then the existing execution of handlePanelChange
    // will detect the change in active level and start loading again.
    if (!this.state.changingPanels) {
      this.handlePanelChange();
    }
  };

  // Handle a change in panel for progress and toolbox.
  // Also handles a change in the active level index during this load.
  handlePanelChange = async () => {
    this.setState({changingPanels: true});

    let currentLevelIndexLoading;

    this.stopSong();

    do {
      currentLevelIndexLoading = this.props.currentLevelIndex;

      await this.loadProgressionStep();

      this.setToolboxForProgress();
      this.setAllowedSoundsForProgress();
    } while (currentLevelIndexLoading !== this.props.currentLevelIndex);

    this.setState({changingPanels: false});
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
    let progressionStep;

    try {
      progressionStep = await loadProgressionStepFromSource(
        this.props.levelDataPath
      );
    } catch (e) {
      this.onError(e);
    }

    if (this.isScriptLevel()) {
      // Determine the level count from the external array of levels.
      this.props.setLevelCount(this.props.levels.length);
    } else {
      // This must be a single level.
      this.props.setLevelCount(1);
    }

    this.progressManager.setProgressionStep(progressionStep);
    this.props.setShowInstructions(!!progressionStep);
  };

  clearCode = () => {
    this.musicBlocklyWorkspace.loadCode(this.getStartSources());
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
        id="instructions-area"
        className={classNames(
          moduleStyles.instructionsArea,
          position === InstructionsPositions.TOP
            ? moduleStyles.instructionsTop
            : moduleStyles.instructionsSide
        )}
      >
        <PanelContainer
          id="instructions-panel"
          headerText={musicI18n.panelHeaderInstructions()}
        >
          <Instructions
            progressionStep={this.progressManager.getProgressionStep()}
            showProgressionStep={!this.isScriptLevel()}
            currentLevelIndex={this.props.currentLevelIndex}
            levelCount={this.props.levelCount}
            onNextPanel={this.onNextPanel}
            baseUrl={baseUrl}
            vertical={position !== InstructionsPositions.TOP}
            right={position === InstructionsPositions.RIGHT}
          />
        </PanelContainer>
      </div>
    );
  }

  renderPlayArea(timelineAtTop) {
    return (
      <div
        id="play-area"
        className={classNames(
          moduleStyles.playArea,
          timelineAtTop ? moduleStyles.playAreaTop : moduleStyles.playAreaBottom
        )}
      >
        <div id="controls-area" className={moduleStyles.controlsArea}>
          <PanelContainer
            id="controls-panel"
            headerText={musicI18n.panelHeaderControls()}
          >
            <Controls
              setPlaying={this.setPlaying}
              playTrigger={this.playTrigger}
              top={this.props.timelineAtTop}
              instructionsAvailable={!!this.progressManager}
              toggleInstructions={() => this.toggleInstructions(false)}
              instructionsOnRight={false}
              hasTrigger={this.musicBlocklyWorkspace.hasTrigger.bind(
                this.musicBlocklyWorkspace
              )}
            />
          </PanelContainer>
        </div>

        <div id="timeline-area" className={moduleStyles.timelineArea}>
          <PanelContainer
            id="timeline-panel"
            width="calc(100% - 220px)"
            headerText={musicI18n.panelHeaderTimeline()}
          >
            <Timeline />
          </PanelContainer>
        </div>
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
        <div id="music-lab" className={moduleStyles.musicLab}>
          {showInstructions &&
            instructionsPosition === InstructionsPositions.TOP &&
            this.renderInstructions(InstructionsPositions.TOP)}

          {showVideo && (
            <Video id="initial-modal-0" onClose={this.onVideoClosed} />
          )}

          {timelineAtTop && this.renderPlayArea(true)}

          <div id="work-area" className={moduleStyles.workArea}>
            {showInstructions &&
              instructionsPosition === InstructionsPositions.LEFT &&
              this.renderInstructions(InstructionsPositions.LEFT)}

            <div id="blockly-area" className={moduleStyles.blocklyArea}>
              <div
                id="top-buttons-container"
                className={classNames(
                  moduleStyles.topButtonsContainer,
                  this.props.isHeadersShowing &&
                    moduleStyles.topButtonsContainerWithHeaders
                )}
              >
                <TopButtons
                  clearCode={this.clearCode}
                  uploadSound={file => this.soundUploader.uploadSound(file)}
                  canShowSaveStatus={!this.isScriptLevel()}
                />
              </div>
              <PanelContainer
                id="workspace-panel"
                headerText={musicI18n.panelHeaderWorkspace()}
              >
                <div id="blockly-div" />
              </PanelContainer>
            </div>

            {showInstructions &&
              instructionsPosition === InstructionsPositions.RIGHT &&
              this.renderInstructions(InstructionsPositions.RIGHT)}
          </div>

          {!timelineAtTop && this.renderPlayArea(false)}
        </div>
      </AnalyticsContext.Provider>
    );
  }
}

const MusicView = connect(
  state => ({
    // The progress redux store tells us whether we are in a script level
    // or a single level.
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
    // directly viewing a single level.
    currentLevelId: state.progress.currentLevelId,

    // The number of levels.
    levelCount: state.music.levelCount,

    // The URL path for retrieving level_data from the server.
    levelDataPath: getLevelDataPath(state),

    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
    signInState: state.currentUser.signInState,

    isPlaying: state.music.isPlaying,
    selectedBlockId: state.music.selectedBlockId,
    timelineAtTop: state.music.timelineAtTop,
    showInstructions: state.music.showInstructions,
    instructionsPosition: state.music.instructionsPosition,
    isHeadersShowing: state.music.isHeadersShowing,
    currentScriptId: state.progress.scriptId,
    currentlyPlayingBlockIds: getCurrentlyPlayingBlockIds(state),
    source: state.lab.source,
    labReadyForReload: state.lab.labReadyForReload,
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
    setLabReadyForReload: labReadyForReload =>
      dispatch(setLabReadyForReload(labReadyForReload)),
  })
)(UnconnectedMusicView);

export default MusicView;
