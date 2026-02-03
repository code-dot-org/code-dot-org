//import {ProcedureBase} from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';
import type {JavascriptGenerator} from 'blockly/javascript';
import EventEmitter from 'events';
import type TypedEmitter from 'typed-emitter';
import type {EventMap} from 'typed-emitter';

import type {MusicApiClient} from './api';
import AppConfig from './appConfig';
import {BlockTypes} from './blockly/blockTypes';
import {TRIGGER_FIELD} from './blockly/constants';
import {DEFAULT_BPM, DEFAULT_KEY, BlockMode, Triggers} from './constants';
import type {CompiledEvents} from './Generator';
import Generator, {Sequencers, triggerIdToEvent} from './Generator';
import type {FunctionEvents} from './player/interfaces/FunctionEvents';
import type {PlaybackEvent} from './player/interfaces/PlaybackEvent';
import MusicPlayer from './player/MusicPlayer';
import MusicLibrary from './player/MusicLibrary';
import Simple2Sequencer from './player/sequencer/Simple2Sequencer';
import {KeyFromName, KeyMapping} from './utils/Notes';
import AnalyticsReporter from './LabMusicMetricsReporter';

import type {LabMetricsReporter} from '@code-dot-org/lab';
import {LabRegistry} from '@code-dot-org/lab';

// The tick rate that the Driver will emit Tick events during playback
const UPDATE_RATE = 1000 / 30; // 30 times per second

export const DriverEvent = {
  /** The music library was loaded and updated */
  LibraryUpdated: 'library-updated',
  /** A trigger was updated */
  SetTrigger: 'set-trigger',
  /**
   * A block was selected (or everything was deselected if the blockId is
   * undefined)
   */
  Selected: 'selected',
  /** The code was edited */
  Updated: 'updated',
  /** We want to clear the timeline */
  ClearTimeline: 'clear-timeline',
  /** We want to update the timeline */
  UpdateTimeline: 'update-timeline',
  /** We have preloaded the initial sounds */
  LoadedInitialSounds: 'loaded-initial-sounds',
  /** When we start playing */
  PlaybackStarted: 'playback-started',
  /** When we stop playing */
  PlaybackStopped: 'playback-stopped',
  /** Playback 'tick' */
  Tick: 'tick',
  /** When we want to update the playback position */
  UpdatePosition: 'update-position',
} as const;

interface DriverEvents extends EventMap {
  [DriverEvent.LibraryUpdated]: (library: MusicLibrary) => void;
  [DriverEvent.SetTrigger]: (triggerId: string) => void;
  [DriverEvent.Selected]: (blockId?: string) => void;
  [DriverEvent.Updated]: () => void;
  [DriverEvent.ClearTimeline]: () => void;
  [DriverEvent.UpdateTimeline]: (data: PlaybackExecutionData) => void;
  [DriverEvent.LoadedInitialSounds]: () => void;
  [DriverEvent.PlaybackStarted]: () => void;
  [DriverEvent.PlaybackStopped]: () => void;
  [DriverEvent.Tick]: () => void;
  [DriverEvent.UpdatePosition]: (position: number) => void;
}

// TODO: use AppOptions api
//const isToolboxMode = getAppOptionsEditBlocks() === LabConstants.TOOLBOX_BLOCKS;
const isToolboxMode = false;

export type TriggerEvents = {id: string; startPosition: number}[];

export type PlaybackExecutionData = {
  playbackEvents: PlaybackEvent[];
  orderedFunctions: FunctionEvents[];
  lastMeasure: number;
};

/**
 * This is the interface to the music lab player and blockly workspace.
 *
 * This is generally equivalent to the old MusicView and BlocklyMusicWorkspace
 * classes.
 */
class Driver extends (EventEmitter as unknown as new () => TypedEmitter<DriverEvents>) {
  protected readonly api: MusicApiClient;
  protected workspace?: Blockly.WorkspaceSvg;
  protected javascriptGenerator?: JavascriptGenerator;
  protected generator?: Generator;
  protected library?: MusicLibrary;
  readonly analyticsReporter: AnalyticsReporter;
  private readonly metricsReporter: LabMetricsReporter;
  readonly player: MusicPlayer;
  private isPlaying: boolean;
  private blockMode: (typeof BlockMode)[keyof typeof BlockMode];
  private playingTriggers: TriggerEvents;
  private hasLoadedInitialSounds: boolean;
  private updateTimer?: ReturnType<typeof setInterval>;
  private startingPlayheadPosition: number;

