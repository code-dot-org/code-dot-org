import {Abstract} from 'blockly/core/events/events_abstract';
import Lab2Registry from '../lab2/Lab2Registry';
import {ProjectSources} from '../lab2/types';
import AnalyticsReporter from './analytics/AnalyticsReporter';
import {getBlockMode} from './appConfig';
import MusicBlocklyWorkspace from './blockly/MusicBlocklyWorkspace';
import {BlockMode, Triggers} from './constants';
import MusicPlayer from './player/MusicPlayer';
import {FunctionEvents} from './player/interfaces/FunctionEvents';
import {PlaybackEvent} from './player/interfaces/PlaybackEvent';
import MusicPlayerStubSequencer from './player/sequencer/MusicPlayerStubSequencer';
import Sequencer from './player/sequencer/Sequencer';
import Simple2Sequencer from './player/sequencer/Simple2Sequencer';
import {Key} from './utils/Notes';
import Globals from './globals';

export type UpdatePlaybackData = (
  type: 'add' | 'replace',
  events: PlaybackEvent[],
  orderedFunctions: FunctionEvents[],
  lastMeasure: number
) => void;

class MusicProgramExecutor {
  private isReadOnlyWorkspace: boolean;
  private currentLibraryName: string | null;
  private playingTriggers: {id: string; startPosition: number}[];
  private sequencer: Sequencer;
  private hasLoadedInitialSounds: boolean;

  constructor(
    private readonly updatePlaybackData: UpdatePlaybackData,
    private readonly analyticsReporter: AnalyticsReporter | null,
    private readonly player = new MusicPlayer(),
    private readonly blocklyWorkspace = new MusicBlocklyWorkspace()
  ) {
    this.sequencer =
      getBlockMode() === BlockMode.SIMPLE2
        ? new Simple2Sequencer()
        : new MusicPlayerStubSequencer();
    this.isReadOnlyWorkspace = false;
    this.currentLibraryName = null;
    this.playingTriggers = [];
    this.hasLoadedInitialSounds = false;
    Globals.setPlayer(this.player);
  }

  onLevelChange(
    blocklyDivId: string,
    onBlockSpaceChange: (e: Abstract) => void,
    isReadOnlyWorkspace: boolean,
    toolbox?: {[key: string]: string[]}
  ) {
    this.blocklyWorkspace.init(
      document.getElementById(blocklyDivId),
      onBlockSpaceChange,
      isReadOnlyWorkspace,
      toolbox
    );
    this.hasLoadedInitialSounds = false;
    this.isReadOnlyWorkspace = isReadOnlyWorkspace;
  }

  destroy() {
    this.blocklyWorkspace.destroy();
  }

  onLibraryChange(name: string) {
    this.currentLibraryName = name;
  }

  updateConfiguration(libraryName: string, bpm?: number, key?: Key) {
    this.currentLibraryName = libraryName;
    this.player.updateConfiguration(bpm, key);
  }

  setUpdateLoadProgress(updateLoadProgress: (value: number) => void) {
    this.player.setUpdateLoadProgress(updateLoadProgress);
  }

  playSong(startingPlayheadPosition: number) {
    this.player.stopSong();
    this.playingTriggers = [];

    this.compileSong();

    this.executeCompiledSong();
    this.saveCode(true);

    this.player.playSong(
      this.sequencer.getPlaybackEvents(),
      startingPlayheadPosition
    );
  }

  stopSong() {
    this.player.stopSong();
    this.playingTriggers = [];
    // Re-execute to refresh timeline
    this.executeCompiledSong();
  }

  playTrigger(id: string) {
    const triggerStartPosition = this.blocklyWorkspace.getTriggerStartPosition(
      id,
      this.player.getCurrentPlayheadPosition()
    );

    if (!triggerStartPosition) {
      return;
    }

    this.sequencer.clear();
    this.blocklyWorkspace.executeTrigger(id, triggerStartPosition);
    const playbackEvents = this.sequencer.getPlaybackEvents();
    this.updatePlaybackData(
      'add',
      playbackEvents,
      (this.sequencer as Simple2Sequencer).getOrderedFunctions(),
      this.sequencer.getLastMeasure()
    );
    this.player.playEvents(playbackEvents);

    this.playingTriggers.push({
      id,
      startPosition: triggerStartPosition,
    });
  }

