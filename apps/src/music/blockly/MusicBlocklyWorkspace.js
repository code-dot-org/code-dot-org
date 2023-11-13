import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {BlockTypes} from './blockTypes';
import CdoDarkTheme from '@cdo/apps/blockly/themes/cdoDark';
import {getToolbox} from './toolbox';
import {getBlockMode} from '../appConfig';
import {BlockMode} from '../constants';
import {
  FIELD_TRIGGER_START_NAME,
  TriggerStart,
  TRIGGER_FIELD,
} from './constants';
import experiments from '@cdo/apps/util/experiments';
import {GeneratorHelpersSimple2} from './blocks/simple2';
import {Renderers} from '@cdo/apps/blockly/constants';
import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';

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
  }

  triggerIdToEvent = id => `triggeredAtButton-${id}`;

  capitalizeFirst = str => str.replace(/^./, str => str.toUpperCase());

  /**
   * Initialize the Blockly workspace
   * @param {*} container HTML element to inject the workspace into
   * @param {*} onBlockSpaceChange callback fired when any block space change events occur
   * @param {*} isReadOnlyWorkspace is the workspace readonly
   * @param {*} toolbox information about the toolbox
   *
   */
  init(container, onBlockSpaceChange, isReadOnlyWorkspace, toolbox) {
    if (this.workspace) {
      this.workspace.dispose();
    }

    this.container = container;

    const toolboxBlocks = getToolbox(toolbox);

    this.workspace = Blockly.inject(container, {
      toolbox: toolboxBlocks,
      grid: {spacing: 20, length: 0, colour: '#444', snap: true},
      theme: CdoDarkTheme,
      renderer: experiments.isEnabled('zelos')
        ? Renderers.ZELOS
        : Renderers.DEFAULT,
      noFunctionBlockFrame: true,
      zoom: {
        startScale: experiments.isEnabled('zelos') ? 0.9 : 1,
      },
      readOnly: isReadOnlyWorkspace,
    });

    this.resizeBlockly();

    this.workspace.addChangeListener(onBlockSpaceChange);

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
    if (!this.workspace) {
      Lab2MetricsReporter.logWarning('workspace not initialized.');
      return;
    }
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
      Lab2MetricsReporter.logWarning(
        'executeCompiledSong called before compileSong.'
      );
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

  hasTrigger(id) {
    return !!this.codeHooks[this.triggerIdToEvent(id)];
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

  getCode() {
    if (!this.workspace) {
      Lab2MetricsReporter.logWarning('workspace not initialized.');
      return {};
    }
    return Blockly.serialization.workspaces.save(this.workspace);
  }

  getAllBlocks() {
    if (!this.workspace) {
      Lab2MetricsReporter.logWarning('workspace not initialized.');
      return [];
    }
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

  // Load the workspace with the given code.
  loadCode(code) {
    if (!this.workspace) {
      Lab2MetricsReporter.logWarning('workspace not initialized.');
      return;
    }
    this.workspace.clearUndo();
    Blockly.serialization.workspaces.load(code, this.workspace);
  }

  callUserGeneratedCode(fn, args = []) {
    try {
      fn.call(this, ...args);
    } catch (e) {
      Lab2MetricsReporter.logError('Error running user generated code', e);
    }
  }

  undo() {
    this.undoRedo(false);
  }

  redo() {
    this.undoRedo(true);
  }

  canUndo() {
    if (!this.workspace) {
      Lab2MetricsReporter.logWarning('workspace not initialized.');
      return false;
    }
    return this.workspace.getUndoStack().length > 0;
  }

  canRedo() {
    if (!this.workspace) {
      Lab2MetricsReporter.logWarning('workspace not initialized.');
      return false;
    }
    return this.workspace.getRedoStack().length > 0;
  }

  undoRedo(redo) {
    if (!this.workspace) {
      Lab2MetricsReporter.logWarning('workspace not initialized.');
      return;
    }
    this.workspace.undo(redo);
  }
}