  constructor(api: MusicApiClient) {
    super();

    this.api = api;
    this.hasLoadedInitialSounds = false;
    this.playingTriggers = [];
    this.blockMode = BlockMode.SIMPLE2;
    this.metricsReporter = LabRegistry.metricsReporter;
    this.analyticsReporter = new AnalyticsReporter();
    this.startingPlayheadPosition = 1;
    const bpm = AppConfig.getValue('bpm');
    const key = AppConfig.getValue('key');
    console.log('new driver?');
    this.player = new MusicPlayer(
      api,
      parseInt(bpm || DEFAULT_BPM.toString()),
      KeyFromName[(key || KeyMapping[DEFAULT_KEY]).toUpperCase()],
      this.analyticsReporter,
    );
    this.isPlaying = false;
  }

  setStartingPlayheadPosition(position: number) {
    this.startingPlayheadPosition = position;
  }

  setWorkspace(workspace: Blockly.WorkspaceSvg) {
    this.workspace = workspace;
  }

  setJavascriptGenerator(javascriptGenerator: JavascriptGenerator) {
    this.javascriptGenerator = javascriptGenerator;
  }

  async loadAndInitializePlayer(libraryName: string) {
    this.library = await MusicLibrary.loadLibrary(this.api, libraryName);
    this.emit(DriverEvent.LibraryUpdated, this.library);
  }

  /**
   * Responds to a Blockly workspace event.
   */
  onBlockEvent(e: Blockly.Events.Abstract) {
    if (!this.workspace) {
      return;
    }

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
    if (isToolboxMode) {
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
      const changeEvent = e as Blockly.Events.BlockChange;
      if (
        changeEvent.element === 'field' &&
        changeEvent.name === TRIGGER_FIELD &&
        changeEvent.blockId
      ) {
        this.emit(
          DriverEvent.SetTrigger,
          this.getSelectedTriggerId(changeEvent.blockId),
        );
      }
    }

    // Procedure events should regenerate function blocks in the (uncategorized) toolbox.
    // This keeps call blocks in sync when functions are created/deleted/renamed.
    /*
    if (
      e instanceof ProcedureBase ||
      e.type === Blockly.Events.FINISHED_LOADING
    ) {
      const toolbox = this.workspace.getToolbox();
      const flyout = toolbox?.getFlyout;
      if (
        toolbox?.addFunctionCalls &&
        flyout &&
        this.blockMode === BlockMode.SIMPLE2
      ) {
        this.generateFunctionBlocks();
      }
    }*/

    if (e.type === Blockly.Events.FINISHED_LOADING) {
      // Remove any procedures that do not have definitions.
      // This prevents extra call blocks from showing in the toolbox.
      const procedureMap = this.workspace.getProcedureMap();
      procedureMap
        .getProcedures()
        .filter(
          p => !Blockly.Procedures.getDefinition(p.getName(), this.workspace!),
        )
        .forEach(p => procedureMap.delete(p.getId()));

      // Adjust the position of any overlapping blocks, including immovable top blocks.
      this.workspace.cleanUp();
    }

    if (e.type === Blockly.Events.SELECTED) {
      const selectedEvent = e as Blockly.Events.Selected;
      this.emit(DriverEvent.Selected, selectedEvent.newElementId);
      return;
    }

    const codeChanged = this.compileSong();
    if (codeChanged) {
      // Upcall to tell consumer that the workspace as updated
      this.emit(DriverEvent.Updated);

      this.populateCompiledSong().then(playbackEvents => {
        // If code has changed mid-playback, clear and re-queue all events in the player
        if (this.isPlaying) {
          this.player.playEvents(playbackEvents, true);
        }
      });

      this.analyticsReporter.onBlocksUpdated(this.workspace.getAllBlocks());
    }
  }

