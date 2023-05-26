import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {BlockTypes} from './blockTypes';
import {MUSIC_BLOCKS} from './musicBlocks';
import CdoDarkTheme from '@cdo/apps/blockly/themes/cdoDark';
import {getToolbox} from './toolbox';
import FieldSounds from './FieldSounds';
import FieldPattern from './FieldPattern';
import AppConfig, {getBlockMode} from '../appConfig';
import {BlockMode, LOCAL_STORAGE, REMOTE_STORAGE} from '../constants';
import {
  DEFAULT_TRACK_NAME_EXTENSION,
  DOCS_BASE_URL,
  DYNAMIC_TRIGGER_EXTENSION,
  FIELD_CHORD_TYPE,
  FIELD_PATTERN_TYPE,
  FIELD_SOUNDS_TYPE,
  FIELD_TRIGGER_START_NAME,
  PLAY_MULTI_MUTATOR,
  TriggerStart,
  TRIGGER_FIELD,
} from './constants';
import {
  dynamicTriggerExtension,
  getDefaultTrackNameExtension,
  playMultiMutator,
} from './extensions';
import experiments from '@cdo/apps/util/experiments';
import {GeneratorHelpersSimple2} from './blocks/simple2';
import ProjectManagerFactory from '@cdo/apps/labs/projects/ProjectManagerFactory';
import {ProjectManagerStorageType} from '@cdo/apps/labs/types';
import FieldChord from './FieldChord';
import {Renderers} from '@cdo/apps/blockly/constants';
import musicI18n from '../locale';
import LevelChangeManager from '@cdo/apps/labs/LevelChangeManager';

/**
 * Wraps the Blockly workspace for Music Lab. Provides functions to setup the
 * workspace view, execute code, and save/load projects.
 */
export default class MusicBlocklyWorkspace {
  constructor() {
    this.codeHooks = {};
    this.compiledEvents = null;
    this.triggerIdToStartType = {};
    this.lastExecutedEvents = null;
    this.channel = {};
    this.projectManager = null;
    this.levelChangeManager = new LevelChangeManager(
      this.resetProject.bind(this)
    );
  }

  triggerIdToEvent = id => `triggeredAtButton-${id}`;

  capitalizeFirst = str => str.replace(/^./, str => str.toUpperCase());

  /**
   * Initialize the Blockly workspace
   * @param {*} container HTML element to inject the workspace into
   * @param {*} onBlockSpaceChange callback fired when any block space change events occur
   * @param {*} player reference to a {@link MusicPlayer}
   * @param {*} startSources start sources for the current channel
   * @param {*} toolboxAllowList optional object with allowed toolbox entries
   * @param {*} currentLevelId optional level id for the current level
   * @param {*} currentScriptId optional script id for the current script
   * @param {*} channelId optional channel id for the current channel
   *
   * Either currentLevelId or channelId must be provided. If currentLevelId is provided,
   * currentScriptId may optionally be provided as well. If channelId is provided, the
   * project manager will be created for that channel id. Otherwise, we will get the channel
   * for the given level and script.
   */
  async init(
    container,
    onBlockSpaceChange,
    player,
    startSources,
    toolboxAllowList,
    currentLevelId,
    currentScriptId,
    channelId
  ) {
    this.container = container;

    Blockly.Extensions.register(
      DYNAMIC_TRIGGER_EXTENSION,
      dynamicTriggerExtension
    );

    Blockly.Extensions.register(
      DEFAULT_TRACK_NAME_EXTENSION,
      getDefaultTrackNameExtension(player)
    );

    Blockly.Extensions.registerMutator(PLAY_MULTI_MUTATOR, playMultiMutator);

    for (let blockType of Object.keys(MUSIC_BLOCKS)) {
      Blockly.Blocks[blockType] = {
        init: function () {
          this.jsonInit(MUSIC_BLOCKS[blockType].definition);
        },
      };

      Blockly.JavaScript[blockType] = MUSIC_BLOCKS[blockType].generator;
    }

    Blockly.fieldRegistry.register(FIELD_SOUNDS_TYPE, FieldSounds);
    Blockly.fieldRegistry.register(FIELD_PATTERN_TYPE, FieldPattern);
    Blockly.fieldRegistry.register(FIELD_CHORD_TYPE, FieldChord);

    this.workspace = Blockly.inject(container, {
      toolbox: getToolbox(toolboxAllowList),
      grid: {spacing: 20, length: 0, colour: '#444', snap: true},
      theme: CdoDarkTheme,
      renderer: experiments.isEnabled('zelos')
        ? Renderers.ZELOS
        : Renderers.DEFAULT,
      noFunctionBlockFrame: true,
      zoom: {
        startScale: experiments.isEnabled('zelos') ? 0.9 : 1,
      },
    });

    // Remove two default entries in the toolbox's Functions category that
    // we don't want.
    delete Blockly.Blocks.procedures_defreturn;
    delete Blockly.Blocks.procedures_ifreturn;

    // Rename the new function placeholder text for Music Lab specifically.
    Blockly.Msg['PROCEDURES_DEFNORETURN_PROCEDURE'] =
      musicI18n.blockly_functionNamePlaceholder();

    // Wrap the create function block's init function in a function that
    // sets the block's help URL to the appropriate entry in the Music Lab
    // docs, and calls the original init function if present.
    const functionBlock = Blockly.Blocks.procedures_defnoreturn;
    functionBlock.initOriginal = functionBlock.init;
    functionBlock.init = function () {
      this.setHelpUrl(DOCS_BASE_URL + 'create_function');
      this.initOriginal?.();
    };

    Blockly.setInfiniteLoopTrap();

    this.resizeBlockly();

    // Set initial blocks.
    this.projectManager = await this.getProjectManager(
      channelId,
      currentLevelId,
      currentScriptId
    );
    this.loadSources(startSources);

    Blockly.addChangeListener(Blockly.mainBlockSpace, onBlockSpaceChange);

    this.workspace.registerButtonCallback('createVariableHandler', button => {
      Blockly.Variables.createVariableButtonHandler(
        button.getTargetWorkspace(),
        null,
        null
      );
    });
  }

