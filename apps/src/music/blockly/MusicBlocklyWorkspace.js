import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {BlockTypes} from './blockTypes';
import {MUSIC_BLOCKS} from './musicBlocks';
import CdoDarkTheme from '@cdo/apps/blockly/themes/cdoDark';
import {getToolbox} from './toolbox';
import FieldSounds from './FieldSounds';
import FieldPattern from './FieldPattern';
import {getBlockMode} from '../appConfig';
import {BlockMode} from '../constants';
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
import experiments from '@cdo/apps/util/experiments';
import {GeneratorHelpersSimple2} from './blocks/simple2';
import FieldChord from './FieldChord';

/**
 * Wraps the Blockly workspace for Music Lab. Provides functions to setup the
 * workspace view, execute code, and save/load projects from local storage.
 */
export default class MusicBlocklyWorkspace {
  constructor() {
    this.codeHooks = {};
    this.compiledEvents = null;
    this.lastExecutedEvents = null;
  }

  triggerIdToEvent = id => `triggeredAtButton-${id}`;

  capitalizeFirst = str => str.replace(/^./, str => str.toUpperCase());

  /**
   * Initialize the Blockly workspace
   * @param {*} container HTML element to inject the workspace into
   * @param {*} onBlockSpaceChange callback fired when any block space change events occur
   * @param {*} player reference to a {@link MusicPlayer}
   * @param {*} toolboxAllowList optional object with allowed toolbox entries
   */
  init(container, onBlockSpaceChange, player, toolboxAllowList) {
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
    Blockly.fieldRegistry.register('field_pattern', FieldPattern);
    Blockly.fieldRegistry.register('field_chord', FieldChord);

    this.workspace = Blockly.inject(container, {
      toolbox: getToolbox(toolboxAllowList),
      grid: {spacing: 20, length: 0, colour: '#444', snap: true},
      theme: CdoDarkTheme,
      renderer: experiments.isEnabled('zelos')
        ? 'cdo_renderer_zelos'
        : 'cdo_renderer_thrasos',
      noFunctionBlockFrame: true,
      zoom: {
        startScale: experiments.isEnabled('zelos') ? 0.9 : 1
      }
    });

    // Remove two default entries in the toolbox's Functions category that
    // we don't want.
    delete Blockly.Blocks.procedures_defreturn;
    delete Blockly.Blocks.procedures_ifreturn;

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
   * Generates executable JavaScript code for all blocks in the workspace.
   *
   * @param {*} scope Global scope to provide the execution runtime
   */
  compileSong(scope) {
    Blockly.getGenerator().init(this.workspace);

    this.compiledEvents = {};

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
          const actualFunctionName = GeneratorHelpersSimple2.getSafeFunctionName(
            functionBlock.getFieldValue('NAME')
          );
          functionCallsCode += `${actualFunctionName}();
          `;

          // Accumulate some code that has all of the function implementations.
          const functionCode = Blockly.JavaScript.blockToCode(
            functionBlock.getChildren()[0]
          );
          functionImplementationsCode += GeneratorHelpersSimple2.getFunctionImplementation(
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
          )
        };
      }
    }

    topBlocks.forEach(block => {
      if (getBlockMode() !== BlockMode.SIMPLE2) {
        if (block.type === BlockTypes.WHEN_RUN) {
          this.compiledEvents.whenRunButton = {
            code: Blockly.JavaScript.blockToCode(block)
          };
        }
      } else {
        if (block.type === BlockTypes.WHEN_RUN_SIMPLE2) {
          this.compiledEvents.whenRunButton = {
            code:
              Blockly.JavaScript.blockToCode(block) +
              functionImplementationsCode
          };
        }
      }

      if (
        [
          BlockTypes.NEW_TRACK_AT_START,
          BlockTypes.NEW_TRACK_AT_MEASURE
        ].includes(block.type)
      ) {
        if (!this.compiledEvents.tracks) {
          this.compiledEvents.tracks = {code: ''};
        }
        this.compiledEvents.tracks.code += Blockly.JavaScript.blockToCode(
          block
        );
      }

      if (
        [
          BlockTypes.TRIGGERED_AT,
          BlockTypes.TRIGGERED_AT_SIMPLE,
          BlockTypes.TRIGGERED_AT_SIMPLE2,
          BlockTypes.NEW_TRACK_ON_TRIGGER
        ].includes(block.type)
      ) {
        const id = block.getFieldValue(TRIGGER_FIELD);
        this.compiledEvents[this.triggerIdToEvent(id)] = {
          code:
            Blockly.JavaScript.blockToCode(block) + functionImplementationsCode
        };
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
   * executes that code only for events that are triggered when the play button
   * is clicked (e.g. "When Run", "New Track").
   */
  executeCompiledSong() {
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

  updateToolbox(allowList) {
    const toolbox = getToolbox(allowList);
    this.workspace.updateToolbox(toolbox);
  }
}
