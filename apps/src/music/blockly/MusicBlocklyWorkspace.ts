import {BlocklyOptions, Workspace, WorkspaceSvg} from 'blockly';
import {Abstract} from 'blockly/core/events/events_abstract';

import {Renderers} from '@cdo/apps/blockly/constants';
import CdoDarkTheme from '@cdo/apps/blockly/themes/cdoDark';
import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import {getBlockMode} from '../appConfig';
import {BlockMode, Triggers} from '../constants';

import {GeneratorHelpersSimple2} from './blocks/simple2';
import {BlockTypes} from './blockTypes';
import {
  FIELD_TRIGGER_START_NAME,
  TriggerStart,
  TRIGGER_FIELD,
} from './constants';
import {getToolbox} from './toolbox';

const experiments = require('@cdo/apps/util/experiments');

const triggerIdToEvent = (id: string) => `triggeredAtButton-${id}`;

type CompiledEvents = {[key: string]: {code: string; args?: string[]}};

/**
 * Wraps the Blockly workspace for Music Lab. Provides functions to setup the
 * workspace view, execute code, and save/load projects.
 */
export default class MusicBlocklyWorkspace {
  private workspace: WorkspaceSvg | Workspace | null;
  private container: HTMLElement | null;
  private codeHooks: {[key: string]: (...args: unknown[]) => void};
  private compiledEvents: CompiledEvents;
  private lastExecutedEvents: CompiledEvents;
  private triggerIdToStartType: {[id: string]: string};
  private headlessMode: boolean;

  constructor(
    private readonly metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    this.workspace = null;
    this.container = null;
    this.codeHooks = {};
    this.compiledEvents = {};
    this.triggerIdToStartType = {};
    this.lastExecutedEvents = {};
    this.headlessMode = false;
  }

