import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {BlockTypes} from './blockTypes';
import {MUSIC_BLOCKS} from './musicBlocks';
import {musicLabDarkTheme} from './themes';
import {getToolbox} from './toolbox';
import FieldSounds from './FieldSounds';
import AppConfig from '../appConfig';
import {
  DEFAULT_TRACK_NAME_EXTENSION,
  DYNAMIC_TRIGGER_EXTENSION,
  PLAY_MULTI_MUTATOR
} from './constants';
import {
  dynamicTriggerExtension,
  getDefaultTrackNameExtension,
  playMultiMutator
} from './extensions';
import experiments from '@cdo/apps/util/experiments';

export default class MusicBlocklyWorkspace {
  constructor() {
    this.codeHooks = {};
  }

  triggerIdToEvent = id => `triggeredAtButton-${id}`;

  init(container, onBlockSpaceChange, player) {
    this.container = container;

    Blockly.blockly_.Extensions.register(
      DYNAMIC_TRIGGER_EXTENSION,
      dynamicTriggerExtension
    );

    Blockly.blockly_.Extensions.register(
      DEFAULT_TRACK_NAME_EXTENSION,
      getDefaultTrackNameExtension(player)
    );

    Blockly.blockly_.Extensions.registerMutator(
      PLAY_MULTI_MUTATOR,
      playMultiMutator
    );

    for (let blockType of Object.keys(MUSIC_BLOCKS)) {
      Blockly.Blocks[blockType] = {
        init: function() {
          this.jsonInit(MUSIC_BLOCKS[blockType].definition);
        }
      };

      Blockly.JavaScript[blockType] = MUSIC_BLOCKS[blockType].generator;
    }

    Blockly.blockly_.fieldRegistry.register('field_sounds', FieldSounds);

    this.workspace = Blockly.inject(container, {
      toolbox: getToolbox(),
      grid: {spacing: 20, length: 0, colour: '#444', snap: true},
      theme: musicLabDarkTheme,
      renderer: experiments.isEnabled('thrasos')
        ? 'cdo_renderer_thrasos'
        : 'cdo_renderer_zelos',
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
        const id = block.getFieldValue('trigger');
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
    // The default is "Advanced".

    const blockMode = AppConfig.getValue('blocks');
    const blockModeUpperFirst = blockMode
      ? blockMode.replace(/^./, str => str.toUpperCase())
      : 'Advanced';
    return 'musicLabSavedCode' + blockModeUpperFirst;
  }

  loadCode() {
    const existingCode = localStorage.getItem(this.getLocalStorageKeyName());
    if (existingCode) {
      const exitingCodeJson = JSON.parse(existingCode);
      Blockly.blockly_.serialization.workspaces.load(
        exitingCodeJson,
        this.workspace
      );
    } else {
      this.resetCode();
    }
  }

  saveCode() {
    const code = Blockly.blockly_.serialization.workspaces.save(this.workspace);
    const codeJson = JSON.stringify(code);
    localStorage.setItem(this.getLocalStorageKeyName(), codeJson);
  }

  resetCode() {
    const blockMode = AppConfig.getValue('blocks');
    let defaultCodeFilename = 'defaultCode';
    if (blockMode === 'simple') {
      defaultCodeFilename = 'defaultCodeSimple';
    }
    if (blockMode === 'tracks') {
      defaultCodeFilename = 'defaultCodeTracks';
    }
    const defaultCode = require(`@cdo/static/music/${defaultCodeFilename}.json`);
    Blockly.blockly_.serialization.workspaces.load(defaultCode, this.workspace);
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
