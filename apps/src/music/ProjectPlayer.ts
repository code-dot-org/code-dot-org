// TODO: Better name?

import {SourcesStore} from '../lab2/projects/SourcesStore';

import {
  cacheKey,
  computeEventMeasures,
  MusicMetadata,
} from './ai/generate/GenerateCode';
import MusicBlocklyWorkspace from './blockly/MusicBlocklyWorkspace';
import {setUpBlocklyForMusicLab} from './blockly/setup';
import MusicLibrary from './player/MusicLibrary';
import MusicPlayer from './player/MusicPlayer';
import {MusicLabConfig} from './types';

/**
 * Given information about a student project, manages loading code and playing the project song.
 */
class ProjectPlayer {
  private currentMetadata: MusicMetadata | null = null;
  private eventMeasures: number[] | null = null;
  private stopIntervalId: number | null = null;

  constructor(
    private readonly player = new MusicPlayer(),
    private readonly sourcesStore: SourcesStore = new SourcesStore(),
    private readonly workspace: MusicBlocklyWorkspace = new MusicBlocklyWorkspace()
  ) {
    setUpBlocklyForMusicLab();
  }

  // TODO: Support fetching by level + user ID?
  async loadProject(channelId: string, useLocalStorage = false) {
    this.currentMetadata = null;
    this.eventMeasures = null;
    this.workspace.initHeadless();

    this.currentMetadata = await this.loadMetadata(channelId, useLocalStorage);
    const {libraryName, packId, playbackEvents} = this.currentMetadata;

    let library = MusicLibrary.getInstance();
    if (!library) {
      library = await MusicLibrary.loadLibrary(libraryName || 'launch2024');
    }

    if (packId) {
      library.setCurrentPackId(packId);
    }

    this.player.updateConfiguration(library.getBPM(), library.getKey());
    this.eventMeasures = computeEventMeasures(playbackEvents);

    await this.player.preloadSounds(playbackEvents);
  }

  play(onEnded?: () => void) {
    if (this.currentMetadata === null) {
      throw new Error('No project loaded!');
    }
    const {playbackEvents, lastMeasure} = this.currentMetadata;
    this.player.playSong(playbackEvents);

    // Stop the song after the last measure.
    this.stopIntervalId = window.setInterval(() => {
      if (
        this.stopIntervalId &&
        this.player.getCurrentPlayheadPosition() >= lastMeasure
      ) {
        onEnded?.();
        this.stop();
      }
    }, (60 / this.player.getBPM()) * 1000);
  }

  stop() {
    this.player.stopSong();
    if (this.stopIntervalId) {
      clearInterval(this.stopIntervalId);
    }
  }

  getEventMeasures() {
    if (this.eventMeasures === null) {
      throw new Error('No project loaded!');
    }
    return this.eventMeasures;
  }

  getBpm() {
    if (this.currentMetadata === null) {
      throw new Error('No project loaded!');
    }
    return this.player.getBPM();
  }

  private async loadMetadata(
    channelId: string,
    useLocalStorage = false
  ): Promise<MusicMetadata> {
    // Try to load from local storage if it exists
    if (useLocalStorage) {
      const metadataString = localStorage.getItem(cacheKey());
      if (metadataString) {
        return JSON.parse(metadataString) as MusicMetadata;
      }
    }

    // Otherwise, load from server
    const sources = await this.sourcesStore.load(channelId);
    const labConfig = sources.labConfig as MusicLabConfig;
    this.workspace.loadCode(JSON.parse(sources.source as string));
    this.workspace.compileSong(labConfig.music.blockMode);
    const {playbackEvents, lastMeasure} = this.workspace.executeCompiledSong();

    return {
      playbackEvents,
      lastMeasure,
      packId: labConfig.music.packId,
      libraryName: labConfig.music.library,
    };
  }
}

export default ProjectPlayer;