  /**
   * Initialize the Blockly workspace
   * @param container HTML element to inject the workspace into
   * @param onBlockSpaceChange callback fired when any block space change events occur
   * @param isReadOnlyWorkspace is the workspace readonly
   * @param toolbox information about the toolbox
   *
   */
  init(
    container: HTMLElement,
    onBlockSpaceChange: (e: Abstract) => void,
    isReadOnlyWorkspace: boolean,
    toolbox: {[key: string]: string[]},
    isRtl: boolean
  ) {
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
      // noFunctionBlockFrame is only used by our custom Blockly wrapper, so we cast this object to BlocklyOptions below
      noFunctionBlockFrame: true,
      zoom: {
        startScale: experiments.isEnabled('zelos') ? 0.9 : 1,
      },
      readOnly: isReadOnlyWorkspace,
      useBlocklyDynamicCategories: true,
      rtl: isRtl,
    } as BlocklyOptions);

    this.resizeBlockly();

    this.workspace.addChangeListener(onBlockSpaceChange);

    this.headlessMode = false;
  }

  /**
   * Initialize the Blockly workspace in headless mode, with no UI.
   * This is useful for instances where code needs to only be loaded and executed.
   */
  initHeadless() {
    if (this.workspace) {
      this.workspace.dispose();
    }
    this.workspace = new Workspace();
    this.headlessMode = true;
  }

  resizeBlockly() {
    if (this.headlessMode || !this.workspace || !this.container) {
      return;
    }

    this.container.style.width = '100%';
    this.container.style.height = '100%';
    Blockly.svgResize(this.workspace as WorkspaceSvg);
  }

  dispose() {
    if (!this.workspace) {
      return;
    }

    this.workspace.dispose();
    this.workspace = null;
  }

  /**
   * Generates executable JavaScript code for all blocks in the workspace.
   *
   * @param scope Global scope to provide the execution runtime
   */
  compileSong(scope: object) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'compileSong called before workspace initialized.'
      );
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
            functionBlock.getChildren(false)[0]
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
        (
          [
            BlockTypes.NEW_TRACK_AT_START,
            BlockTypes.NEW_TRACK_AT_MEASURE,
          ] as string[]
        ).includes(block.type)
      ) {
        if (!this.compiledEvents.tracks) {
          this.compiledEvents.tracks = {code: ''};
        }
        this.compiledEvents.tracks.code +=
          Blockly.JavaScript.blockToCode(block);
      }

      if (
        (
          [
            BlockTypes.TRIGGERED_AT,
            BlockTypes.TRIGGERED_AT_SIMPLE,
            BlockTypes.TRIGGERED_AT_SIMPLE2,
            BlockTypes.NEW_TRACK_ON_TRIGGER,
          ] as string[]
        ).includes(block.type)
      ) {
        const id = block.getFieldValue(TRIGGER_FIELD);
        this.compiledEvents[triggerIdToEvent(id)] = {
          code:
            Blockly.JavaScript.blockToCode(block) + functionImplementationsCode,
          args: ['startPosition'],
        };
        // Also save the value of the trigger start field at compile time so we can
        // compute the correct start time at each invocation.
        this.triggerIdToStartType[triggerIdToEvent(id)] = block.getFieldValue(
          FIELD_TRIGGER_START_NAME
        );
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
      this.compiledEvents,
      '',
      undefined
    ).hooks.forEach(hook => {
      this.codeHooks[hook.name] = hook.func as () => void;
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
   * {@param triggerEvents} a list of trigger events to execute
   */
  executeCompiledSong(
    triggerEvents: {id: string; startPosition: number}[] = []
  ) {
    if (Object.keys(this.compiledEvents).length === 0) {
      this.metricsReporter.logWarning(
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
   * assumed that {@link compileSong()} has already been called and all event
   * hooks have already been generated, as triggers cannot be played until
   * the song has started.
   *
   * @param id ID of the trigger
   */
  executeTrigger(id: string, startPosition: number) {
    const hook = this.codeHooks[triggerIdToEvent(id)];
    if (hook) {
      this.callUserGeneratedCode(hook, [startPosition]);
    }
  }

  /**
   * Executes code for all triggers in the workspace. Useful for assembling
   * all events that could be potentially triggered for preloading sounds.
   */
  executeAllTriggers(startPosition = 0) {
    Triggers.forEach(({id}) => {
      this.executeTrigger(id, startPosition);
    });
  }

  hasTrigger(id: string) {
    return !!this.codeHooks[triggerIdToEvent(id)];
  }

  /**
   * Given the exact current playback position, get the start position of the trigger,
   * adjusted based on when the trigger should play (immediately, next beat, or next measure).
   */
  getTriggerStartPosition(id: string, currentPosition: number) {
    const triggerStart = this.triggerIdToStartType[triggerIdToEvent(id)];

    if (getBlockMode() === BlockMode.ADVANCED) {
      return currentPosition;
    }

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
      this.metricsReporter.logWarning(
        'getCode called before workspace initialized.'
      );
      return {};
    }
    return Blockly.serialization.workspaces.save(this.workspace);
  }

  getAllBlocks() {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'getAllBlocks called before workspace initialized.'
      );
      return [];
    }
    return this.workspace.getAllBlocks();
  }

  updateHighlightedBlocks(playingBlockIds: string[]) {
    if (this.headlessMode) {
      return;
    }
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'updateHighlightedBlocks called before workspace initialized.'
      );
      return;
    }
    // Clear all highlights.
    for (const block of this.workspace.getAllBlocks()) {
      (this.workspace as WorkspaceSvg).highlightBlock(block.id, false);
    }
    // Highlight playing blocks.
    for (const blockId of playingBlockIds) {
      (this.workspace as WorkspaceSvg).highlightBlock(blockId, true);
    }
  }

  // Given a block ID, selects that block.
  // Given undefined, unselects all blocks.
  selectBlock(blockId: string) {
    if (this.headlessMode || this.workspace === null) {
      this.metricsReporter.logWarning(
        'selectBlock called before workspace initialized.'
      );
      return;
    }

    if (blockId) {
      (this.workspace as WorkspaceSvg).getBlockById(blockId)?.select();
    } else {
      (this.workspace as WorkspaceSvg).getAllBlocks().forEach(block => {
        block.unselect();
      });
    }
  }

  getSelectedTriggerId(blockId: string) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'getSelectedTriggerId called before workspace initialized.'
      );
      return undefined;
    }
    const block = this.workspace.getBlockById(blockId);
    if (!block) {
      return undefined;
    }
    const isSelectedBlockTriggerAt =
      block.type === BlockTypes.TRIGGERED_AT_SIMPLE2;
    if (isSelectedBlockTriggerAt) {
      return block.getFieldValue(TRIGGER_FIELD);
    } else {
      return undefined;
    }
  }

  // Load the workspace with the given code.
  loadCode(code: string) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'loadCode called before workspace initialized.'
      );
      return;
    }
    this.workspace.clearUndo();

    // Ensure that we have an extensible object for Blockly.
    const codeCopy = JSON.parse(JSON.stringify(code));

    Blockly.serialization.workspaces.load(codeCopy, this.workspace);
  }

  private callUserGeneratedCode(
    fn: (...args: unknown[]) => void,
    args: unknown[] = []
  ) {
    try {
      fn.call(this, ...args);
    } catch (e) {
      this.metricsReporter.logError(
        'Error running user generated code',
        e as Error
      );
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
      this.metricsReporter.logWarning(
        'canUndo called before workspace initialized.'
      );
      return false;
    }
    return this.workspace.getUndoStack().length > 0;
  }

  canRedo() {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'canRedo called before workspace initialized.'
      );
      return false;
    }
    return this.workspace.getRedoStack().length > 0;
  }

  undoRedo(redo: boolean) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'undoRedo called before workspace initialized.'
      );
      return;
    }
    this.workspace.undo(redo);
  }
}
