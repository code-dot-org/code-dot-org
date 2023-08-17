/** @file Top-level view for Music */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {connect} from 'react-redux';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import Controls from './Controls';
import Timeline from './Timeline';
import MusicPlayer from '../player/MusicPlayer';
import AnalyticsReporter from '../analytics/AnalyticsReporter';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import moduleStyles from './music-view.module.scss';
import {AnalyticsContext} from '../context';
import Globals from '../globals';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import AppConfig, {getBlockMode, setAppConfig} from '../appConfig';
import SoundUploader from '../utils/SoundUploader';
import {loadLibrary} from '../utils/Loader';
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
  addPlaybackEvents,
  addOrderedFunctions,
  clearPlaybackEvents,
  clearOrderedFunctions,
  getCurrentlyPlayingBlockIds,
  setSoundLoadingProgress,
  setUndoStatus,
} from '../redux/musicRedux';
import KeyHandler from './KeyHandler';
import {currentLevelIndex} from '@cdo/apps/code-studio/progressReduxSelectors';
import {
  isReadOnlyWorkspace,
  setIsLoading,
  setPageError,
} from '@cdo/apps/lab2/lab2Redux';
import Simple2Sequencer from '../player/sequencer/Simple2Sequencer';
import MusicPlayerStubSequencer from '../player/sequencer/MusicPlayerStubSequencer';
import {baseAssetUrl, BlockMode} from '../constants';
import musicI18n from '../locale';
import UpdateTimer from './UpdateTimer';
import ValidatorProvider from '@cdo/apps/lab2/progress/ValidatorProvider';
import {Key} from '../utils/Notes';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {setUpBlocklyForMusicLab} from '../blockly/setup';
import {isEqual} from 'lodash';
import HeaderButtons from './HeaderButtons';

/**
 * Top-level container for Music Lab. Manages all views on the page as well as the
 * Blockly workspace and music player.
 *
 * TODO: Split up this component into a pure view and class/component that manages
 * application state.
 */
class UnconnectedMusicView extends React.Component {
  static propTypes = {
    appConfig: PropTypes.object,

    /**
     * True if Music Lab is being presented from the Incubator page (i.e. under /projectbeats),
     * false/undefined if as part of a script or single level.
     * */
    inIncubator: PropTypes.bool,

    // populated by Redux
    currentLevelIndex: PropTypes.number,
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
    clearPlaybackEvents: PropTypes.func,
    clearOrderedFunctions: PropTypes.func,
    addPlaybackEvents: PropTypes.func,
    addOrderedFunctions: PropTypes.func,
    currentlyPlayingBlockIds: PropTypes.array,
    hideHeaders: PropTypes.bool,
    setIsLoading: PropTypes.func,
    setPageError: PropTypes.func,
    initialSources: PropTypes.object,
    levelData: PropTypes.object,
    startingPlayheadPosition: PropTypes.number,
    isReadOnlyWorkspace: PropTypes.bool,
    updateLoadProgress: PropTypes.func,
    appName: PropTypes.string,
    setUndoStatus: PropTypes.func,
  };

  constructor(props) {
    super(props);

    if (this.props.appConfig) {
      setAppConfig(this.props.appConfig);
    }

    const bpm = AppConfig.getValue('bpm');
    const key = AppConfig.getValue('key');

    this.player = new MusicPlayer(bpm, key && Key[key.toUpperCase()]);
    this.analyticsReporter = new AnalyticsReporter();
    this.musicBlocklyWorkspace = new MusicBlocklyWorkspace();
    this.soundUploader = new SoundUploader(this.player);
    this.playingTriggers = [];
    this.musicValidator = new MusicValidator(
      this.getIsPlaying,
      this.getPlaybackEvents,
      this.player
    );

    // Set default for instructions position.
    const defaultInstructionsPos = AppConfig.getValue(
      'instructions-position'
    )?.toUpperCase();
    if (defaultInstructionsPos) {
      this.props.setInstructionsPosition(defaultInstructionsPos);
    }

    this.state = {
      showingVideo: !!this.props.inIncubator,
      loadedLibrary: false,
      currentLibraryName: null,
    };

    setUpBlocklyForMusicLab();
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

    if (this.props.appName === 'music') {
      this.onLevelLoad(this.props.levelData, this.props.initialSources);
    }
  }