  resizeBlockly() {
    if (!this.workspace) {
      return;
    }

    this.container.style.width = '100%';
    this.container.style.height = '100%';
    Blockly.svgResize(this.workspace);
  }

  /**
   * Generates executable JavaScript code for all blocks in the workspace.
   *
   * @param {*} scope Global scope to provide the execution runtime
   */
  compileSong(scope) {
    Blockly.getGenerator().init(this.workspace);

    this.compiledEvents = {};
    this.triggerIdToStartType = {};

    const topBlocks = this.workspace.getTopBlocks();

    // These are both used for BlockMode.SIMPLE2.
    let functionCallsCode = '';
    let functionImplementationsCode = '';

    if (getBlockMode() === BlockMode.SIMPLE2) {
      // Go through all blocks, specifically looking for functions.
      // As they are found, accumulate one set of code to call all of them,
      // and a second set of code that has their implementations.
      // We'll use the calls only when simulating tracks mode, and the
      // implementations will become part of the runtime code for both when_run,
      // as well as for each new trigger handler.
      topBlocks.forEach(functionBlock => {
        if (functionBlock.type === 'procedures_defnoreturn') {
          // Accumulate some custom code that calls all the functions
          // together, simulating tracks mode.
          const actualFunctionName =
            GeneratorHelpersSimple2.getSafeFunctionName(
              functionBlock.getFieldValue('NAME')
            );
          functionCallsCode += `${actualFunctionName}();
          `;

          // Accumulate some code that has all of the function implementations.
          const functionCode = Blockly.JavaScript.blockToCode(
            functionBlock.getChildren()[0]
          );
          functionImplementationsCode +=
            GeneratorHelpersSimple2.getFunctionImplementation(
              functionBlock.getFieldValue('NAME'),
              functionCode
            );
        }
      });

      // If there's no when_run block, then we'll generate
      // some custom code that first initializes things, and then calls all
      // the functions together, simulating tracks mode.
      if (
        !topBlocks.some(block => block.type === BlockTypes.WHEN_RUN_SIMPLE2)
      ) {
        this.compiledEvents.whenRunButton = {
          code: GeneratorHelpersSimple2.getDefaultWhenRunImplementation(
            functionCallsCode,
            functionImplementationsCode
          ),
        };
      }
    }

    topBlocks.forEach(block => {
      if (getBlockMode() !== BlockMode.SIMPLE2) {
        if (block.type === BlockTypes.WHEN_RUN) {
          this.compiledEvents.whenRunButton = {
            code: Blockly.JavaScript.blockToCode(block),
          };
        }
      } else {
        if (block.type === BlockTypes.WHEN_RUN_SIMPLE2) {
          this.compiledEvents.whenRunButton = {
            code:
              Blockly.JavaScript.blockToCode(block) +
              functionImplementationsCode,
          };
        }
      }

      if (
        [
          BlockTypes.NEW_TRACK_AT_START,
          BlockTypes.NEW_TRACK_AT_MEASURE,
        ].includes(block.type)
      ) {
        if (!this.compiledEvents.tracks) {
          this.compiledEvents.tracks = {code: ''};
        }
        this.compiledEvents.tracks.code +=
          Blockly.JavaScript.blockToCode(block);
      }

      if (
        [
          BlockTypes.TRIGGERED_AT,
          BlockTypes.TRIGGERED_AT_SIMPLE,
          BlockTypes.TRIGGERED_AT_SIMPLE2,
          BlockTypes.NEW_TRACK_ON_TRIGGER,
        ].includes(block.type)
      ) {
        const id = block.getFieldValue(TRIGGER_FIELD);
        this.compiledEvents[this.triggerIdToEvent(id)] = {
          code:
            Blockly.JavaScript.blockToCode(block) + functionImplementationsCode,
          args: ['startPosition'],
        };
        // Also save the value of the trigger start field at compile time so we can
        // compute the correct start time at each invocation.
        this.triggerIdToStartType[this.triggerIdToEvent(id)] =
          block.getFieldValue(FIELD_TRIGGER_START_NAME);
      }
    });

    const currentEventsJson = JSON.stringify(this.compiledEvents);
    const lastExecutedEventsJson = JSON.stringify(this.lastExecutedEvents);

    if (currentEventsJson === lastExecutedEventsJson) {
      console.log("Code hasn't changed since last execute.");
      return false;
    }

    this.codeHooks = {};

    CustomMarshalingInterpreter.evalWithEvents(
      scope,
      this.compiledEvents
    ).hooks.forEach(hook => {
      this.codeHooks[hook.name] = hook.func;
    });

    console.log('Compiled song.', this.compiledEvents);

    return true;
  }