  hasTrigger(id: string): boolean {
    return this.blocklyWorkspace.hasTrigger(id);
  }

  getCurrentPlayheadPosition() {
    return this.player.getCurrentPlayheadPosition();
  }

  saveCode(forceSave = false) {
    // Can't save if this is a read-only workspace.
    if (this.isReadOnlyWorkspace) {
      return;
    }
    const workspaceCode = this.blocklyWorkspace.getCode();
    const sourcesToSave: ProjectSources = {
      source: JSON.stringify(workspaceCode),
    };

    // Save the current library to sources as part of labConfig if present
    if (this.currentLibraryName) {
      sourcesToSave.labConfig = {
        music: {
          library: this.currentLibraryName,
        },
      };
    }

    Lab2Registry.getInstance()
      .getProjectManager()
      ?.save(sourcesToSave, forceSave);
  }

  loadCode(code: string) {
    this.blocklyWorkspace.loadCode(code);
    this.saveCode();
  }

  undo() {
    this.blocklyWorkspace.undo();
  }

  redo() {
    this.blocklyWorkspace.redo();
  }

  canUndo(): boolean {
    return this.blocklyWorkspace.canUndo();
  }

  canRedo(): boolean {
    return this.blocklyWorkspace.canRedo();
  }

  selectBlock(id: string) {
    this.blocklyWorkspace.selectBlock(id);
  }

  resizeBlockly() {
    this.blocklyWorkspace.resizeBlockly();
  }

  updateHighlightedBlocks(blockIds: string[]) {
    this.blocklyWorkspace.updateHighlightedBlocks(blockIds);
  }

  onWorkspaceChange(isPlaying: boolean) {
    const codeChanged = this.compileSong();
    if (codeChanged) {
      this.executeCompiledSong().then(() => {
        // If code has changed mid-playback, clear and re-queue all events in the player
        if (isPlaying) {
          this.player.stopAllSoundsStillToPlay();
          this.player.playEvents(this.sequencer.getPlaybackEvents());
        }
      });

      this.analyticsReporter?.onBlocksUpdated(
        this.blocklyWorkspace.getAllBlocks()
      );
    }
    // This may no-op due to throttling.
    this.saveCode();
  }

  cancelPreviews() {
    this.player.cancelPreviews();
  }

  private compileSong() {
    return this.blocklyWorkspace.compileSong({
      getTriggerCount: () => this.playingTriggers.length,
      Sequencer: this.sequencer,
    });
  }

  private executeCompiledSong() {
    // Sequence out all possible trigger events to preload sounds if necessary.
    const allTriggerEvents: PlaybackEvent[] = [];
    Triggers.forEach(trigger => {
      this.sequencer.clear();
      this.blocklyWorkspace.executeTrigger(trigger.id, 0);
      allTriggerEvents.push(...this.sequencer.getPlaybackEvents());
    });

    this.sequencer.clear();
    this.blocklyWorkspace.executeCompiledSong(this.playingTriggers);
    this.updatePlaybackData(
      'replace',
      this.sequencer.getPlaybackEvents(),
      (this.sequencer as Simple2Sequencer).getOrderedFunctions(),
      this.sequencer.getLastMeasure()
    );

    return this.player.preloadSounds(
      [...this.sequencer.getPlaybackEvents(), ...allTriggerEvents],
      (loadTimeMs, soundsLoaded) => {
        // Report load time metrics if any sounds were loaded.
        if (soundsLoaded > 0) {
          Lab2Registry.getInstance()
            .getMetricsReporter()
            .reportLoadTime('PreloadSoundLoadTime', loadTimeMs, [
              {
                name: 'LoadType',
                value: this.hasLoadedInitialSounds ? 'Subsequent' : 'Initial',
              },
            ]);
        }

        if (!this.hasLoadedInitialSounds) {
          Lab2Registry.getInstance().getMetricsReporter().logInfo({
            event: 'InitialSoundsLoaded',
            soundsLoaded,
            loadTimeMs,
          });
          this.hasLoadedInitialSounds = true;
        }
      }
    );
  }
}

export default MusicProgramExecutor;
