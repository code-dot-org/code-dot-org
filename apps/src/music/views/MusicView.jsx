/** @file Top-level view for Music */
import {isEqual} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import DCDO from '@cdo/apps/dcdo';
import {
  isReadOnlyWorkspace,
  setIsLoading,
  setPageError,
} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import AnalyticsReporter from '@cdo/apps/music/analytics/AnalyticsReporter';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';

import AppConfig, {getBlockMode} from '../appConfig';
import {TRIGGER_FIELD} from '../blockly/constants';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import {
  BlockMode,
  LEGACY_DEFAULT_LIBRARY,
  DEFAULT_LIBRARY,
  DEFAULT_PACK,
} from '../constants';
import {AnalyticsContext} from '../context';
import Globals from '../globals';
import MusicLibrary from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import AdvancedSequencer from '../player/sequencer/AdvancedSequencer';
import MusicPlayerStubSequencer from '../player/sequencer/MusicPlayerStubSequencer';
import Simple2Sequencer from '../player/sequencer/Simple2Sequencer';
import MusicValidator from '../progress/MusicValidator';
import {
  setPackId,
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
  clearCallout,
  setSelectedTriggerId,
  clearSelectedTriggerId,
} from '../redux/musicRedux';
import {Key} from '../utils/Notes';
import SoundUploader from '../utils/SoundUploader';