  /**
   * Using JavaScript previously generated by compileSong, above, this function
   * executes that code for events that are triggered when the play button
   * is clicked (e.g. "When Run", "New Track"), as well any trigger events if
   * indicated.
   *
   * {@param triggerEvents} a list of trigger events to execute, in the format
   * { id: <ID of trigger>, startPosition: <playhead position to start from> }
   */
  executeCompiledSong(triggerEvents = []) {
    if (this.compiledEvents === null) {
      console.warn('executeCompiledSong called before compileSong.');
      return;
    }

    console.log('Executing compiled song.');

    if (this.codeHooks.whenRunButton) {
      this.callUserGeneratedCode(this.codeHooks.whenRunButton);
    }

    if (this.codeHooks.tracks) {
      this.callUserGeneratedCode(this.codeHooks.tracks);
    }

    triggerEvents.forEach(triggerEvent => {
      this.executeTrigger(triggerEvent.id, triggerEvent.startPosition);
    });

    this.lastExecutedEvents = this.compiledEvents;
  }

  /**
   * Executes code for the specific trigger referenced by the ID. It is
   * assumed that {@link executeSong()} has already been called and all event
   * hooks have already been generated, as triggers cannot be played until
   * the song has started.
   *
   * @param {} id ID of the trigger
   */
  executeTrigger(id, startPosition) {
    const hook = this.codeHooks[this.triggerIdToEvent(id)];
    if (hook) {
      this.callUserGeneratedCode(hook, [startPosition]);
    }
  }

  /**
   * Given the exact current playback position, get the start position of the trigger,
   * adjusted based on when the trigger should play (immediately, next beat, or next measure).
   */
  getTriggerStartPosition(id, currentPosition) {
    const triggerStart = this.triggerIdToStartType[this.triggerIdToEvent(id)];
    if (!triggerStart) {
      console.warn('No compiled trigger with ID: ' + id);
      return;
    }

    switch (triggerStart) {
      case TriggerStart.IMMEDIATELY:
        return currentPosition;
      case TriggerStart.NEXT_BEAT:
        return Math.ceil(currentPosition * 4) / 4;
      case TriggerStart.NEXT_MEASURE:
        return Math.ceil(currentPosition);
    }
  }

  getProject() {
    return {
      source: Blockly.serialization.workspaces.save(this.workspace),
      channel: this.channel,
    };
  }

  getAllBlocks() {
    return this.workspace.getAllBlocks();
  }

