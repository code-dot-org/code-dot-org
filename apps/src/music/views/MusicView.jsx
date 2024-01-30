/** @file Top-level view for Music */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import AnalyticsReporter from '../analytics/AnalyticsReporter';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {AnalyticsContext} from '../context';
import AppConfig, {getBlockMode} from '../appConfig';
import {loadLibrary} from '../utils/Loader';
import MusicValidator from '../progress/MusicValidator';
import {
  setIsPlaying,
  setCurrentPlayheadPosition,
  clearSelectedBlockId,
  selectBlockId,
  setShowInstructions,
  setInstructionsPosition,
  addPlaybackEvents,
  addOrderedFunctions,
  clearPlaybackEvents,
  clearOrderedFunctions,
  getCurrentlyPlayingBlockIds,
  setSoundLoadingProgress,
  setUndoStatus,
  showCallout,
  clearCallout,
} from '../redux/musicRedux';
import KeyHandler from './KeyHandler';
import Callouts from './Callouts';
import {currentLevelIndex} from '@cdo/apps/code-studio/progressReduxSelectors';
import {
  isReadOnlyWorkspace,
  setIsLoading,
  setPageError,
} from '@cdo/apps/lab2/lab2Redux';
import {DEFAULT_LIBRARY} from '../constants';
import {isEqual} from 'lodash';
import MusicLibrary from '../player/MusicLibrary';
import {setUpBlocklyForMusicLab} from '../blockly/setup';
import MusicLabView from './MusicLabView';
import MusicProgramExecutor from '../MusicProgramExecutor';

/**
 * Top-level container for Music Lab. Manages all views on the page as well as the
 * Blockly workspace and music player.
 *
 * TODO: Split up this component into a pure view and class/component that manages
 * application state.
 */
class UnconnectedMusicView extends React.Component {
  static propTypes = {
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
    playbackEvents: PropTypes.array,
    setIsPlaying: PropTypes.func,
    setCurrentPlayheadPosition: PropTypes.func,
    selectedBlockId: PropTypes.string,
    selectBlockId: PropTypes.func,
    clearSelectedBlockId: PropTypes.func,
    setShowInstructions: PropTypes.func,
    setInstructionsPosition: PropTypes.func,
    clearPlaybackEvents: PropTypes.func,
    clearOrderedFunctions: PropTypes.func,
    addPlaybackEvents: PropTypes.func,
    addOrderedFunctions: PropTypes.func,
    currentlyPlayingBlockIds: PropTypes.array,
    setIsLoading: PropTypes.func,
    setPageError: PropTypes.func,
    initialSources: PropTypes.object,
    levelData: PropTypes.object,
    longInstructions: PropTypes.string,
    startingPlayheadPosition: PropTypes.number,
    isReadOnlyWorkspace: PropTypes.bool,
    updateLoadProgress: PropTypes.func,
    appName: PropTypes.string,
    setUndoStatus: PropTypes.func,
    showCallout: PropTypes.func,
    clearCallout: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.analyticsReporter = new AnalyticsReporter();
    this.musicValidator = new MusicValidator(
      this.getIsPlaying,
      this.getPlaybackEvents,
      this.getCurrentPlayheadPosition
    );

    // Set default for instructions position.
    const defaultInstructionsPos = AppConfig.getValue(
      'instructions-position'
    )?.toUpperCase();
    if (defaultInstructionsPos) {
      this.props.setInstructionsPosition(defaultInstructionsPos);
    }

    const updatePlaybackData = (
      type,
      events,
      orderedFunctions,
      lastMeasure
    ) => {
      if (type === 'replace') {
        this.props.clearPlaybackEvents();
        this.props.clearOrderedFunctions();
      }
      this.props.addPlaybackEvents({events, lastMeasure});
      this.props.addOrderedFunctions({orderedFunctions});
    };

    this.executor = new MusicProgramExecutor(
      updatePlaybackData,
      this.analyticsReporter
    );

    this.state = {
      loadedLibrary: false,
      currentLibraryName: null,
      hasLoadedInitialSounds: false,
    };

    // If in incubator, we need to manually setup Blockly for Music Lab.
    // Otherwise, this is handled by Lab2.
    if (props.inIncubator) {
      setUpBlocklyForMusicLab();
    }
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
    this.executor.setUpdateLoadProgress(this.props.updateLoadProgress);
  }

