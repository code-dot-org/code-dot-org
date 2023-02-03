import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {BlockTypes} from './blockTypes';
import {MUSIC_BLOCKS} from './musicBlocks';
import {musicLabDarkTheme} from './themes';
import {getToolbox} from './toolbox';
import FieldSounds from './FieldSounds';
import {getBlockMode} from '../appConfig';
import {
  DEFAULT_TRACK_NAME_EXTENSION,
  DYNAMIC_TRIGGER_EXTENSION,
  PLAY_MULTI_MUTATOR,
  TRIGGER_FIELD
} from './constants';
import {
  dynamicTriggerExtension,
  getDefaultTrackNameExtension,
  playMultiMutator
} from './extensions';

/**
 * Wraps the Blockly workspace for Music Lab. Provides functions to setup the
 * workspace view, execute code, and save/load projects from local storage.
 */
export default class MusicBlocklyWorkspace {
  constructor() {
    this.codeHooks = {};
  }

  triggerIdToEvent = id => `triggeredAtButton-${id}`;

  capitalizeFirst = str => str.replace(/^./, str => str.toUpperCase());

  /**
   * Initialize the Blockly workspace
   * @param {*} container HTML element to inject the workspace into
   * @param {*} onBlockSpaceChange callback fired when any block space change events occur
   * @param {*} player reference to a {@link MusicPlayer}
   */
  init(container, onBlockSpaceChange, player) {
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
        init: function() {
          this.jsonInit(MUSIC_BLOCKS[blockType].definition);
        }
      };

      Blockly.JavaScript[blockType] = MUSIC_BLOCKS[blockType].generator;
    }

    Blockly.fieldRegistry.register('field_sounds', FieldSounds);

    this.workspace = Blockly.inject(container, {
      toolbox: getToolbox(),
      grid: {spacing: 20, length: 0, colour: '#444', snap: true},
      theme: musicLabDarkTheme,
      renderer: 'cdo_renderer_zelos',
      zoom: {
        startScale: 0.675
      }
    });

    Blockly.setInfiniteLoopTrap();

    this.resizeBlockly();

    // Set initial blocks.
    this.loadCode();

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
   * Generates executable code for all blocks in the workspace, then executes
   * code only for events that are triggered when the play button is clicked
   * (e.g. "When Run", "New Track").
   *
   * @param {*} scope Global scope to provide the execution runtime
   */
  executeSong(scope) {
    Blockly.getGenerator().init(this.workspace);

    const events = {};

    this.workspace.getTopBlocks().forEach(block => {
      if (block.type === BlockTypes.WHEN_RUN) {
        events.whenRunButton = {
          code: Blockly.JavaScript.blockToCode(block)
        };
      }

      if (
        [
          BlockTypes.NEW_TRACK_AT_START,
          BlockTypes.NEW_TRACK_AT_MEASURE
        ].includes(block.type)
      ) {
        if (!events.tracks) {
          events.tracks = {code: ''};
        }
        events.tracks.code += Blockly.JavaScript.blockToCode(block);
      }

      if (
        [
          BlockTypes.TRIGGERED_AT,
          BlockTypes.TRIGGERED_AT_SIMPLE,
          BlockTypes.NEW_TRACK_ON_TRIGGER
        ].includes(block.type)
      ) {
        const id = block.getFieldValue(TRIGGER_FIELD);
        events[this.triggerIdToEvent(id)] = {
          code: Blockly.JavaScript.blockToCode(block)
        };
      }
    });

    this.codeHooks = {};

    CustomMarshalingInterpreter.evalWithEvents(scope, events).hooks.forEach(
      hook => {
        this.codeHooks[hook.name] = hook.func;
      }
    );

    console.log('executeSong', events);

    if (this.codeHooks.whenRunButton) {
      this.callUserGeneratedCode(this.codeHooks.whenRunButton);
    }

    if (this.codeHooks.tracks) {
      this.callUserGeneratedCode(this.codeHooks.tracks);
    }
  }

  /**
   * Executes code for the specific trigger referenced by the ID. It is
   * assumed that {@link executeSong()} has already been called and all event
   * hooks have already been generated, as triggers cannot be played until
   * the song has started.
   *
   * @param {} id ID of the trigger
   */
  executeTrigger(id) {
    const hook = this.codeHooks[this.triggerIdToEvent(id)];
    if (hook) {
      this.callUserGeneratedCode(hook);
    }
  }

  getAllBlocks() {
    return this.workspace.getAllBlocks();
  }

  getLocalStorageKeyName() {
    // Save code for each block mode in a different local storage item.
    // This way, switching block modes will load appropriate user code.

    return 'musicLabSavedCode' + getBlockMode();
  }

  loadCode() {
    const existingCode = localStorage.getItem(this.getLocalStorageKeyName());
    if (existingCode) {
      const exitingCodeJson = JSON.parse(existingCode);
      Blockly.serialization.workspaces.load(exitingCodeJson, this.workspace);
    } else {
      this.resetCode();
    }
  }

  saveCode() {
    const code = Blockly.serialization.workspaces.save(this.workspace);
    const codeJson = JSON.stringify(code);
    localStorage.setItem(this.getLocalStorageKeyName(), codeJson);
  }

  resetCode() {
    const defaultCodeFilename = 'defaultCode' + getBlockMode();
    const defaultCode = require(`@cdo/static/music/${defaultCodeFilename}.json`);
    Blockly.serialization.workspaces.load(defaultCode, this.workspace);
    this.saveCode();
  }

  callUserGeneratedCode(fn) {
    try {
      fn.call(this);
    } catch (e) {
      // swallow error. should we also log this somewhere?
      if (console) {
        console.log(e);
      }
    }
  }
}