  async componentDidUpdate(prevProps) {
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

    // Stop playback when changing levels
    if (prevProps.currentLevelIndex !== this.props.currentLevelIndex) {
      this.stopSong();
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

    // Update components with new level data and new initial sources when
    // the level changes.
    if (
      (!isEqual(prevProps.levelData, this.props.levelData) ||
        !isEqual(prevProps.initialSources, this.props.initialSources)) &&
      this.props.appName === 'music'
    ) {
      this.onLevelLoad(this.props.levelData, this.props.initialSources);
    }
  }

  async onLevelLoad(levelData, initialSources) {
    // Load and initialize the library and player if not done already.
    // Read the library name first from level data, or from the project
    // sources if not present on the level. If there is no library name
    // specified on the level or sources, we will fallback to loading the
    // default library.
    let libraryName = levelData?.library;
    if (!libraryName && initialSources?.labConfig?.music) {
      libraryName = initialSources.labConfig.music.library;
    }
    await this.loadAndInitializePlayer(libraryName);

    this.musicBlocklyWorkspace.init(
      document.getElementById('blockly-div'),
      this.onBlockSpaceChange,
      this.props.isReadOnlyWorkspace,
      levelData?.toolbox
    );

    this.library.setAllowedSounds(levelData?.sounds);
    this.props.setShowInstructions(!!levelData?.text);

    if (this.getStartSources() || initialSources) {
      let codeToLoad = this.getStartSources();
      if (initialSources?.source) {
        codeToLoad = JSON.parse(initialSources.source);
      }
      this.loadCode(codeToLoad);
    }
  }

  // Load the library and initialize the music player, if not already loaded.
  // Currently, we only load one library per progression.
  loadAndInitializePlayer = async libraryName => {
    if (this.state.loadedLibrary) {
      return;
    }

    this.props.setIsLoading(true);

    try {
      this.library = await loadLibrary(libraryName);
    } catch (error) {
      this.props.setPageError({
        errorMessage: 'Error loading library',
        error,
        details: {libraryName: libraryName || 'default'},
      });
      return;
    }

    if (getBlockMode() === BlockMode.SIMPLE2) {
      this.sequencer = new Simple2Sequencer(this.library);
    } else {
      this.sequencer = new MusicPlayerStubSequencer();
    }

    Globals.setLibrary(this.library);
    Globals.setPlayer(this.player);

    try {
      this.player.initialize(this.library, this.props.updateLoadProgress);
    } catch (error) {
      this.props.setPageError({
        errorMessage: 'Error initializing music player',
        error,
        details: {libraryName: libraryName || 'default'},
      });
      return;
    }

    this.setState({
      loadedLibrary: true,
      currentLibraryName: libraryName,
    });

    this.props.setIsLoading(false);
  };

  getIsPlaying = () => {
    return this.props.isPlaying;
  };

  getPlaybackEvents = () => {
    return this.sequencer.getPlaybackEvents();
  };

  getCurrentPlayheadPosition = () => {
    return this.player.getCurrentPlayheadPosition();
  };

  updateHighlightedBlocks = () => {
    this.musicBlocklyWorkspace.updateHighlightedBlocks(
      this.props.currentlyPlayingBlockIds
    );
  };

  clearCode = () => {
    this.loadCode(this.getStartSources());
    this.setPlaying(false);
  };

  getStartSources = () => {
    if (!this.props.inIncubator && this.props.levelData?.startSources) {
      return this.props.levelData.startSources;
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

    // Update undo status when blocks change.
    this.props.setUndoStatus({
      canUndo: this.musicBlocklyWorkspace.canUndo(),
      canRedo: this.musicBlocklyWorkspace.canRedo(),
    });

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
    this.saveCode();
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
    this.props.addOrderedFunctions({
      orderedFunctions: this.sequencer.getOrderedFunctions(),
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
    this.props.clearOrderedFunctions();

    this.sequencer.clear();
    this.musicBlocklyWorkspace.executeCompiledSong(this.playingTriggers);
    this.props.addPlaybackEvents({
      events: this.sequencer.getPlaybackEvents(),
      lastMeasure: this.sequencer.getLastMeasure(),
    });
    this.props.addOrderedFunctions({
      orderedFunctions: this.sequencer.getOrderedFunctions(),
    });
  };

  saveCode = (forceSave = false) => {
    const workspaceCode = this.musicBlocklyWorkspace.getCode();
    const sourcesToSave = {
      source: JSON.stringify(workspaceCode),
    };

    // Save the current library to sources as part of labConfig if present
    if (this.state.currentLibraryName) {
      sourcesToSave.labConfig = {
        music: {
          library: this.state.currentLibraryName,
        },
      };
    }

    Lab2Registry.getInstance()
      .getProjectManager()
      ?.save(sourcesToSave, forceSave);
  };

  loadCode = code => {
    this.musicBlocklyWorkspace.loadCode(code);
    this.saveCode();
  };

  playSong = () => {
    this.player.stopSong();
    this.playingTriggers = [];

    this.compileSong();

    this.executeCompiledSong();
    this.saveCode(true);

    this.player.playSong(
      this.sequencer.getPlaybackEvents(),
      this.props.startingPlayheadPosition
    );

    this.props.setIsPlaying(true);
    this.props.setCurrentPlayheadPosition(this.props.startingPlayheadPosition);
    this.props.clearSelectedBlockId();
  };

  stopSong = () => {
    if (!this.props.isPlaying) {
      return;
    }

    this.player.stopSong();
    this.playingTriggers = [];

    this.executeCompiledSong();

    this.props.setIsPlaying(false);
    this.props.setCurrentPlayheadPosition(this.props.startingPlayheadPosition);
  };

  undo = () => {
    this.musicBlocklyWorkspace.undo();
  };

  redo = () => {
    this.musicBlocklyWorkspace.redo();
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
          hideHeaders={this.props.hideHeaders}
        >
          <Instructions
            baseUrl={baseAssetUrl}
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
            hideHeaders={this.props.hideHeaders}
          >
            <Controls
              setPlaying={this.setPlaying}
              playTrigger={this.playTrigger}
              hasTrigger={this.musicBlocklyWorkspace.hasTrigger.bind(
                this.musicBlocklyWorkspace
              )}
              enableSkipControls={
                AppConfig.getValue('skip-controls-enabled') === 'true'
              }
            />
          </PanelContainer>
        </div>

        <div id="timeline-area" className={moduleStyles.timelineArea}>
          <PanelContainer
            id="timeline-panel"
            width="calc(100% - 220px)"
            headerText={musicI18n.panelHeaderTimeline()}
            hideHeaders={this.props.hideHeaders}
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
        {AppConfig.getValue('keyboard-shortcuts-enabled') === 'true' && (
          <KeyHandler
            togglePlaying={this.togglePlaying}
            playTrigger={this.playTrigger}
          />
        )}
        <UpdateTimer
          getCurrentPlayheadPosition={this.getCurrentPlayheadPosition}
          updateHighlightedBlocks={this.updateHighlightedBlocks}
        />
        <ValidatorProvider validator={this.musicValidator} />
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
              <PanelContainer
                id="workspace-panel"
                headerText={musicI18n.panelHeaderWorkspace()}
                hideHeaders={this.props.hideHeaders}
                rightHeaderContent={
                  <HeaderButtons
                    onClickUndo={this.undo}
                    onClickRedo={this.redo}
                    clearCode={this.clearCode}
                  />
                }
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
    currentLevelIndex: currentLevelIndex(state),

    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
    signInState: state.currentUser.signInState,

    isPlaying: state.music.isPlaying,
    selectedBlockId: state.music.selectedBlockId,
    timelineAtTop: state.music.timelineAtTop,
    showInstructions: state.music.showInstructions,
    instructionsPosition: state.music.instructionsPosition,
    hideHeaders: state.music.hideHeaders,
    currentlyPlayingBlockIds: getCurrentlyPlayingBlockIds(state),
    initialSources: state.lab.initialSources,
    levelData: state.lab.levelProperties?.levelData,
    isReadOnlyWorkspace: isReadOnlyWorkspace(state),
    appName: state.lab.levelProperties?.appName,
    startingPlayheadPosition: state.music.startingPlayheadPosition,
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
    clearPlaybackEvents: () => dispatch(clearPlaybackEvents()),
    clearOrderedFunctions: () => dispatch(clearOrderedFunctions()),
    addPlaybackEvents: playbackEvents =>
      dispatch(addPlaybackEvents(playbackEvents)),
    addOrderedFunctions: orderedFunctions =>
      dispatch(addOrderedFunctions(orderedFunctions)),
    setIsLoading: isLoading => dispatch(setIsLoading(isLoading)),
    setPageError: pageError => dispatch(setPageError(pageError)),
    updateLoadProgress: value => dispatch(setSoundLoadingProgress(value)),
    setUndoStatus: value => dispatch(setUndoStatus(value)),
  })
)(UnconnectedMusicView);

export default MusicView;