  clearSelection() {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'clearSelection called before workspace initialized.',
      );
      return;
    }

    this.workspace.getAllBlocks().forEach(block => block.removeSelect());
  }

  selectBlock(blockId: string) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'selectBlock called before workspace initialized.',
      );
      return;
    }

    this.clearSelection();
    this.workspace.getBlockById(blockId)?.addSelect();
  }

  getSelectedTriggerId(blockId: string) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'getSelectedTriggerId called before workspace initialized.',
      );
      return;
    }

    const block = this.workspace.getBlockById(blockId);
    if (!block) {
      return;
    }

    const isSelectedBlockTriggerAt =
      block.type === BlockTypes.TRIGGERED_AT_SIMPLE2;
    if (isSelectedBlockTriggerAt) {
      return block.getFieldValue(TRIGGER_FIELD);
    } else {
      return;
    }
  }

  /**
   * Performs an undo on the Blockly workspace.
   */
  undo() {
    if (!this.workspace) {
      return;
    }
    this.workspace.undo(false);
  }

  /**
   * Performs a redo on the Blockly workspace.
   */
  redo() {
    if (!this.workspace) {
      return;
    }
    this.workspace.undo(true);
  }

  /** Whether or not the workspace has something to undo */
  canUndo(): boolean {
    if (!this.workspace) {
      return false;
    }
    return this.workspace.getUndoStack().length > 0;
  }

  canRedo(): boolean {
    if (!this.workspace) {
      return false;
    }
    return this.workspace.getRedoStack().length > 0;
  }

  getBlockCount(): number {
    return this.workspace?.getAllBlocks().length || 0;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getValidationTimeout() {}

  getPlaybackEvents() {}

  getPlayingTriggers() {}

  getCurrentPlayheadPosition() {
    return this.player.getCurrentPlayheadPosition();
  }

  updateHighlightedBlocks() {}

  /*
  clearCode(maintainPackId) {
  }
  */

  setPlaying(play: boolean) {
    if (play) {
      this.playSong();
    } else {
      this.stopSong();
    }
  }

  togglePlaying() {
    this.setPlaying(!this.isPlaying);
  }

  playTrigger() {}

  /**
   * Crafts a Generator and compiles the current workspace code into it.
   */
  compileSong(): CompiledEvents | undefined {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'compileSong called before workspace initialized.',
      );
      return;
    }

    if (!this.javascriptGenerator) {
      this.metricsReporter.logWarning(
        'compileSong called before javascript generator initialized.',
      );
      return;
    }

    // Create the generator and compile the song
    this.generator = new Generator(
      this.generator?.events || {},
      this.workspace,
      this.javascriptGenerator,
      this.blockMode,
      this.generator?.hooks || {},
    );

    // Update the list of triggers that are available in the workspace.
    //this.triggers = Triggers.filter(trigger =>
    //  this.hasTrigger(trigger.id)
    //);

    return this.generator.events;
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
    if (this.generator) {
      const hook = this.generator.hooks[triggerIdToEvent(id)];
      if (hook) {
        return this.callUserGeneratedCode(hook, [startPosition]);
      }
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
      ({id}) => this.executeTrigger(id, startPosition).playbackEvents,
    ).flat();
  }

  executeCompiledSong(
    triggerEvents: TriggerEvents = [],
  ): PlaybackExecutionData {
    const data = {
      playbackEvents: [],
      orderedFunctions: [],
      lastMeasure: 0,
    };

    if (!this.generator) {
      return data;
    }

    if (Object.keys(this.generator.events).length === 0) {
      this.metricsReporter.logWarning(
        'executeCompiledSong called before compileSong.',
      );
      return data;
    }

    const startTime = Date.now();
    console.log('Executing compiled song.');

    if (this.generator.hooks.whenRunButton) {
      this.mergePlaybackData(
        data,
        this.callUserGeneratedCode(this.generator.hooks.whenRunButton, [0]),
      );
    }

    for (const {id, startPosition} of triggerEvents) {
      this.mergePlaybackData(data, this.executeTrigger(id, startPosition));
    }

    console.log('Execution time: ', Date.now() - startTime);

    return data;
  }

  async populateCompiledSong(): Promise<PlaybackEvent[]> {
    if (AppConfig.getValue('js-editor') === 'true') {
      return [];
    }

    // Sequence out all possible trigger events to preload sounds if necessary.
    const allTriggerEvents = this.executeAllTriggers();
    const data = this.executeCompiledSong(this.playingTriggers);

    // Clear the events list because it will be populated next.
    this.emit(DriverEvent.ClearTimeline);
    this.emit(DriverEvent.UpdateTimeline, data);

    await this.preloadSounds([...data.playbackEvents, ...allTriggerEvents]);
    return data.playbackEvents;
  }

  /*
  executeSongCode(code) {
  }

  preloadSounds(events) {
  }
  */

  async playSong() {
    /*
    this.setState({
      hasRun: true,
    });
    */
    //this.props.logLevelActivity();
    /*if (this.props.isFirstAttempt) {
      this.props.sendAttemptReport();
    }*/
    this.isPlaying = true;
    this.player.stopSong();
    this.playingTriggers = [];

    //this.musicBlocklyWorkspace?.hideChaff();

    this.compileSong();

    const playbackEvents = await this.populateCompiledSong();
    this.saveCode(true);

    this.player.playSong(playbackEvents, this.startingPlayheadPosition);

    // Tell the world we have started playback
    this.emit(DriverEvent.PlaybackStarted);

    // Update the position
    this.emit(DriverEvent.UpdatePosition, this.startingPlayheadPosition);

    // Clear block selections
    this.emit(DriverEvent.Selected);

    //this.props.clearSelectedTriggerId();

    // Start the update timer
    this.updateTimer = setInterval(() => {
      this.emit(DriverEvent.Tick);
    }, UPDATE_RATE);
  }

  saveCode(_forceSave: boolean = false) {
    // TODO
  }

  loadCode(_code: string) {
    // TODO
  }

  stopSong() {
    if (!this.isPlaying) {
      return;
    }

    /*
    const {hasConditions, message, satisfied} = this.props.validationState;

    // If this level has validation, and the user has seen a validation message,
    // log an attempt.
    if (hasConditions && message) {
      this.analyticsReporter.onValidationAttempt(
        satisfied,
        markdownToTxt(message)
      );
    }*/

    // Stop the timer
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }

    this.isPlaying = false;
    this.player.stopSong();
    this.playingTriggers = [];

    // Clear the timeline of triggered events when song is stopped.
    this.populateCompiledSong();

    this.emit(DriverEvent.PlaybackStopped);
    //this.emit(DriverEvent.UpdatePosition(this.startingPlayheadPosition));
  }

  /*
  hasTrigger(id: string) {
  }
  */

  getStartSources() {}

  getExemplarValidationMode() {}

  getExemplarSources() {}

  getExemplarPlaybackEvents() {}

  generateExemplarPlaybackEvents() {}

  // Preload sounds.
  // Called by populateCompiledSong and executeSongCode.
  preloadSounds(events: PlaybackEvent[]) {
    return this.player.preloadSounds(events, (loadTimeMs, soundsLoaded) => {
      // Report load time metrics if any sounds were loaded.
      if (soundsLoaded > 0) {
        LabRegistry.metricsReporter.reportLoadTime(
          'PreloadSoundLoadTime',
          loadTimeMs,
          [
            {
              name: 'LoadType',
              value: this.hasLoadedInitialSounds ? 'Subsequent' : 'Initial',
            },
          ],
        );
      }

      if (!this.hasLoadedInitialSounds) {
        LabRegistry.metricsReporter.logInfo({
          event: 'InitialSoundsLoaded',
          soundsLoaded,
          loadTimeMs,
        });

        this.hasLoadedInitialSounds = true;
        this.emit(DriverEvent.LoadedInitialSounds);
      }
    });
  }

  private callUserGeneratedCode(
    fn: (...args: unknown[]) => void,
    args: unknown[] = [],
  ): PlaybackExecutionData {
    const sequencer = Sequencers[this.blockMode];
    sequencer.clear();
    try {
      fn.call(this, ...args);
    } catch (e) {
      this.metricsReporter.logError(
        'Error running user generated code',
        e as Error,
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
    newData: PlaybackExecutionData,
  ) {
    currentData.playbackEvents.push(...newData.playbackEvents);
    currentData.orderedFunctions.push(...newData.orderedFunctions);
    currentData.lastMeasure = Math.max(
      currentData.lastMeasure,
      newData.lastMeasure,
    );
  }
}

export default Driver;
