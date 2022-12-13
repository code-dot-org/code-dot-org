import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {BlockTypes} from './blockTypes';
import {MUSIC_BLOCKS} from './musicBlocks';
import {musicLabDarkTheme} from './themes';
import {getBaseToolbox} from './toolbox';
import {Triggers} from '../constants';
import FieldSounds from './FieldSounds';
import AppConfig from '../appConfig';

export default class MusicBlocklyWorkspace {
  constructor() {
    this.codeHooks = {};
  }

  triggerIdToEvent = id => `triggeredAtButton-${id}`;

  init(container, onBlockSpaceChange) {
    this.container = container;

    Blockly.blockly_.Extensions.register(
      'dynamic_trigger_extension',
      function() {
        this.getInput('trigger').appendField(
          new Blockly.FieldDropdown(function() {
            return Triggers.map(trigger => [trigger.dropdownLabel, trigger.id]);
          }),
          'trigger'
        );
      }
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
      toolbox: getBaseToolbox(),
      grid: {spacing: 20, length: 0, colour: '#444', snap: true},
      theme: musicLabDarkTheme,
      renderer: 'cdo_renderer_zelos'
    });

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

      if ([BlockTypes.TRIGGERED_AT, BlockTypes.TRIGGERED_AT_SIMPLE].includes) {
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

    this.callUserGeneratedCode(this.codeHooks.whenRunButton);
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

  loadCode() {
    const existingCode = localStorage.getItem('musicLabSavedCode');
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
    localStorage.setItem('musicLabSavedCode', codeJson);
  }

  resetCode() {
    const defaultCodeFilename =
      AppConfig.getValue('blocks') === 'simple'
        ? 'defaultCodeSimple'
        : 'defaultCode';
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