  async componentDidUpdate(prevProps) {
    this.executor.resizeBlockly();

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

    // When changing levels, stop playback and reset the initial sounds loaded flag
    // since a new set of sounds will be loaded on the next level.  Also clear
    // the callout that's showing.
    if (prevProps.currentLevelIndex !== this.props.currentLevelIndex) {
      this.stopSong();
      this.setState({
        hasLoadedInitialSounds: false,
      });
      this.props.clearCallout();
    }

    if (
      prevProps.selectedBlockId !== this.props.selectedBlockId &&
      !this.props.isPlaying
    ) {
      this.executor.selectBlock(this.props.selectedBlockId);
    }

    // Using stringified JSON for deep comparison
    if (
      JSON.stringify(prevProps.currentlyPlayingBlockIds) !==
      JSON.stringify(this.props.currentlyPlayingBlockIds)
    ) {
      this.updateHighlightedBlocks();
    }

    if (prevProps.updateLoadProgress !== this.props.updateLoadProgress) {
      this.executor.setUpdateLoadProgress(this.props.updateLoadProgress);
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
    await this.loadAndInitializePlayer(libraryName || DEFAULT_LIBRARY);

    this.executor.onLevelChange(
      'blockly-div',
      this.onBlockSpaceChange,
      this.props.isReadOnlyWorkspace,
      levelData?.toolbox
    );

    this.library.setAllowedSounds(levelData?.sounds);
    this.props.setShowInstructions(
      !!levelData?.text || !!this.props.longInstructions
    );

    if (this.getStartSources() || initialSources) {
      let codeToLoad = this.getStartSources();
      if (initialSources?.source) {
        codeToLoad = JSON.parse(initialSources.source);
      }
      this.executor.loadCode(codeToLoad);
    }
  }

  // Load the library and initialize the music player, if not already loaded.
  loadAndInitializePlayer = async libraryName => {
    if (this.state.currentLibraryName === libraryName) {
      // Already loaded this library, no need to load again.
      return;
    }

    this.props.setIsLoading(true);

    try {
      this.library = await loadLibrary(libraryName);
      MusicLibrary.setCurrent(this.library);
    } catch (error) {
      this.props.setPageError({
        errorMessage: 'Error loading library',
        error,
        details: {libraryName},
      });
      return;
    }

    this.executor.updateConfiguration(
      libraryName,
      this.library.getBPM(),
      this.library.getKey()
    );

    this.setState({
      currentLibraryName: libraryName,
    });

    this.props.setIsLoading(false);
  };

  getIsPlaying = () => {
    return this.props.isPlaying;
  };

  getPlaybackEvents = () => {
    return this.props.playbackEvents;
  };

  getCurrentPlayheadPosition = () => {
    return this.executor.getCurrentPlayheadPosition();
  };

  updateHighlightedBlocks = () => {
    this.executor.updateHighlightedBlocks(this.props.currentlyPlayingBlockIds);
  };

  clearCode = () => {
    this.executor.loadCode(this.getStartSources());
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
      this.executor.cancelPreviews();
      return;
    }

    // Prevent a rapid cycle of workspace resizing from occurring when
    // dragging a block near the bottom of the workspace.
    if (e.type === Blockly.Events.VIEWPORT_CHANGE) {
      return;
    }

    // Update undo status when blocks change.
    this.props.setUndoStatus({
      canUndo: this.executor.canUndo(),
      canRedo: this.executor.canRedo(),
    });

    this.executor.onWorkspaceChange(this.props.isPlaying);

    if (e.type === Blockly.Events.SELECTED) {
      if (
        !this.props.isPlaying &&
        e.newElementId !== this.props.selectedBlockId
      ) {
        this.props.selectBlockId(e.newElementId);
      }
    }
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
    this.executor.playTrigger(id);
  };

  playSong = () => {
    this.executor.playSong(this.props.startingPlayheadPosition);

    this.props.setIsPlaying(true);
    this.props.setCurrentPlayheadPosition(this.props.startingPlayheadPosition);
    this.props.clearSelectedBlockId();
  };

  stopSong = () => {
    if (!this.props.isPlaying) {
      return;
    }

    this.executor.stopSong();

    this.props.setIsPlaying(false);
    this.props.setCurrentPlayheadPosition(this.props.startingPlayheadPosition);
  };

  render() {
    return (
      <AnalyticsContext.Provider value={this.analyticsReporter}>
        <KeyHandler
          togglePlaying={this.togglePlaying}
          playTrigger={this.playTrigger}
          uiShortcutsEnabled={
            AppConfig.getValue('ui-keyboard-shortcuts-enabled') === 'true'
          }
        />
        <MusicLabView
          setPlaying={this.setPlaying}
          playTrigger={this.playTrigger}
          hasTrigger={id => this.executor.hasTrigger(id)}
          getCurrentPlayheadPosition={this.getCurrentPlayheadPosition}
          updateHighlightedBlocks={this.updateHighlightedBlocks}
          undo={() => this.executor.undo()}
          redo={() => this.executor.redo()}
          clearCode={this.clearCode}
          validator={this.musicValidator}
        />
        <Callouts />
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
    playbackEvents: state.music.playbackEvents,
    selectedBlockId: state.music.selectedBlockId,
    currentlyPlayingBlockIds: getCurrentlyPlayingBlockIds(state),
    initialSources: state.lab.initialSources,
    levelData: state.lab.levelProperties?.levelData,
    longInstructions: state.lab.levelProperties?.longInstructions,
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
    showCallout: id => dispatch(showCallout(id)),
    clearCallout: () => dispatch(clearCallout()),
  })
)(UnconnectedMusicView);

export default MusicView;
