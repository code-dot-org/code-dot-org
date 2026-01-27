import {ProcedureBase} from '@blockly/block-shareable-procedures';
import * as Blockly from 'blockly/core';
import type {JavascriptGenerator} from 'blockly/javascript';
import EventEmitter from 'events';
import type TypedEmitter from 'typed-emitter';
import type {EventMap} from 'typed-emitter';

import AppConfig from './appConfig';
import {BlockTypes} from './blockly/blockTypes';
import {TRIGGER_FIELD} from './blockly/constants';
import {DEFAULT_BPM, DEFAULT_KEY, BlockMode} from './constants';
import Generator from './Generator';
import type {PlaybackEvent} from './player/interfaces/PlaybackEvent';
import MusicPlayer from './player/MusicPlayer';
import MusicLibrary from './player/MusicLibrary';
import {KeyFromName, KeyMapping} from './utils/Notes';
import AnalyticsReporter from './LabMusicMetricsReporter';

import {getAppOptionsEditBlocks} from '@code-dot-org/api';
import type {LabMetricsReporter} from '@code-dot-org/lab';
import {
  LabConstants,
  LabRegistry,
} from '@code-dot-org/lab';

export const DriverEvent = {
  /** The music library was loaded and updated */
  LibraryUpdated: 'library-updated',
  /** A trigger was updated */
  SetTrigger: 'set-trigger',
  /** A block was selected */
  Selected: 'selected',
  /** The code was edited */
  Updated: 'updated',
} as const;

interface DriverEvents extends EventMap {
  [DriverEvent.LibraryUpdated]: (library: MusicLibrary) => void;
  [DriverEvent.SetTrigger]: (triggerId: string) => void;
  [DriverEvent.Selected]: (blockId: string) => void;
  [DriverEvent.Updated]: () => void;
}

const isToolboxMode = getAppOptionsEditBlocks() === LabConstants.TOOLBOX_BLOCKS;

/**
 * This is the interface to the music lab player and blockly workspace.
 *
 * This is generally equivalent to the old MusicView and BlocklyMusicWorkspace
 * classes.
 */
class Driver extends (EventEmitter as unknown as new () => TypedEmitter<DriverEvents>) {
  protected workspace?: Blockly.WorkspaceSvg;
  protected javascriptGenerator?: JavascriptGenerator;
  protected generator?: Generator;
  protected library?: MusicLibrary;
  readonly analyticsReporter: AnalyticsReporter;
  private readonly metricsReporter: LabMetricsReporter;
  readonly player: MusicPlayer;
  private isPlaying: boolean;
  private blockMode: typeof BlockMode[keyof typeof BlockMode];

  constructor() {
    super();

    this.blockMode = BlockMode.SIMPLE2;
    this.metricsReporter = LabRegistry.metricsReporter;
    this.analyticsReporter = new AnalyticsReporter();
    const bpm = AppConfig.getValue('bpm');
    const key = AppConfig.getValue('key');
    this.player = new MusicPlayer(
      parseInt(bpm || DEFAULT_BPM.toString()),
      KeyFromName[(key || KeyMapping[DEFAULT_KEY]).toUpperCase()],
      this.analyticsReporter,
    );
    this.isPlaying = false;
  }

  setWorkspace(workspace: Blockly.WorkspaceSvg) {
    this.workspace = workspace;
  }

  setJavascriptGenerator(javascriptGenerator: JavascriptGenerator) {
    this.javascriptGenerator = javascriptGenerator;
  }

  async loadAndInitializePlayer(libraryName: string) {
    this.library = await MusicLibrary.loadLibrary(libraryName);
    this.emit(DriverEvent.LibraryUpdated, this.library);
  }

  /**
   * Responds to a Blockly workspace event.
   */
  onBlockEvent(e: Blockly.Events.Abstract) {
    if (!this.workspace) {
      return;
    }

    console.log('event', e);

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
      if (changeEvent.element === 'field' && changeEvent.name === TRIGGER_FIELD && changeEvent.blockId) {
        this.emit(DriverEvent.SetTrigger,
          this.getSelectedTriggerId(changeEvent.blockId)
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
        .filter(p => !Blockly.Procedures.getDefinition(p.getName(), this.workspace!))
        .forEach(p => procedureMap.delete(p.getId()));

      // Adjust the position of any overlapping blocks, including immovable top blocks.
      this.workspace.cleanUp();
    }

    if (e.type === Blockly.Events.SELECTED) {
      const selectedEvent = e as Blockly.Events.Selected;
      if (selectedEvent.newElementId) {
        this.emit(DriverEvent.Selected, selectedEvent.newElementId);
      }
      return;
    }

    console.log('compiling?');

    const codeChanged = this.compileSong();
    if (codeChanged) {
      // Upcall to tell consumer that the workspace as updated
      this.emit(DriverEvent.Updated);

      this.executeCompiledSong().then(playbackEvents => {
        // If code has changed mid-playback, clear and re-queue all events in the player
        if (this.isPlaying) {
          this.player.playEvents(playbackEvents, true);
        }
      });

      this.analyticsReporter.onBlocksUpdated(
        this.workspace.getAllBlocks()
      );
    }
  }

  getSelectedTriggerId(blockId: string) {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'getSelectedTriggerId called before workspace initialized.'
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

  getCurrentPlayheadPosition() {}

  updateHighlightedBlocks() {}

  /*
  clearCode(maintainPackId) {
  }

  setPlaying(play: boolean) {
  }
  */

  togglePlaying() {}

  playTrigger() {}

  /**
   * Crafts a Generator and compiles the current workspace code into it.
   */
  compileSong(): string {
    if (!this.workspace) {
      this.metricsReporter.logWarning(
        'compileSong called before workspace initialized.'
      );
      return '';
    }

    if (!this.javascriptGenerator) {
      this.metricsReporter.logWarning(
        'compileSong called before javascript generator initialized.'
      );
      return '';
    }

    console.log('compileSong');

    // Create the generator and compile the song
    this.generator = new Generator(this.workspace, this.javascriptGenerator, this.blockMode, this.metricsReporter);

    // Update the list of triggers that are available in the workspace.
    //this.triggers = Triggers.filter(trigger =>
    //  this.hasTrigger(trigger.id)
    //);

    return this.generator.code;
  }

  async executeCompiledSong(): Promise<PlaybackEvent[]> {
    return [];
  }

  /*
  executeSongCode(code) {
  }

  preloadSounds(events) {
  }
  */

  playSong() {}

  /*
  saveCode(forceSave: boolean = false) {
  }

  loadCode(code) {
  }
  */

  stopSong() {}

  /*
  hasTrigger(id: string) {
  }
  */

  getStartSources() {}

  getExemplarValidationMode() {}

  getExemplarSources() {}

  getExemplarPlaybackEvents() {}

  generateExemplarPlaybackEvents() {}

  /*
  onBlockSpaceChange(e) {
  }
  */
}

export default Driver;
