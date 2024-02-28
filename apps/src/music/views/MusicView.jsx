/** @file Top-level view for Music */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import MusicPlayer from '../player/MusicPlayer';
import AnalyticsReporter from '../analytics/AnalyticsReporter';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';
import {AnalyticsContext} from '../context';
import Globals from '../globals';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import AppConfig, {getBlockMode, setAppConfig} from '../appConfig';
import SoundUploader from '../utils/SoundUploader';
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
  setSelectedTriggerId,
  clearSelectedTriggerId,
} from '../redux/musicRedux';
import KeyHandler from './KeyHandler';
import Callouts from './Callouts';
import {currentLevelIndex} from '@cdo/apps/code-studio/progressReduxSelectors';
import {
  isReadOnlyWorkspace,
  setIsLoading,
  setPageError,
} from '@cdo/apps/lab2/lab2Redux';
import Simple2Sequencer from '../player/sequencer/Simple2Sequencer';
import MusicPlayerStubSequencer from '../player/sequencer/MusicPlayerStubSequencer';
import {BlockMode, DEFAULT_LIBRARY} from '../constants';
import {Key} from '../utils/Notes';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {isEqual} from 'lodash';
import MusicLibrary from '../player/MusicLibrary';
import {setUpBlocklyForMusicLab} from '../blockly/setup';
import {TRIGGER_FIELD} from '../blockly/constants';
import MusicLabView from './MusicLabView';

