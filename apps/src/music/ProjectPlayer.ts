// TODO: Better name?

import {SourcesStore} from '../lab2/projects/SourcesStore';

import MusicBlocklyWorkspace from './blockly/MusicBlocklyWorkspace';
import {setUpBlocklyForMusicLab} from './blockly/setup';
import {PlaybackEvent} from './player/interfaces/PlaybackEvent';
import MusicLibrary from './player/MusicLibrary';
import MusicPlayer from './player/MusicPlayer';
import {MusicLabConfig} from './types';
import {cacheKey, computeEventMeasures, MusicMetadata} from './utils/Generate';

/**
 * Given information about a student project, manages loading code and playing the project song.
 */
class ProjectPlayer {
  private currentPlaybackEvents: PlaybackEvent[] | null = null;
  private eventMeasures: number[] | null = null;

  constructor(
    private readonly player = new MusicPlayer(),
    private readonly sourcesStore: SourcesStore = new SourcesStore(),
    private readonly workspace: MusicBlocklyWorkspace = new MusicBlocklyWorkspace()
  ) {
    setUpBlocklyForMusicLab();
  }

  // TODO: Support fetching by level + user ID?
  async loadProject(channelId: string, useLocalStorage = false) {
    this.currentPlaybackEvents = null;
    this.eventMeasures = null;
    this.workspace.initHeadless();

    const {playbackEvents, packId, libraryName} = await this.loadMetadata(
      channelId,
      useLocalStorage
    );

    let library = MusicLibrary.getInstance();
    if (!library) {
      library = await MusicLibrary.loadLibrary(libraryName || 'launch2024');
    }

    if (packId) {
      library.setCurrentPackId(packId);
    }

    this.player.updateConfiguration(library.getBPM(), library.getKey());
    this.currentPlaybackEvents = playbackEvents;
    this.eventMeasures = computeEventMeasures(playbackEvents);

    await this.player.preloadSounds(playbackEvents);
  }

  play() {
    if (this.currentPlaybackEvents === null) {
      throw new Error('No project loaded!');
    }
    this.player.playSong(this.currentPlaybackEvents);
  }

  stop() {
    this.player.stopSong();
  }

  getEventMeasures() {
    if (this.eventMeasures === null) {
      throw new Error('No project loaded!');
    }
    return this.eventMeasures;
  }

  getBpm() {
    if (this.currentPlaybackEvents === null) {
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
    const playbackEvents = this.workspace.executeCompiledSong().playbackEvents;

    return {
      playbackEvents,
      packId: labConfig.music.packId,
      libraryName: labConfig.music.library,
    };
  }
}

export default ProjectPlayer;
