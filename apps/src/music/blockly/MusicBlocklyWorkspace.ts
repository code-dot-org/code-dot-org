import * as GoogleBlockly from 'blockly/core';

import {BLOCK_TYPES, Renderers} from '@cdo/apps/blockly/constants';
import CdoDarkTheme from '@cdo/apps/blockly/themes/cdoDark';
import {
  ProcedureBlock,
  ExtendedBlock,
  ExtendedWorkspaceSvg,
} from '@cdo/apps/blockly/types';
import {
  disableOrphanBlocks,
  validateBlockCategories,
} from '@cdo/apps/blockly/utils';
import {TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {ValueOf} from '@cdo/apps/types/utils';
import {nameComparator} from '@cdo/apps/util/sort';

import CustomMarshalingInterpreter from '../../lib/tools/jsinterpreter/CustomMarshalingInterpreter';
import AppConfig from '../appConfig';
import {BlockMode, Triggers} from '../constants';
import musicI18n from '../locale';
import {FunctionEvents} from '../player/interfaces/FunctionEvents';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import AdvancedSequencer from '../player/sequencer/AdvancedSequencer';
import Simple2Sequencer from '../player/sequencer/Simple2Sequencer';

import {BlockTypes} from './blockTypes';
import {
  FIELD_TRIGGER_START_NAME,
  TriggerStart,
  TRIGGER_FIELD,
} from './constants';
import {setUpBlocklyForMusicLab} from './setup';
import {
  getToolbox,
  addToolboxBlocksToWorkspace,
  toolboxModeCategory,
  getNewStaticCategory,
  getNewDynamicCategory,
  isValidCategory,
  DEFAULT_CATEGORY_NAME,
} from './toolbox';
import {Category, ToolboxData} from './toolbox/types';

const experiments = require('@cdo/apps/util/experiments');

const triggerIdToEvent = (id: string) => `triggeredAtButton-${id}`;

type CompiledEvents = {[key: string]: {code: string; args?: string[]}};

type PlaybackExecutionData = {
  playbackEvents: PlaybackEvent[];
  orderedFunctions: FunctionEvents[];
  lastMeasure: number;
};

const Sequencers = {
  [BlockMode.SIMPLE2]: new Simple2Sequencer(),
  [BlockMode.ADVANCED]: new AdvancedSequencer(),
};

/**
 * Wraps the Blockly workspace for Music Lab. Provides functions to setup the
 * workspace view, execute code, and save/load projects.
 */
export default class MusicBlocklyWorkspace {
  private static isBlocklyEnvironmentSetup = false;

  // Setup the global Blockly environment for Music Lab.
  // This should only happen once per page load.
  public static setupBlocklyEnvironment(blockMode: ValueOf<typeof BlockMode>) {
    if (this.isBlocklyEnvironmentSetup) {
      return;
    }
    setUpBlocklyForMusicLab();

    if (blockMode !== BlockMode.SIMPLE2) {
      Blockly.setInfiniteLoopTrap();
    }

    this.isBlocklyEnvironmentSetup = true;
  }

  private workspace:
    | GoogleBlockly.WorkspaceSvg
    | GoogleBlockly.Workspace
    | null;
  private container: HTMLElement | null;
  private codeHooks: {[key: string]: (...args: unknown[]) => void};
  private compiledEvents: CompiledEvents;
  private lastExecutedEvents: CompiledEvents;
  private triggerIdToStartType: {[id: string]: string};
  private headlessMode: boolean;
  private toolbox?: ToolboxData;
  private blockMode?: ValueOf<typeof BlockMode>;
  private toolboxDefinition?: GoogleBlockly.utils.toolbox.ToolboxInfo;

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
    this.toolbox = undefined;
    this.blockMode = undefined;
  }

  /**
   * Initialize the Blockly workspace
   * @param container HTML element to inject the workspace into
   * @param onBlockSpaceChange callback fired when any block space change events occur
   * @param isReadOnlyWorkspace is the workspace readonly
   * @param isRtl should the workspace use RTL
   * @param blockMode current block mode (e.g. simple2, advanced)
   * @param toolboxAllowList information about the toolbox
   * @param toolboxDefinition Blockly toolbox definition
   *
   */
  init(
    container: HTMLElement,
    onBlockSpaceChange: (e: GoogleBlockly.Events.Abstract) => void,
    isReadOnlyWorkspace: boolean,
    toolboxAllowList: ToolboxData | undefined,
    isRtl: boolean,
    blockMode: ValueOf<typeof BlockMode>,
    toolboxDefinition?: GoogleBlockly.utils.toolbox.ToolboxInfo,
    enableKeyboardNavigation?: boolean
  ) {
    const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

    if (this.workspace) {
      this.workspace.dispose();
    }

    this.container = container;

    this.toolbox = toolboxAllowList;
    this.toolboxDefinition = toolboxDefinition;
    this.blockMode = blockMode;

    // The default toolbox consists of all blocks supported by the
    // current block mode.
    let toolboxBlocks = getToolbox(blockMode);

    if (isToolboxMode) {
      // Toolbox uses the full toolbox with an additional block for managing categories.
      toolboxBlocks.contents.unshift(toolboxModeCategory);
    } else if (toolboxDefinition || toolboxAllowList) {
      toolboxBlocks =
        // Use whichever toolbox configuration is available from the level configuration.
        toolboxDefinition || getToolbox(blockMode, toolboxAllowList);
    }

    // This dialog is used for naming variables, which are only present in advanced mode.
    const customSimpleDialog = function (options: {
      bodyText: string;
      promptPrefill: string;
      onCancel: (p1: string | null) => void;
    }) {
      Blockly.dialog.prompt(
        options.bodyText,
        options.promptPrefill,
        options.onCancel
      );
    };

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
      editBlocks: getAppOptionsEditBlocks(),
      customSimpleDialog,
      comments: true,
      analyticsData: {
        appType: EVENTS.BLOCKLY_APP_TYPE_MUSIC,
      },
      enableKeyboardNavigation,
      showBlockHelp: true,
    } as GoogleBlockly.BlocklyOptions);

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
    this.workspace = new GoogleBlockly.Workspace();
    this.headlessMode = true;
  }

  setIsReadOnly(isReadOnlyWorkspace: boolean) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'setIsReadOnlyWorkspace called before workspace initialized.'
      );
      return;
    }
    this.workspace.setIsReadOnly(isReadOnlyWorkspace);
  }

  /**
   * Set up the Blockly workspace for toolbox mode (levelbuilder).
   * Adds blocks to the workspace based on the level's toolbox configuration.
   * Automatically cleans up the workspace as blocks move.
   */
  initializeToolboxMode(
    blockMode: ValueOf<typeof BlockMode>,
    levelToolbox?: ToolboxData,
    levelToolboxDefinition?: GoogleBlockly.utils.toolbox.ToolboxInfo
  ) {
    const toolbox =
      levelToolboxDefinition || getToolbox(blockMode, levelToolbox);

    const workspace = this.workspace as GoogleBlockly.WorkspaceSvg;
    addToolboxBlocksToWorkspace(toolbox.contents, workspace);

    validateBlockCategories(workspace);
    workspace.cleanUp();
    workspace.addChangeListener(e => {
      if (e.type === Blockly.Events.BLOCK_MOVE) {
        validateBlockCategories(workspace);
      }
    });
  }

  resizeBlockly() {
    if (this.headlessMode || !this.workspace || !this.container) {
      return;
    }

    this.container.style.width = '100%';
    this.container.style.height = '100%';
    Blockly.svgResize(this.workspace as GoogleBlockly.WorkspaceSvg);
  }

  dispose() {
    if (!this.workspace) {
      return;
    }

    this.workspace.dispose();
    this.workspace = null;
  }

  /**
   * Hide any custom fields that are showing.
   */
  hideChaff() {
    if (this.headlessMode) {
      return;
    }
    (this.workspace as GoogleBlockly.WorkspaceSvg)?.hideChaff();
  }

  /**
   * Generates executable JavaScript code for all blocks in the workspace.
   *
   * @param blockMode Current block mode, such as "simple2" or "advanced"
   */
  compileSong(blockMode: ValueOf<typeof BlockMode>) {
    const workspace = this.workspace;
    if (!workspace) {
      this.metricsReporter.logWarning(
        'compileSong called before workspace initialized.'
      );
      return;
    }
    this.blockMode = blockMode;
    Blockly.getGenerator().init(workspace);

    this.compiledEvents = {};
    this.triggerIdToStartType = {};

    const topBlocks = workspace.getTopBlocks();

    // Make sure that simple2 top-level blocks only generate their code once.
    if (blockMode === BlockMode.SIMPLE2) {
      topBlocks.forEach(block => {
        if (
          block.type === BlockTypes.WHEN_RUN_SIMPLE2 ||
          block.type === BlockTypes.TRIGGERED_AT_SIMPLE2
        ) {
          (block as ExtendedBlock).skipNextBlockGeneration = true;
        }
      });
    }

    topBlocks.forEach(block => {
      if (blockMode !== BlockMode.SIMPLE2) {
        if (block.type === BlockTypes.WHEN_RUN) {
          this.compiledEvents.whenRunButton = {
            code:
              'var __context = "when_run";\n' +
              Blockly.JavaScript.workspaceToCode(workspace),
            args: ['startPosition'],
          };
        }
      } else {
        if (block.type === BlockTypes.WHEN_RUN_SIMPLE2) {
          this.compiledEvents.whenRunButton = {
            code:
              'var __context = "when_run";\n' +
              'var __functionCallsCount = 0;\n' +
              'var __loopIterationsCount = 0;\n' +
              Blockly.JavaScript.workspaceToCode(workspace),
          };
        }
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
        let code = `var __context = "${id}";\n`;
        if (block.type === BlockTypes.TRIGGERED_AT_SIMPLE2) {
          code +=
            'var __functionCallsCount = 0;\n' +
            'var __loopIterationsCount = 0;\n';
        }
        this.compiledEvents[triggerIdToEvent(id)] = {
          code: code + Blockly.JavaScript.workspaceToCode(workspace),
          args: ['startPosition'],
        };
        // Also save the value of the trigger start field at compile time so we can
        // compute the correct start time at each invocation. For blocks without this
        // field, such as in advanced mode, the start time is immediately.
        this.triggerIdToStartType[triggerIdToEvent(id)] =
          block.getFieldValue(FIELD_TRIGGER_START_NAME) ||
          TriggerStart.IMMEDIATELY;
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
      {Sequencer: Sequencers[blockMode]},
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
  ): PlaybackExecutionData {
    const data = {
      playbackEvents: [],
      orderedFunctions: [],
      lastMeasure: 0,
    };

    if (Object.keys(this.compiledEvents).length === 0) {
      this.metricsReporter.logWarning(
        'executeCompiledSong called before compileSong.'
      );
      return data;
    }

    const startTime = Date.now();
    console.log('Executing compiled song.');

    if (this.codeHooks.whenRunButton) {
      this.mergePlaybackData(
        data,
        this.callUserGeneratedCode(this.codeHooks.whenRunButton, [0])
      );
    }

    for (const {id, startPosition} of triggerEvents) {
      this.mergePlaybackData(data, this.executeTrigger(id, startPosition));
    }

    this.lastExecutedEvents = this.compiledEvents;

    console.log('Execution time: ', Date.now() - startTime);

    return data;
  }

  executeCode(code: string): PlaybackExecutionData {
    if (!this.blockMode) {
      throw new Error('Attempted to execute code before block mode set.');
    }
    const sequencer = Sequencers[this.blockMode];
    sequencer.clear();
    try {
      CustomMarshalingInterpreter.evalWith(
        code,
        {Sequencer: sequencer},
        {runMaxSteps: 1000}
      );
    } catch (e) {
      console.error(e);
    }

    return {
      playbackEvents: sequencer.getPlaybackEvents(),
      orderedFunctions:
        sequencer instanceof Simple2Sequencer
          ? sequencer.getOrderedFunctions()
          : [],
      lastMeasure: sequencer.getLastMeasure(),
    };
  }

  /**
   * Executes code for the specific trigger referenced by the ID. It is
   * assumed that {@link compileSong()} has already been called and all event
   * hooks have already been generated, as triggers cannot be played until
   * the song has started.
   *
   * @param id ID of the trigger
   */
  executeTrigger(id: string, startPosition: number): PlaybackExecutionData {
    const hook = this.codeHooks[triggerIdToEvent(id)];
    if (hook) {
      return this.callUserGeneratedCode(hook, [startPosition]);
    }
    return {
      playbackEvents: [],
      orderedFunctions: [],
      lastMeasure: 0,
    };
  }

  /**
   * Executes code for all triggers in the workspace. Useful for assembling
   * all events that could be potentially triggered for preloading sounds.
   */
  executeAllTriggers(startPosition = 0): PlaybackEvent[] {
    return Triggers.map(
      ({id}) => this.executeTrigger(id, startPosition).playbackEvents
    ).flat();
  }

  hasTrigger(id: string) {
    return !!this.codeHooks[triggerIdToEvent(id)];
  }

  hasAnyTriggers() {
    return Triggers.some(({id}) => this.hasTrigger(id));
  }

  /**
   * Given the exact current playback position, get the start position of the trigger,
   * adjusted based on when the trigger should play (immediately, next beat, or next measure).
   */
  getTriggerStartPosition(id: string, currentPosition: number) {
    const triggerStart = this.triggerIdToStartType[triggerIdToEvent(id)];

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

  /**
   * Serialize the top blocks of the workspace as a toolbox.
   * @returns a toolbox definition that can be handled directly by Blockly.
   */
  workspaceToToolboxDefinition() {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'workspaceToToolboxDefinition called before workspace initialized.'
      );
      return {};
    }
    const topBlocks = this.workspace.getTopBlocks(true);

    // This will be the final toolbox returned by this function, either a
    // flyout toolbox or a category toolbox.
    const fullToolbox: GoogleBlockly.utils.toolbox.ToolboxInfo = {
      contents: [],
    };
    // Temporary storage for blocks that will be added to the next category,
    // if categories exist, or the final flyout toolbox.
    let flyoutItems: GoogleBlockly.utils.toolbox.FlyoutItemInfo[] = [];

    // Temporary storage for a category, containing a name, type, list of contents.
    let currentCategory = getNewStaticCategory();

    topBlocks.forEach(block => {
      if (block.type === BlockTypes.CATEGORY) {
        fullToolbox.kind = 'categoryToolbox';
        if (isValidCategory(currentCategory)) {
          // Add the previous category to toolbox.
          fullToolbox.contents.push({...currentCategory});
        }

        // Begin a new category for the blocks that follow.
        currentCategory = getNewStaticCategory(
          block.getFieldValue('CATEGORY') as Category
        );
        flyoutItems = [];
      } else if (block.type === BlockTypes.CUSTOM_CATEGORY) {
        fullToolbox.kind = 'categoryToolbox';
        if (isValidCategory(currentCategory)) {
          // Add previous category to toolbox
          fullToolbox.contents.push({...currentCategory});
        }
        // Create and immediately add a new dynamic category to the toolbox,
        // because dynamic categories cannot include other static blocks.
        fullToolbox.contents.push(
          getNewDynamicCategory(block.getFieldValue('CUSTOM'))
        );

        // Begin a new "DEFAULT" category in case any non-category block follows.
        currentCategory = getNewStaticCategory();
        flyoutItems = [];
      } else {
        // Add the current block to the flyout and category.
        flyoutItems.push({
          kind: 'block',
          ...Blockly.serialization.blocks.save(block, {saveIds: false}),
          id: Blockly.blockIdOverrides?.[block.id] || block.id,
          enabled: true,
        });
        currentCategory.contents = flyoutItems;
      }
    });

    // Finalize the toolbox.
    if (
      !fullToolbox.contents.length &&
      currentCategory.name === DEFAULT_CATEGORY_NAME
    ) {
      // If no categories have been used, create a flyout toolbox.
      fullToolbox.kind = 'flyoutToolbox';
      fullToolbox.contents = flyoutItems;
    } else if (isValidCategory(currentCategory)) {
      // Add the final category to the toolbox.
      fullToolbox.contents.push({...currentCategory});
    }
    return fullToolbox;
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
    if (AppConfig.getValue('js-editor') === 'true') {
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
      (this.workspace as GoogleBlockly.WorkspaceSvg).highlightBlock(
        block.id,
        false
      );
    }
    // Highlight playing blocks.
    for (const blockId of playingBlockIds) {
      (this.workspace as GoogleBlockly.WorkspaceSvg).highlightBlock(
        blockId,
        true
      );
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

    (this.workspace as GoogleBlockly.WorkspaceSvg)
      .getAllBlocks()
      .forEach(block => {
        block.id === blockId ? block.addSelect() : block.removeSelect();
      });
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
  loadCode(code: object) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'loadCode called before workspace initialized.'
      );
      return;
    }
    this.workspace.clear();
    this.workspace.clearUndo();

    // Clear the record of the last executed code so that if the new code
    // happens to match it, we actually execute it.
    this.lastExecutedEvents = {};

    // Ensure that we have an extensible object for Blockly.
    const codeCopy = JSON.parse(JSON.stringify(code));

    Blockly.serialization.workspaces.load(codeCopy, this.workspace);

    disableOrphanBlocks(this.workspace);
  }

  // For each function body in the current workspace, add a function call
  // block to the toolbox. Also add a function definition block, if required.
  generateFunctionBlocks() {
    const workspace = this.workspace as ExtendedWorkspaceSvg;
    if (workspace?.isReadOnly()) {
      return;
    }
    const blockList: GoogleBlockly.utils.toolbox.ToolboxItemInfo[] = [];

    if (this.toolbox?.addFunctionDefinition) {
      blockList.push({
        kind: 'block',
        type: BLOCK_TYPES.procedureDefinition,
        id: BLOCK_TYPES.procedureDefinition,
        fields: {
          NAME: musicI18n.blockly_functionNamePlaceholder(),
        },
      });
    }

    const allFunctions: GoogleBlockly.serialization.procedures.State[] = [];

    (
      this.workspace?.getTopBlocks(
        this.toolbox?.addFunctionCallsSortByPosition
      ) as ProcedureBlock[]
    )
      .filter(
        // When a block is dragged from the toolbox, an insertion marker is
        // created with the same type. Insertion markers just provide a
        // visual indication of where the actual block will go. They should
        // not be counted here or we could end up with duplicate call blocks.
        block =>
          block.type === BLOCK_TYPES.procedureDefinition &&
          !block.isInsertionMarker()
      )
      .forEach(block => {
        allFunctions.push(
          Blockly.serialization.procedures.saveProcedure(
            block.getProcedureModel()
          )
        );
      });

    const compareFunction = this.toolbox?.addFunctionCallsSortByPosition
      ? () => 0
      : nameComparator;

    allFunctions.sort(compareFunction).forEach(({name, id, parameters}) => {
      blockList.push({
        kind: 'block',
        type: BLOCK_TYPES.procedureCall,
        extraState: {
          name,
          id,
          params: parameters?.map(param => param.name),
        },
      });
    });

    if (this.blockMode) {
      const existingToolbox =
        this.toolboxDefinition || getToolbox(this.blockMode, this.toolbox);
      // Perform a copy of the toolbox contents to avoid modifying the original
      // this.toolboxDefinition object.
      const updatedToolbox = {
        ...existingToolbox,
        contents: [...existingToolbox.contents, ...blockList],
      };
      const workspace = this.workspace as GoogleBlockly.WorkspaceSvg;
      workspace.updateToolbox(updatedToolbox);

      if (workspace.RTL) {
        // When the flyout is dynamically populated, the flyout width can increase,
        // thereby overlapping start blocks in RTL. If this happens, we move the
        // blocks back to the left
        // Relates to https://github.com/google/blockly/issues/8637
        const flyout = workspace.getFlyout();
        const metricsManager = workspace.getMetricsManager();
        const flyoutWidth = flyout?.getWidth() || 0;

        if (flyoutWidth) {
          const {left: contentLeft, width: contentWidth} =
            metricsManager.getContentMetrics();
          const viewWidth = metricsManager.getViewMetrics().width;

          const contentRight = contentLeft + contentWidth;
          const expectedMargin = 20; // Add space between right-most block and flyout
          const overlapAmount = contentRight - viewWidth + expectedMargin;

          if (overlapAmount > 0) {
            workspace
              .getTopBlocks()
              .forEach(block => block.moveBy(-overlapAmount, 0));
          }
        }
      }
    }
  }

  private callUserGeneratedCode(
    fn: (...args: unknown[]) => void,
    args: unknown[] = []
  ): PlaybackExecutionData {
    if (!this.blockMode) {
      throw new Error('Attempted to execute code before block mode set.');
    }

    const sequencer = Sequencers[this.blockMode];
    sequencer.clear();
    try {
      fn.call(this, ...args);
    } catch (e) {
      this.metricsReporter.logError(
        'Error running user generated code',
        e as Error
      );
    }

    return {
      playbackEvents: sequencer.getPlaybackEvents(),
      orderedFunctions:
        sequencer instanceof Simple2Sequencer
          ? sequencer.getOrderedFunctions()
          : [],
      lastMeasure: sequencer.getLastMeasure(),
    };
  }

  private mergePlaybackData(
    currentData: PlaybackExecutionData,
    newData: PlaybackExecutionData
  ) {
    currentData.playbackEvents.push(...newData.playbackEvents);
    currentData.orderedFunctions.push(...newData.orderedFunctions);
    currentData.lastMeasure = Math.max(
      currentData.lastMeasure,
      newData.lastMeasure
    );
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

  // The toolbox remains in the DOM but can be made `display: none` to hide it.
  setToolboxVisibility(visible: boolean) {
    if (this.workspace) {
      (this.workspace as GoogleBlockly.WorkspaceSvg)
        .getToolbox()
        ?.setVisible(visible);

      Blockly.svgResize(this.workspace as GoogleBlockly.WorkspaceSvg);
    }
  }
}
