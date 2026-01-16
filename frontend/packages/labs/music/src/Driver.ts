import * as Blockly from 'blockly/core';
import EventEmitter from 'events';
import type TypedEmitter from 'typed-emitter';
import type {EventMap} from 'typed-emitter';

import AppConfig from './appConfig';
import {DEFAULT_BPM, DEFAULT_KEY} from './constants';
import MusicPlayer from './player/MusicPlayer';
import MusicLibrary from './player/MusicLibrary';
import {KeyFromName, KeyMapping} from './utils/Notes';
import AnalyticsReporter from './LabMusicMetricsReporter';

export const DriverEvent = {
  LibraryUpdated: 'library-updated',
} as const;

interface DriverEvents extends EventMap {
  [DriverEvent.LibraryUpdated]: (library: MusicLibrary) => void;
}

/**
 * This is the interface to the music lab player and blockly workspace.
 *
 * This is generally equivalent to the old MusicView and BlocklyMusicWorkspace
 * classes.
 */
class Driver extends (EventEmitter as unknown as new () => TypedEmitter<DriverEvents>) {
  protected workspace?: Blockly.WorkspaceSvg;
  protected library?: MusicLibrary;
  readonly analyticsReporter: AnalyticsReporter;
  readonly player: MusicPlayer;

  constructor() {
    super();

    this.analyticsReporter = new AnalyticsReporter();
    const bpm = AppConfig.getValue('bpm');
    const key = AppConfig.getValue('key');
    this.player = new MusicPlayer(
      parseInt(bpm || DEFAULT_BPM.toString()),
      KeyFromName[(key || KeyMapping[DEFAULT_KEY]).toUpperCase()],
      this.analyticsReporter,
    );
  }

  async loadAndInitializePlayer(libraryName: string) {
    this.library = await MusicLibrary.loadLibrary(libraryName);
    this.emit(DriverEvent.LibraryUpdated, this.library);
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
    return false;
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

  compileSong() {}

  async executeCompiledSong() {}

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
