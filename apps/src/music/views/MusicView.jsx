/** @file Top-level view for Music */
import {ProcedureBase} from '@blockly/block-shareable-procedures';
import {isEqual} from 'lodash';
import markdownToTxt from 'markdown-to-txt';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import './small-footer-music-overrides.scss';

import {validateBlockCategories} from '@cdo/apps/blockly/utils';
import DCDO from '@cdo/apps/dcdo';
import {START_SOURCES, TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import {setIsLoading, setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {LifecycleEvent} from '@cdo/apps/lab2/utils/LifecycleNotifier';
import AnalyticsReporter from '@cdo/apps/music/analytics/AnalyticsReporter';
import {setExtraCopyrightContent} from '@cdo/apps/sharedComponents/footer/CopyrightDialog/index';
import {SignInState} from '@cdo/apps/templates/currentUserRedux';

import AppConfig from '../appConfig';
import {TRIGGER_FIELD} from '../blockly/constants';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import {
  addToolboxBlocksToWorkspace,
  getToolbox,
  prepareToolboxCategories,
} from '../blockly/toolbox';
import {
  BlockMode,
  LEGACY_DEFAULT_LIBRARY,
  DEFAULT_LIBRARY,
  DEFAULT_PACK,
  DEFAULT_VALIDATION_TIMEOUT,
  Triggers,
} from '../constants';
import {AnalyticsContext} from '../context';
import MusicRegistry from '../MusicRegistry';
import MusicLibrary from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import MusicValidator from '../progress/MusicValidator';
import {
  setPackId,
  setIsPlaying,
  setCurrentPlayheadPosition,
  setStartingPlayheadPosition,
  clearSelectedBlockId,
  selectBlockId,
  setInstructionsPosition,
  setLastMeasure,
  addOrderedFunctions,
  clearPlaybackEvents,
  clearOrderedFunctions,
  getCurrentlyPlayingBlockIds,
  setSoundLoadingProgress,
  setUndoStatus,
  clearCallout,
  setSelectedTriggerId,
  clearSelectedTriggerId,
  getBlockMode,
  addPlaybackEvents,
  setCodeToLoad,
} from '../redux/musicRedux';
import {saveGeneratedSongMetadata} from '../utils/Generate';
import {Key} from '../utils/Notes';
import SoundUploader from '../utils/SoundUploader';

import Callouts from './Callouts';
import ImageAttributions from './ImageAttributions';
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
    levelProperties: PropTypes.object.isRequired,
    initialSources: PropTypes.object,
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
    startingPlayheadPosition: PropTypes.number,
    setStartingPlayheadPosition: PropTypes.func,
    selectedBlockId: PropTypes.string,
    selectBlockId: PropTypes.func,
    setSelectedTriggerId: PropTypes.func,
    clearSelectedBlockId: PropTypes.func,
    clearSelectedTriggerId: PropTypes.func,
    setInstructionsPosition: PropTypes.func,
    currentlyPlayingBlockIdsString: PropTypes.string,
    setIsLoading: PropTypes.func,
    setPageError: PropTypes.func,
    lastMeasure: PropTypes.number,
    clearTimeline: PropTypes.func,
    updateTimeline: PropTypes.func,

    isReadOnlyWorkspace: PropTypes.bool,
    updateLoadProgress: PropTypes.func,
    setUndoStatus: PropTypes.func,
    clearCallout: PropTypes.func,
    isPlayView: PropTypes.bool,
    blockMode: PropTypes.string,
    playbackEvents: PropTypes.array,
    validationState: PropTypes.object,
    canUndo: PropTypes.bool,
    canRedo: PropTypes.bool,
    codeToLoad: PropTypes.string,
    clearCodeToLoad: PropTypes.func,
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
    this.musicBlocklyWorkspace = new MusicBlocklyWorkspace();
    this.soundUploader = new SoundUploader(this.player);
    this.playingTriggers = [];
    this.musicValidator = new MusicValidator(
      this.getIsPlaying,
      this.getPlaybackEvents,
      this.getExemplarPlaybackEvents,
      this.getValidationTimeout,
      this.player,
      this.getPlayingTriggers,
      this.getExemplarValidationMode
    );

    // Set shared shared objects in the MusicRegistry so views outside of this
    // React tree (i.e. Blockly fields) can access them.
    MusicRegistry.player = this.player;
    MusicRegistry.analyticsReporter = this.analyticsReporter;

    // Set default for instructions position.
    const defaultInstructionsPos = AppConfig.getValue(
      'instructions-position'
    )?.toUpperCase();
    if (defaultInstructionsPos) {
      this.props.setInstructionsPosition(defaultInstructionsPos);
    }

    this.state = {
      hasLoadedInitialSounds: false,
      hasRun: false,
      hasEdited: false,
    };

    this.isLevelLoadInProgress = false;
    this.exemplarPlaybackEvents = [];
    this.triggers = [];

    MusicBlocklyWorkspace.setupBlocklyEnvironment(this.props.blockMode);
  }

  componentDidMount() {
    this.onLevelLoad(
      this.props.levelProperties.levelData,
      this.props.initialSources
    );
    this.player.setUpdateLoadProgress(this.props.updateLoadProgress);

    Lab2Registry.getInstance()
      .getLifecycleNotifier()
      .addListener(
        LifecycleEvent.LevelChangeRequested,
        this.levelChangeRequested
      )
      .addListener(LifecycleEvent.LevelLoadCompleted, this.levelLoadCompleted);
  }

  componentWillUnmount() {
    Lab2Registry.getInstance()
      .getLifecycleNotifier()
      .removeListener(
        LifecycleEvent.LevelChangeRequested,
        this.levelChangeRequested
      )
      .removeListener(
        LifecycleEvent.LevelLoadCompleted,
        this.levelLoadCompleted
      );
  }

  levelLoadCompleted = ({appName, levelData}, _channel, initialSources) => {
    if (appName === 'music') {
      this.onLevelLoad(levelData, initialSources);
    }
  };

  // When changing levels, stop playback and reset the initial sounds loaded flag
  // since a new set of sounds will be loaded on the next level.  Also clear the
  // callout that might be showing, and dispose of the Blockly workspace so that
  // any lingering UI is removed.
  levelChangeRequested = () => {
    if (this.props.levelProperties?.appName === 'music') {
      this.stopSong();
      this.setState({
        hasLoadedInitialSounds: false,
        hasRun: false,
        hasEdited: false,
      });
      this.props.clearCallout();
      this.musicBlocklyWorkspace.dispose();

      // Clear any coypright information in the footer.
      setExtraCopyrightContent(undefined);
    }
  };

  async componentDidUpdate(prevProps) {
    this.musicBlocklyWorkspace.resizeBlockly();

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

    if (
      prevProps.currentlyPlayingBlockIdsString !==
      this.props.currentlyPlayingBlockIdsString
    ) {
      this.updateHighlightedBlocks();
    }

    if (prevProps.updateLoadProgress !== this.props.updateLoadProgress) {
      this.player.setUpdateLoadProgress(this.props.updateLoadProgress);
    }

    if (prevProps.isReadOnlyWorkspace !== this.props.isReadOnlyWorkspace) {
      this.musicBlocklyWorkspace.setIsReadOnly(this.props.isReadOnlyWorkspace);
    }

    if (this.props.codeToLoad) {
      // If there is code to load, load it and reset the codeToLoad state.
      this.loadCode(JSON.parse(this.props.codeToLoad));
      this.props.clearCodeToLoad();
      // Reset the hasEdited state since we just loaded code.
      this.setState({hasEdited: false});
    }
  }

  async onLevelLoad(levelData, initialSources) {
    if (this.isLevelLoadInProgress) {
      // Don't attempt to setup the level if a load is already in progress.
      return;
    }
    this.isLevelLoadInProgress = true;

    // Stop playback if needed.
    this.stopSong();

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

    // In start mode, we always show the full toolbox for the given block mode.
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
    const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
    const isEditingExemplar = getAppOptionsEditingExemplar();
    const isViewingExemplar = getAppOptionsViewingExemplar();

    // Music Lab supports two types of toolbox configuration in levels:
    // The toolbox property is a simple list of block types and categories.
    const toolboxAllowList = isStartMode ? undefined : levelData?.toolbox;
    // The toolboxDefinition property is a full toolbox that Blockly can load.
    const localizedToolboxDefinition =
      levelData?.toolboxDefinition &&
      prepareToolboxCategories(levelData.toolboxDefinition);

    await this.loadAndInitializePlayer(libraryName || DEFAULT_LIBRARY);

    this.library.setAllowedSounds(levelData?.sounds);

    let packId = levelData?.packId || initialSources?.labConfig?.music.packId;

    // Prevent "Select a track" dialog from special mode.
    if (isToolboxMode || isStartMode || isEditingExemplar) {
      packId = packId || DEFAULT_PACK;
    }
    this.library.setCurrentPackId(packId);
    this.props.setPackId(packId);
    this.exemplarPlaybackEvents = this.generateExemplarPlaybackEvents();

    if (AppConfig.getValue('js-editor') !== 'true') {
      const isSubmittable = this.props.levelProperties.submittable;
      this.props.isPlayView
        ? this.musicBlocklyWorkspace.initHeadless()
        : this.musicBlocklyWorkspace.init(
            document.getElementById(BLOCKLY_DIV_ID),
            this.onBlockSpaceChange,
            // Initializing the workspace in a read-only state means the toolbox will not be created.
            // On submittable levels, we have the ability to toggle the read-only state mid-level,
            // so we need to initialize the workspace with the toolbox available, and toggle the read-only state
            // afterwards.
            !isSubmittable && this.props.isReadOnlyWorkspace,
            toolboxAllowList,
            this.props.isRtl,
            this.props.blockMode,
            localizedToolboxDefinition,
            this.props.levelProperties.enableBlocklyKeyboardNavigation
          );

      if (
        !this.props.isPlayView &&
        isSubmittable &&
        this.props.isReadOnlyWorkspace
      ) {
        // If this is a submittable level and the workspace is read-only (i.e. the user has submitted),
        // set the read-only state to true.
        this.musicBlocklyWorkspace.setIsReadOnly(true);
      }
    }

    const startSources = this.getStartSources();

    // Check if the user has already made changes to the code on the project level.
    let codeChangedOnProjectLevel = false;
    if (isToolboxMode) {
      const blockMode = this.props.blockMode;
      const levelData = this.props.levelProperties.levelData;
      const levelToolbox = levelData?.toolbox;
      const levelToolboxDefinition = levelData?.toolboxDefinition;
      this.musicBlocklyWorkspace.initializeToolboxMode(
        blockMode,
        levelToolbox,
        levelToolboxDefinition
      );
    } else if (isEditingExemplar || isViewingExemplar) {
      this.loadCode(this.getExemplarSources() || startSources);
    } else if (startSources || initialSources) {
      const predictSettings = this.props.levelProperties.predictSettings;
      const isPredictLevel = !!predictSettings?.isPredictLevel;
      const codeEditableAfterSubmit = predictSettings?.codeEditableAfterSubmit;
      const isEditablePredictLevel = isPredictLevel && codeEditableAfterSubmit;
      let codeToLoad = startSources;
      if (
        initialSources?.source &&
        // Predict levels only use sources loaded from the server if the code is editable
        // after submit, otherwise use the start sources.
        (!isPredictLevel || isEditablePredictLevel)
      ) {
        codeToLoad = JSON.parse(initialSources.source);
        codeChangedOnProjectLevel =
          this.props.levelProperties.isProjectLevel &&
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

    MusicRegistry.showSoundFilters =
      AppConfig.getValue('show-sound-filters') !== 'false' &&
      (AppConfig.getValue('show-sound-filters') === 'true' ||
        levelData?.showSoundFilters);

    MusicRegistry.showSoundsPanelInSoundsMode =
      !!levelData?.showSoundsPanelInSoundsMode;

    MusicRegistry.sortUnrestrictedPacksByType =
      !!levelData?.sortUnrestrictedPacksByType ||
      AppConfig.getValue('sort-unrestricted-packs-by-type') === 'true';

    MusicRegistry.hideAiTemperature =
      levelData?.hideAiTemperature ||
      AppConfig.getValue('hide-ai-temperature') === 'true';

    MusicRegistry.showAiTemperatureExplanation =
      levelData?.showAiTemperatureExplanation ||
      AppConfig.getValue('show-ai-temperature-explanation') === 'true';

    MusicRegistry.showAiGenerateAgainHelp =
      levelData?.showAiGenerateAgainHelp ||
      AppConfig.getValue('show-ai-generate-again-help') === 'true';

    this.props.setStartingPlayheadPosition(1);
    this.isLevelLoadInProgress = false;
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

    // Share copyright information with the component in the footer.
    const imageAttributions = this.library.getImageAttributions();
    if (imageAttributions.length > 0) {
      setExtraCopyrightContent(
        <ImageAttributions attributions={this.library.getImageAttributions()} />
      );
    }
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
    const validationTimeout =
      this.props.levelProperties.levelData?.validationTimeout;
    return validationTimeout
      ? Math.min(validationTimeout, this.props.lastMeasure)
      : DEFAULT_VALIDATION_TIMEOUT;
  };

  getPlaybackEvents = () => {
    return this.props.playbackEvents;
  };

  getPlayingTriggers = () => {
    return this.playingTriggers;
  };

  getCurrentPlayheadPosition = () => {
    return this.player.getCurrentPlayheadPosition();
  };

  updateHighlightedBlocks = () => {
    this.musicBlocklyWorkspace.updateHighlightedBlocks(
      JSON.parse(this.props.currentlyPlayingBlockIdsString)
    );
  };

  clearCode = () => {
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
    const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
    const isEditingExemplar = getAppOptionsEditingExemplar();

    let packId = this.props.levelProperties.levelData?.packId;
    // Prevent "Select a track" dialog from special mode.
    if (isToolboxMode || isStartMode || isEditingExemplar) {
      packId = packId || DEFAULT_PACK;
    }

    // Clear the pack, unless it came from the level data itself.
    if (!packId) {
      this.props.setPackId(null);
      this.library.setCurrentPackId(null);
    }

    // In Start mode, load sources from the default JSON.
    if (isStartMode) {
      const startSourcesFilename = 'startSources' + this.props.blockMode;
      const defaultSources = require(`@cdo/static/music/${startSourcesFilename}.json`);
      this.loadCode(defaultSources);
    } else if (isToolboxMode) {
      const toolbox = getToolbox(
        this.props.blockMode,
        this.props.levelProperties.levelData?.toolbox
      );
      addToolboxBlocksToWorkspace(
        toolbox.contents,
        this.musicBlocklyWorkspace.workspace
      );
      validateBlockCategories(this.musicBlocklyWorkspace.workspace);
    } else {
      // Otherwise, use getStartSources which handles levelData and fallback logic.
      this.loadCode(this.getStartSources());
    }
    this.setPlaying(false);
  };

  getStartSources = () => {
    const templateSources = this.props.levelProperties.templateSources;
    const levelSources = this.props.levelProperties.levelData?.startSources;
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
    if (templateSources && !isStartMode) {
      return templateSources;
    } else if (levelSources) {
      return levelSources;
    } else {
      const defaultStartSourcesFilename = 'startSources' + this.props.blockMode;
      return require(`@cdo/static/music/${defaultStartSourcesFilename}.json`);
    }
  };

  getExemplarValidationMode = () => {
    return (
      this.props.levelProperties.exemplarSettings?.validationMode || 'default'
    );
  };

  getExemplarSources = () => {
    return this.props.levelProperties.exemplarSources;
  };

  getExemplarPlaybackEvents = () => {
    return this.exemplarPlaybackEvents;
  };

  generateExemplarPlaybackEvents = () => {
    const exemplarSources = this.getExemplarSources();
    if (!exemplarSources) {
      return [];
    }
    const workspace = new MusicBlocklyWorkspace();
    workspace.initHeadless();
    workspace.loadCode(exemplarSources);
    workspace.compileSong(BlockMode.SIMPLE2);
    const {playbackEvents} = workspace.executeCompiledSong();
    workspace.dispose();
    return playbackEvents;
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

    // Toolbox mode isn't intended to have a fully functional workspace,
    // so we can skip the remaining logic for this event.
    if (Blockly.isToolboxMode) {
      return;
    }
    // Prevent a rapid cycle of workspace resizing from occurring when
    // dragging a block near the bottom of the workspace.
    if (e.type === Blockly.Events.VIEWPORT_CHANGE) {
      return;
    }

    // Skip this pair of events to avoid extra compiles when dragging a block out of the toolbox.
    if (
      e.type === Blockly.Events.TOOLBOX_ITEM_SELECT ||
      e.type === Blockly.Events.CREATE
    ) {
      return;
    }

    if (e.type === Blockly.Events.CHANGE) {
      if (e.element === 'field' && e.name === TRIGGER_FIELD) {
        this.props.setSelectedTriggerId(
          this.musicBlocklyWorkspace.getSelectedTriggerId(e.blockId)
        );
      }
    }

    // Procedure events should regenerate function blocks in the (uncategorized) toolbox.
    // This keeps call blocks in sync when functions are created/deleted/renamed.
    if (
      e instanceof ProcedureBase ||
      e.type === Blockly.Events.FINISHED_LOADING
    ) {
      const workspace = this.musicBlocklyWorkspace;
      if (
        workspace.toolbox?.addFunctionCalls &&
        workspace.toolbox?.type === 'flyout' &&
        workspace.blockMode === BlockMode.SIMPLE2
      ) {
        workspace.generateFunctionBlocks();
      }
    }

    if (e.type === Blockly.Events.FINISHED_LOADING) {
      // Remove any procedures that do not have definitions.
      // This prevents extra call blocks from showing in the toolbox.
      const workspace = this.musicBlocklyWorkspace.workspace;
      const procedureMap = workspace.getProcedureMap();
      procedureMap
        .getProcedures()
        .filter(p => !Blockly.Procedures.getDefinition(p.getName(), workspace))
        .forEach(p => procedureMap.delete(p.id));
      // Adjust the position of any overlapping blocks, including immovable top blocks.
      workspace.cleanUp(true);
    }
    // Update undo status when blocks change.
    const canUndo = this.musicBlocklyWorkspace.canUndo();
    const canRedo = this.musicBlocklyWorkspace.canRedo();
    if (this.props.canUndo !== canUndo || this.props.canRedo !== canRedo) {
      this.props.setUndoStatus({canUndo, canRedo});
    }

    if (e.type === Blockly.Events.SELECTED) {
      if (
        !this.props.isPlaying &&
        e.newElementId !== this.props.selectedBlockId
      ) {
        this.props.selectBlockId(e.newElementId);
      }
      return;
    }

    const codeChanged = this.compileSong();
    if (codeChanged) {
      this.setState({
        hasEdited: true,
      });
      this.executeCompiledSong().then(playbackEvents => {
        // If code has changed mid-playback, clear and re-queue all events in the player
        if (this.props.isPlaying) {
          this.player.playEvents(playbackEvents, true);
        }
      });

      this.analyticsReporter.onBlocksUpdated(
        this.musicBlocklyWorkspace.getAllBlocks()
      );
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

    const data = this.musicBlocklyWorkspace.executeTrigger(
      id,
      triggerStartPosition
    );

    this.props.updateTimeline({
      ...data,
      // Don't overwrite the last measure if the overall song continues after the trigger.
      lastMeasure: Math.max(this.props.lastMeasure, data.lastMeasure),
    });

    this.player.playEvents(data.playbackEvents);

    this.playingTriggers.push({
      id,
      startPosition: triggerStartPosition,
    });
  };

  compileSong = () => {
    const codeChanged = this.musicBlocklyWorkspace.compileSong(
      this.props.blockMode
    );
    // Update the list of triggers that are available in the workspace.
    this.triggers = Triggers.filter(trigger =>
      this.musicBlocklyWorkspace.hasTrigger(trigger.id)
    );
    return codeChanged;
  };

  // Execute a song that has already been compiled from Blockly sources.
  executeCompiledSong = async () => {
    if (AppConfig.getValue('js-editor') === 'true') {
      return [];
    }

    // Sequence out all possible trigger events to preload sounds if necessary.
    const allTriggerEvents = this.musicBlocklyWorkspace.executeAllTriggers();
    const data = this.musicBlocklyWorkspace.executeCompiledSong(
      this.playingTriggers
    );

    // Clear the events list because it will be populated next.
    this.props.clearTimeline();
    this.props.updateTimeline(data);

    await this.preloadSounds([...data.playbackEvents, ...allTriggerEvents]);
    return data.playbackEvents;
  };

  // Execute some song code directly.  Called by the JavaScript editor.
  executeSongCode = code => {
    if (AppConfig.getValue('js-editor') !== 'true') {
      return;
    }

    // Clear the events list because it will be populated next.
    this.props.clearTimeline();

    const data = this.musicBlocklyWorkspace.executeCode(code);

    this.props.updateTimeline(data);

    return this.preloadSounds(data.playbackEvents);
  };

  // Preload sounds.
  // Called by executeCompiledSong and executeSongCode.
  preloadSounds = events => {
    return this.player.preloadSounds(events, (loadTimeMs, soundsLoaded) => {
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
    });
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

    // Also save the current pack and block mode to sources as part of labConfig.
    sourcesToSave.labConfig ??= {};
    sourcesToSave.labConfig.music ??= {};
    if (this.props.packId) {
      sourcesToSave.labConfig.music.packId = this.props.packId;
    }
    sourcesToSave.labConfig.music.blockMode = this.props.blockMode;

    Lab2Registry.getInstance()
      .getProjectManager()
      ?.save(sourcesToSave, forceSave);

    // If we are AI generating, then save metadata for Dance Party.
    if (
      AppConfig.getValue('ai-generate') === 'true' ||
      this.props.levelProperties.levelData.aiCodeGenerate
    ) {
      saveGeneratedSongMetadata(
        Lab2Registry.getInstance().getProjectManager().getChannelId(),
        this.props.packId,
        this.props.playbackEvents,
        this.props.lastMeasure
      );
    }
  };

  loadCode = code => {
    this.musicBlocklyWorkspace.loadCode(code);
    this.saveCode();
  };

  playSong = async () => {
    this.setState({
      hasRun: true,
    });
    this.player.stopSong();
    this.playingTriggers = [];

    this.musicBlocklyWorkspace?.hideChaff();

    this.compileSong();

    const playbackEvents = await this.executeCompiledSong();
    this.saveCode(true);

    this.player.playSong(playbackEvents, this.props.startingPlayheadPosition);

    this.props.setIsPlaying(true);
    this.props.setCurrentPlayheadPosition(this.props.startingPlayheadPosition);
    this.props.clearSelectedBlockId();
    this.props.clearSelectedTriggerId();
  };

  stopSong = () => {
    if (!this.props.isPlaying) {
      return;
    }

    const {hasConditions, message, satisfied} = this.props.validationState;
    // If this level has validation, and the user has seen a validation message,
    // log an attempt.
    if (hasConditions && message) {
      this.analyticsReporter.onValidationAttempt(
        satisfied,
        markdownToTxt(message)
      );
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

  hasTrigger = id => {
    return this.musicBlocklyWorkspace.hasTrigger(id);
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
          disabled={this.props.isPlayView}
        />
        <MusicLabView
          blocklyDivId={BLOCKLY_DIV_ID}
          setPlaying={this.setPlaying}
          playTrigger={this.playTrigger}
          triggers={this.triggers}
          getCurrentPlayheadPosition={this.getCurrentPlayheadPosition}
          updateHighlightedBlocks={this.updateHighlightedBlocks}
          undo={this.undo}
          redo={this.redo}
          clearCode={this.clearCode}
          validator={this.musicValidator}
          player={this.player}
          allowPackSelection={
            this.library?.getHasRestrictedPacks() &&
            !this.props.levelProperties.levelData?.packId &&
            !this.props.isReadOnlyWorkspace
          }
          analyticsReporter={this.analyticsReporter}
          blocklyWorkspace={this.musicBlocklyWorkspace}
          exemplarPlaybackEvents={this.exemplarPlaybackEvents}
          executeCode={
            AppConfig.getValue('js-editor') === 'true' &&
            (code => {
              this.executeSongCode(code);
            })
          }
          hasRun={this.state.hasRun}
          hasEdited={this.state.hasEdited}
          levelProperties={this.props.levelProperties}
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
    blockMode: getBlockMode(state),
    isPlaying: state.music.isPlaying,
    selectedBlockId: state.music.selectedBlockId,
    // Stringify the value to prevent unnecessary re-renders when the array is the same.
    currentlyPlayingBlockIdsString: JSON.stringify(
      getCurrentlyPlayingBlockIds(state)
    ),
    isReadOnlyWorkspace: isReadOnlyWorkspace(state),
    startingPlayheadPosition: state.music.startingPlayheadPosition,
    isPlayView: state.lab.isShareView,
    playbackEvents: state.music.playbackEvents,
    validationState: state.lab.validationState,
    lastMeasure: state.music.lastMeasure,
    canUndo: state.music.canUndo,
    canRedo: state.music.canRedo,
    codeToLoad: state.music.codeToLoad,
  }),
  dispatch => ({
    setPackId: packId => dispatch(setPackId(packId)),
    setIsPlaying: isPlaying => dispatch(setIsPlaying(isPlaying)),
    setCurrentPlayheadPosition: currentPlayheadPosition =>
      dispatch(setCurrentPlayheadPosition(currentPlayheadPosition)),
    setStartingPlayheadPosition: startingPlayheadPosition =>
      dispatch(setStartingPlayheadPosition(startingPlayheadPosition)),
    selectBlockId: blockId => dispatch(selectBlockId(blockId)),
    setSelectedTriggerId: id => dispatch(setSelectedTriggerId(id)),
    clearSelectedTriggerId: () => dispatch(clearSelectedTriggerId()),
    clearSelectedBlockId: () => dispatch(clearSelectedBlockId()),
    setInstructionsPosition: instructionsPosition =>
      dispatch(setInstructionsPosition(instructionsPosition)),
    addOrderedFunctions: orderedFunctions =>
      dispatch(addOrderedFunctions(orderedFunctions)),
    setIsLoading: isLoading => dispatch(setIsLoading(isLoading)),
    setPageError: pageError => dispatch(setPageError(pageError)),
    updateLoadProgress: value => dispatch(setSoundLoadingProgress(value)),
    setUndoStatus: value => dispatch(setUndoStatus(value)),
    clearCallout: id => dispatch(clearCallout()),
    clearTimeline: () => {
      dispatch(clearPlaybackEvents());
      dispatch(clearOrderedFunctions());
    },
    updateTimeline: data => {
      console.table({
        events: data.playbackEvents.length,
        functions: data.orderedFunctions.length,
        lastMeasure: data.lastMeasure,
      });
      dispatch(addPlaybackEvents(data.playbackEvents));
      dispatch(addOrderedFunctions(data.orderedFunctions));
      dispatch(setLastMeasure(data.lastMeasure));
    },
    clearCodeToLoad: () => dispatch(setCodeToLoad(undefined)),
  })
)(UnconnectedMusicView);

export default MusicView;