import Callouts from './Callouts';
import KeyHandler from './KeyHandler';
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
    // populated by Redux
    currentLevelId: PropTypes.string,
    userId: PropTypes.number,
    userType: PropTypes.string,
    signInState: PropTypes.oneOf(Object.values(SignInState)),
    isRtl: PropTypes.bool,
    packId: PropTypes.string,
    setPackId: PropTypes.func,
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
    levelProperties: PropTypes.object,
    longInstructions: PropTypes.string,
    startingPlayheadPosition: PropTypes.number,
    isProjectLevel: PropTypes.bool,
    isReadOnlyWorkspace: PropTypes.bool,
    updateLoadProgress: PropTypes.func,
    setUndoStatus: PropTypes.func,
    clearCallout: PropTypes.func,
    isPlayView: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    const bpm = AppConfig.getValue('bpm');
    const key = AppConfig.getValue('key');
    this.analyticsReporter = new AnalyticsReporter();
    this.player = new MusicPlayer(
      bpm,
      key && Key[key.toUpperCase()],
      this.analyticsReporter
    );
    Globals.setPlayer(this.player);
    this.musicBlocklyWorkspace = new MusicBlocklyWorkspace();
    this.soundUploader = new SoundUploader(this.player);
    this.playingTriggers = [];
    this.musicValidator = new MusicValidator(
      this.getIsPlaying,
      this.getPlaybackEvents,
      this.getValidationTimeout,
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
      hasLoadedInitialSounds: false,
    };

    MusicBlocklyWorkspace.setupBlocklyEnvironment();
  }

  componentDidMount() {
    if (this.props.levelProperties?.appName === 'music') {
      this.onLevelLoad(
        this.props.levelProperties?.levelData,
        this.props.initialSources
      );
    }
    this.player.setUpdateLoadProgress(this.props.updateLoadProgress);
  }

  async componentDidUpdate(prevProps) {
    this.musicBlocklyWorkspace.resizeBlockly();

    // When changing levels, stop playback and reset the initial sounds loaded flag
    // since a new set of sounds will be loaded on the next level.  Also clear the
    // callout that might be showing, and dispose of the Blockly workspace so that
    // any lingering UI is removed.
    //
    // Note that the current level ID updates before the app name has changed.
    // Therefore, this code will run when we are transitioning away from a music level
    // to another level (music or not).
    if (
      prevProps.currentLevelId !== this.props.currentLevelId &&
      this.props.levelProperties?.appName === 'music'
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
      (!isEqual(prevProps.levelProperties, this.props.levelProperties) ||
        !isEqual(prevProps.initialSources, this.props.initialSources) ||
        prevProps.isReadOnlyWorkspace !== this.props.isReadOnlyWorkspace) &&
      this.props.levelProperties?.appName === 'music'
    ) {
      if (this.props.levelProperties?.appName === 'music') {
        this.onLevelLoad(
          this.props.levelProperties?.levelData,
          this.props.initialSources
        );
      }
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
    // What was previously the default library (mapping to music-library.json)
    // is now 'intro2024' (mapping to music-library-intro2024.json).
    if (libraryName === LEGACY_DEFAULT_LIBRARY) {
      libraryName = DEFAULT_LIBRARY;
    }
    await this.loadAndInitializePlayer(libraryName || DEFAULT_LIBRARY);

    if (getBlockMode() === BlockMode.SIMPLE2) {
      this.sequencer = new Simple2Sequencer();
    } else if (getBlockMode() === BlockMode.ADVANCED) {
      this.sequencer = new AdvancedSequencer();
    } else {
      this.sequencer = new MusicPlayerStubSequencer();
    }

    this.props.isPlayView
      ? this.musicBlocklyWorkspace.initHeadless()
      : this.musicBlocklyWorkspace.init(
          document.getElementById(BLOCKLY_DIV_ID),
          this.onBlockSpaceChange,
          this.props.isReadOnlyWorkspace,
          levelData?.toolbox,
          this.props.isRtl,
          this.sequencer
        );

    this.library.setAllowedSounds(levelData?.sounds);
    this.props.setShowInstructions(
      !!levelData?.text || !!this.props.longInstructions
    );

    let packId = levelData?.packId || initialSources?.labConfig?.music.packId;
    this.library.setCurrentPackId(packId);
    this.props.setPackId(packId);

    //this.sequencer = sequencer;

    // Check if the user has already made changes to the code on the project level.
    let codeChangedOnProjectLevel = false;
    if (this.getStartSources() || initialSources) {
      const startSources = this.getStartSources();
      let codeToLoad = startSources;
      if (initialSources?.source) {
        codeToLoad = JSON.parse(initialSources.source);
        codeChangedOnProjectLevel =
          this.props.isProjectLevel &&
          !isEqual(codeToLoad?.blocks, startSources?.blocks);
      }
      this.loadCode(codeToLoad);
    }

    // If the user has made changes to the code on the project level but does
    // not have a pack ID set, assume they are using the default pack. This is
    // specifically to handle the case where a user starts a project on a library
    // that does not have restricted packs (and is therefore using default),
    // and then later opens their project with a library that does have restricted packs.
    if (
      DCDO.get('music-lab-existing-projects-default-sounds', true) &&
      codeChangedOnProjectLevel &&
      !packId
    ) {
      this.library.setCurrentPackId(DEFAULT_PACK);
      this.props.setPackId(DEFAULT_PACK);
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logInfo('Setting existing project to default pack');
    }

    // Go ahead and compile and execute the initial song, and report initial block stats once code is loaded.
    this.compileSong();
    this.executeCompiledSong();
    this.analyticsReporter.onBlocksUpdated(
      this.musicBlocklyWorkspace.getAllBlocks()
    );

    Globals.setShowSoundFilters(
      AppConfig.getValue('show-sound-filters') !== 'false' &&
        (AppConfig.getValue('show-sound-filters') === 'true' ||
          levelData?.showSoundFilters)
    );

    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('LevelLoad', [
        {
          name: 'Type',
          value: this.props.isProjectLevel ? 'Project' : 'Level',
        },
        {
          name: 'Mode',
          value: this.props.isPlayView
            ? 'Share'
            : this.props.isReadOnlyWorkspace
            ? 'View'
            : 'Edit',
        },
      ]);
  }

  // Load the library and initialize the music player, if not already loaded.
  loadAndInitializePlayer = async libraryName => {
    this.props.setIsLoading(true);

    try {
      this.library = await MusicLibrary.loadLibrary(libraryName);
    } catch (error) {
      this.props.setPageError({
        errorMessage: 'Error loading library',
        error,
        details: {libraryName},
      });
      return;
    }

    this.player.updateConfiguration(
      this.library.getBPM(),
      this.library.getKey()
    );

    this.props.setIsLoading(false);
  };

  getIsPlaying = () => {
    return this.props.isPlaying;
  };

  getValidationTimeout = () => {
    // The level can specify a desired timeout, in measures, when we can start showing
    // non-success validation messages.  That said, if we've just completed playing the
    // last measure before reaching that specified value, we can start showing the
    // messages.
    // If no timeout is specified, then we can starting showing the non-success messages
    // at measure 2.
    return this.props.levelProperties?.levelData?.validationTimeout
      ? Math.min(
          this.props.levelProperties?.levelData?.validationTimeout,
          this.sequencer.getLastMeasure()
        )
      : 2;
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
    // Clear the pack, unless it came from the level data itself.
    if (!this.props.levelProperties?.levelData?.packId) {
      this.props.setPackId(null);
      this.library.setCurrentPackId(null);
    }

    this.loadCode(this.getStartSources());
    this.setPlaying(false);
  };

  getStartSources = () => {
    if (
      getBlockMode() !== BlockMode.SIMPLE2 ||
      !this.props.levelProperties?.levelData?.startSources
    ) {
      const startSourcesFilename = 'startSources' + getBlockMode();
      return require(`@cdo/static/music/${startSourcesFilename}.json`);
    } else {
      return this.props.levelProperties?.levelData.startSources;
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
      orderedFunctions: this.sequencer.getOrderedFunctions?.() || [],
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
      orderedFunctions: this.sequencer.getOrderedFunctions?.() || [],
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
    if (MusicLibrary.getInstance()?.name) {
      sourcesToSave.labConfig = {
        music: {
          library: MusicLibrary.getInstance()?.name,
        },
      };
    }

    // Also save the current pack to sources as part of labConfig.
    if (this.props.packId) {
      sourcesToSave.labConfig ??= {};
      sourcesToSave.labConfig.music ??= {};
      sourcesToSave.labConfig.music.packId = this.props.packId;
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

    // Clear the timeline of triggered events when song is stopped.
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
      <AnalyticsContext.Provider value={this.analyticsReporter}>
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
          player={this.player}
          allowPackSelection={
            this.library?.getHasRestrictedPacks() &&
            !this.props.levelProperties?.levelData?.packId &&
            this.props.isProjectLevel
          }
          analyticsReporter={this.analyticsReporter}
        />
        <Callouts />
      </AnalyticsContext.Provider>
    );
  }
}

const MusicView = connect(
  state => ({
    currentLevelId: state.progress.currentLevelId,

    userId: state.currentUser.userId,
    userType: state.currentUser.userType,
    signInState: state.currentUser.signInState,

    isRtl: state.isRtl,

    packId: state.music.packId,
    isPlaying: state.music.isPlaying,
    selectedBlockId: state.music.selectedBlockId,
    showInstructions: state.music.showInstructions,
    currentlyPlayingBlockIds: getCurrentlyPlayingBlockIds(state),
    initialSources: state.lab.initialSources,
    levelProperties: state.lab.levelProperties,
    longInstructions: state.lab.levelProperties?.longInstructions,
    isProjectLevel: state.lab.levelProperties?.isProjectLevel,
    isReadOnlyWorkspace: isReadOnlyWorkspace(state),
    startingPlayheadPosition: state.music.startingPlayheadPosition,
    isPlayView: state.lab.isShareView,
  }),
  dispatch => ({
    setPackId: packId => dispatch(setPackId(packId)),
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
    clearCallout: id => dispatch(clearCallout()),
  })
)(UnconnectedMusicView);

export default MusicView;