const BLOCKLY_DIV_ID = 'blockly-div';

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
     * True if Music Lab is being presented from the /projectbeats page,
     * false/undefined if as part of a script or single level.
     * */
    onProjectBeats: PropTypes.bool,

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
    setSelectedTriggerId: PropTypes.func,
    clearSelectedBlockId: PropTypes.func,
    clearSelectedTriggerId: PropTypes.func,
    showInstructions: PropTypes.bool,
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

    if (this.props.appConfig) {
      setAppConfig(this.props.appConfig);
    }

    const bpm = AppConfig.getValue('bpm');
    const key = AppConfig.getValue('key');

    this.player = new MusicPlayer(bpm, key && Key[key.toUpperCase()]);
    Globals.setPlayer(this.player);
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
      loadedLibrary: false,
      currentLibraryName: null,
      hasLoadedInitialSounds: false,
    };

    // If on /projectbeats, we need to manually setup Blockly for Music Lab.
    // Otherwise, this is handled by Lab2.
    if (props.onProjectBeats) {
      setUpBlocklyForMusicLab();
    }
  }

  componentDidMount() {
    // Only record Amplitude analytics events on /projectbeats
    if (this.props.onProjectBeats) {
      this.analyticsReporter.startSession().then(() => {
        this.analyticsReporter.setUserProperties(
          this.props.userId,
          this.props.userType,
          this.props.signInState
        );
      });
    }
    // TODO: the 'beforeunload' callback is advised against as it is not guaranteed to fire on mobile browsers. However,
    // we need a way of reporting analytics when the user navigates away from the page. Check with Amplitude for the
    // correct approach.
    window.addEventListener('beforeunload', event => {
      if (this.props.onProjectBeats) {
        this.analyticsReporter.endSession();
      }
    });

    if (this.props.appName === 'music') {
      this.onLevelLoad(this.props.levelData, this.props.initialSources);
    }
    this.player.setUpdateLoadProgress(this.props.updateLoadProgress);
  }

  async componentDidUpdate(prevProps) {
    this.musicBlocklyWorkspace.resizeBlockly();

    if (
      this.props.onProjectBeats &&
      (prevProps.userId !== this.props.userId ||
        prevProps.userType !== this.props.userType ||
        prevProps.signInState !== this.props.signInState)
    ) {
      this.analyticsReporter.setUserProperties(
        this.props.userId,
        this.props.userType,
        this.props.signInState
      );
    }

    // When changing levels, stop playback and reset the initial sounds loaded flag
    // since a new set of sounds will be loaded on the next level.  Also clear the
    // callout that might be showing, and dispose of the Blockly workspace so that
    // any lingering UI is removed.
    if (
      prevProps.currentLevelIndex !== this.props.currentLevelIndex &&
      this.props.appName === 'music'
    ) {
      this.stopSong();
      this.setState({
        hasLoadedInitialSounds: false,
      });
      this.props.clearCallout();
      this.musicBlocklyWorkspace.dispose();
    }

    if (
      prevProps.selectedBlockId !== this.props.selectedBlockId &&
      !this.props.isPlaying
    ) {
      this.musicBlocklyWorkspace.selectBlock(this.props.selectedBlockId);
      this.props.setSelectedTriggerId(
        this.musicBlocklyWorkspace.getSelectedTriggerId(
          this.props.selectedBlockId
        )
      );
    }

    // Using stringified JSON for deep comparison
    if (
      JSON.stringify(prevProps.currentlyPlayingBlockIds) !==
      JSON.stringify(this.props.currentlyPlayingBlockIds)
    ) {
      this.updateHighlightedBlocks();
    }

    if (prevProps.updateLoadProgress !== this.props.updateLoadProgress) {
      this.player.setUpdateLoadProgress(this.props.updateLoadProgress);
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

    this.musicBlocklyWorkspace.init(
      document.getElementById(BLOCKLY_DIV_ID),
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
      this.loadCode(codeToLoad);
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

    if (getBlockMode() === BlockMode.SIMPLE2) {
      this.sequencer = new Simple2Sequencer();
    } else {
      this.sequencer = new MusicPlayerStubSequencer();
    }

    this.player.updateConfiguration(
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
    if (!this.props.onProjectBeats && this.props.levelData?.startSources) {
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

    if (e.type === Blockly.Events.CHANGE) {
      if (e.element === 'field' && e.name === TRIGGER_FIELD) {
        this.props.setSelectedTriggerId(
          this.musicBlocklyWorkspace.getSelectedTriggerId(e.blockId)
        );
      }
    }

    // Update undo status when blocks change.
    this.props.setUndoStatus({
      canUndo: this.musicBlocklyWorkspace.canUndo(),
      canRedo: this.musicBlocklyWorkspace.canRedo(),
    });

    const codeChanged = this.compileSong();
    if (codeChanged) {
      this.executeCompiledSong().then(() => {
        // If code has changed mid-playback, clear and re-queue all events in the player
        if (this.props.isPlaying) {
          this.player.playEvents(this.sequencer.getPlaybackEvents(), true);
        }
      });

      if (this.props.onProjectBeats) {
        this.analyticsReporter.onBlocksUpdated(
          this.musicBlocklyWorkspace.getAllBlocks()
        );
      }
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
      if (this.props.onProjectBeats) {
        this.analyticsReporter.onButtonClicked('play');
      }
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
    if (this.props.onProjectBeats) {
      this.analyticsReporter.onButtonClicked('trigger', {id});
    }
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

    // Sequence out all possible trigger events to preload sounds if necessary.
    this.sequencer.clear();
    this.musicBlocklyWorkspace.executeAllTriggers();
    const allTriggerEvents = this.sequencer.getPlaybackEvents();

    this.sequencer.clear();
    this.musicBlocklyWorkspace.executeCompiledSong(this.playingTriggers);
    this.props.addPlaybackEvents({
      events: this.sequencer.getPlaybackEvents(),
      lastMeasure: this.sequencer.getLastMeasure(),
    });
    this.props.addOrderedFunctions({
      orderedFunctions: this.sequencer.getOrderedFunctions(),
    });

    return this.player.preloadSounds(
      [...this.sequencer.getPlaybackEvents(), ...allTriggerEvents],
      (loadTimeMs, soundsLoaded) => {
        // Report load time metrics if any sounds were loaded.
        if (soundsLoaded > 0) {
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .reportLoadTime('PreloadSoundLoadTime', loadTimeMs, [
              {
                name: 'LoadType',
                value: this.state.hasLoadedInitialSounds
                  ? 'Subsequent'
                  : 'Initial',
              },
            ]);
        }

        if (!this.state.hasLoadedInitialSounds) {
          Lab2Registry.getInstance().getMetricsReporter().logInfo({
            event: 'InitialSoundsLoaded',
            soundsLoaded,
            loadTimeMs,
          });
          this.setState({
            hasLoadedInitialSounds: true,
          });
        }
      }
    );
  };

  saveCode = (forceSave = false) => {
    // Can't save if this is a read-only workspace.
    if (this.props.isReadOnlyWorkspace) {
      return;
    }
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
    this.props.clearSelectedTriggerId();
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

  render() {
    return (
      <AnalyticsContext.Provider
        value={this.props.onProjectBeats ? this.analyticsReporter : null}
      >
        <KeyHandler
          togglePlaying={this.togglePlaying}
          playTrigger={this.playTrigger}
          uiShortcutsEnabled={
            AppConfig.getValue('ui-keyboard-shortcuts-enabled') === 'true'
          }
        />
        <MusicLabView
          blocklyDivId={BLOCKLY_DIV_ID}
          setPlaying={this.setPlaying}
          playTrigger={this.playTrigger}
          hasTrigger={id => this.musicBlocklyWorkspace.hasTrigger(id)}
          getCurrentPlayheadPosition={this.getCurrentPlayheadPosition}
          updateHighlightedBlocks={this.updateHighlightedBlocks}
          undo={this.undo}
          redo={this.redo}
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
    selectedBlockId: state.music.selectedBlockId,
    showInstructions: state.music.showInstructions,
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
    setSelectedTriggerId: id => dispatch(setSelectedTriggerId(id)),
    clearSelectedTriggerId: () => dispatch(clearSelectedTriggerId()),
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
    clearCallout: id => dispatch(clearCallout()),
  })
)(UnconnectedMusicView);

export default MusicView;
