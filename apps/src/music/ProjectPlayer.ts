import {SourcesStore} from '../lab2/projects/SourcesStore';
import {NetworkError} from '../util/HttpClient';

import {
  cacheKey,
  computeEventMeasures,
  MusicMetadata,
} from './ai/generate/GenerateCode';
import MusicBlocklyWorkspace from './blockly/MusicBlocklyWorkspace';
import {setUpBlocklyForMusicLab} from './blockly/setup';
import {defaultMetadata} from './DefaultMusic';
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

  async loadProject(channelId: string) {
    this.currentMetadata = null;
    this.eventMeasures = null;
    this.workspace.initHeadless();

    this.currentMetadata = await this.loadMetadata(channelId);
    const playbackEvents = this.currentMetadata.playbackEvents;
    this.eventMeasures = computeEventMeasures(playbackEvents);

    await this.player.preloadSounds(playbackEvents);
  }

  play(onEnded?: () => void) {
    if (this.currentMetadata === null) {
      throw new Error('No project loaded!');
    }
    const {playbackEvents, lastMeasure} = this.currentMetadata;
    this.player.playSong(playbackEvents);

    this.stopIntervalId = window.setInterval(() => {
      if (this.stopIntervalId) {
        const currentPlayheadPosition =
          this.player.getCurrentPlayheadPosition();

        // Stop the song after the last measure.
        if (currentPlayheadPosition >= lastMeasure + 1) {
          onEnded?.();
          this.stop();
        }
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

  getCurrentPlayheadPosition() {
    return this.player.getCurrentPlayheadPosition();
  }

  getLastMeasure() {
    return this.currentMetadata?.lastMeasure;
  }

  getMetadata() {
    if (this.currentMetadata === null) {
      throw new Error('No project loaded!');
    }
    return this.currentMetadata;
  }

  private async loadMetadata(channelId: string): Promise<MusicMetadata> {
    // Return default if specified.
    if (channelId === defaultMetadata.channelId) {
      return this.prepareLibraryFromMetadata(defaultMetadata);
    }

    // Try to load from local storage if it exists.
    const metadataString = localStorage.getItem(cacheKey());
    if (metadataString) {
      try {
        const localStorageMetadata = JSON.parse(
          metadataString
        ) as MusicMetadata;
        if (localStorageMetadata.channelId === channelId) {
          return this.prepareLibraryFromMetadata(localStorageMetadata);
        }
      } catch (e) {
        // Ignore JSON parse errors and fall through to loading from server.
      }
    }

    // Otherwise, load from server.
    try {
      const sources = await this.sourcesStore.load(channelId);
      const labConfig = sources.labConfig as MusicLabConfig;
      // Prepare library so sounds are available during code execution.
      await this.prepareLibrary(
        labConfig.music.library,
        labConfig.music.packId
      );

      this.workspace.loadCode(JSON.parse(sources.source as string));
      this.workspace.compileSong(labConfig.music.blockMode);
      const {playbackEvents, orderedFunctions, lastMeasure} =
        this.workspace.executeCompiledSong();

      return {
        channelId,
        playbackEvents,
        orderedFunctions,
        lastMeasure,
        packId: labConfig.music.packId,
        libraryName: labConfig.music.library,
      };
    } catch (e) {
      if (
        e instanceof NetworkError &&
        (e as NetworkError).response.status === 404
      ) {
        // Use default metadata if a music project has not yet been created.
        return this.prepareLibraryFromMetadata(defaultMetadata);
      } else {
        throw e;
      }
    }
  }

  private async prepareLibrary(libraryName?: string, packId?: string) {
    let library = MusicLibrary.getInstance();
    if (!library) {
      library = await MusicLibrary.loadLibrary(libraryName || 'launch2024');
    }

    if (packId) {
      library.setCurrentPackId(packId);
    }

    this.player.updateConfiguration(library.getBPM(), library.getKey());
  }

  private async prepareLibraryFromMetadata(metadata: MusicMetadata) {
    await this.prepareLibrary(metadata.libraryName, metadata.packId);
    return metadata;
  }
}

export default ProjectPlayer;