  updateHighlightedBlocks(playingBlockIds) {
    // Clear all highlights.
    Blockly.mainBlockSpace.getAllBlocks().forEach(block => {
      Blockly.mainBlockSpace.highlightBlock(block.id, false);
    });
    // Highlight playing blocks.
    playingBlockIds.forEach(blockId => {
      Blockly.mainBlockSpace.highlightBlock(blockId, true);
    });
  }

  // Given a block ID, selects that block.
  // Given undefined, unselects all blocks.
  selectBlock(blockId) {
    if (blockId) {
      Blockly.mainBlockSpace.getBlockById(blockId).select();
    } else {
      Blockly.mainBlockSpace.getAllBlocks().forEach(block => {
        block.unselect();
      });
    }
  }

  getLocalStorageKeyName() {
    // Save code for each block mode in a different local storage item.
    // This way, switching block modes will load appropriate user code.
    return 'musicLabSavedCode' + getBlockMode();
  }

  // Loads sources using the project manager.  Falls back to the provided default sources.
  async loadSources(startSources) {
    const projectResponse = await this.projectManager.load();
    if (!projectResponse.ok) {
      if (projectResponse.status === 404) {
        // This is expected if the user has never saved before.
        this.setStartSources(startSources);
      }

      // TODO: Error handling
      return;
    }

    const {source, channel} = await projectResponse.json();
    this.channel = channel;
    if (source && source.source) {
      const existingCodeJson = JSON.parse(source.source);
      Blockly.serialization.workspaces.load(existingCodeJson, this.workspace);
    } else {
      this.setStartSources(startSources);
    }
  }

  saveCode(forceSave = false) {
    this.projectManager.save(this.getProject(), forceSave);
  }

  hasUnsavedChanges() {
    return this.projectManager.hasUnsavedChanges();
  }

  /**
   * Change levels to the given level and script. Handles cleanup of the old level and
   * calls loads code for the new level and script.
   * @param {*} newStartSources Start sources for new level
   * @param {*} newLevelId Id of new level
   * @param {*} newScriptId Id of new script. Can be undefined if this level does
   * not have a script.
   */
  async changeLevels(newStartSources, newLevelId, newScriptId) {
    await this.levelChangeManager.changeLevel(
      this.getProject(),
      this.projectManager,
      newStartSources,
      newLevelId,
      newScriptId
    );
  }

  /**
   * Create a new project manager and load code for the new level and script.
   * @param {*} newStartSources Starter sources for new level
   * @param {*} newLevelId Id of new level
   * @param {*} newScriptId Id of new script. Can be undefined if this level does
   * not have a script.
   */
  async resetProject(newStartSources, newLevelId, newScriptId) {
    this.projectManager = await this.getProjectManager(
      undefined,
      newLevelId,
      newScriptId
    );

    await this.loadSources(newStartSources);
  }

  // Sets start sources.
  setStartSources(startSources) {
    Blockly.serialization.workspaces.load(startSources, this.workspace);
    this.saveCode();
  }

  callUserGeneratedCode(fn, args = []) {
    try {
      fn.call(this, ...args);
    } catch (e) {
      // swallow error. should we also log this somewhere?
      if (console) {
        console.log(e);
      }
    }
  }

  updateToolbox(allowList) {
    const toolbox = getToolbox(allowList);
    this.workspace.updateToolbox(toolbox);
  }

  // Get the project manager for the current storage type.
  // If no storage type is specified in AppConfig, use remote storage.
  async getProjectManager(channelId, currentLevelId, currentScriptId) {
    let storageType = AppConfig.getValue('storage-type');
    if (!storageType) {
      storageType = REMOTE_STORAGE;
    }
    storageType = storageType.toLowerCase();
    const projectManagerStorageType =
      storageType === LOCAL_STORAGE
        ? ProjectManagerStorageType.LOCAL
        : ProjectManagerStorageType.REMOTE;
    if (projectManagerStorageType === ProjectManagerStorageType.LOCAL) {
      // If we're using local storage, we will always define the channel ID as
      // the local storage key name.
      channelId = this.getLocalStorageKeyName();
    }

    // If we have a channel id, create a project manager with that channel id.
    // Otherwise, create a project manager with the current level id and script.
    if (channelId) {
      return ProjectManagerFactory.getProjectManager(
        projectManagerStorageType,
        channelId
      );
    } else {
      return await ProjectManagerFactory.getProjectManagerForLevel(
        projectManagerStorageType,
        currentLevelId,
        currentScriptId
      );
    }
  }

  addSaveEventListener(event, listener) {
    this.projectManager.addEventListener(event, listener);
  }
}
