import {ApiError, DashboardApiClient} from '@code-dot-org/core/api';
import type {BlocklySerialization} from '@code-dot-org/blockly';
import {LabRegistry} from '@code-dot-org/lab/contexts';

import type {MusicApiClient} from '../api';
import {createMusicApiClient} from '../api/client';
import {BlockMode} from '../constants';
import type {BlockModeType} from '../constants';
import {compileSongHeadless} from '../headlessCompile';

import {defaultMetadata} from './DefaultMusic';
import MusicLibrary from './MusicLibrary';
import type {MusicMetadata} from './MusicMetadata';
import {computeEventMeasures} from './MusicMetadata';
import MusicPlayer from './MusicPlayer';

const DEFAULT_LIBRARY = 'launch2024';

/** The Music API client built over the page's DashboardApiClient. */
export const createDefaultMusicApiClient = (): MusicApiClient =>
  createMusicApiClient(DashboardApiClient);

/** A MusicPlayer for a host that is not Music Lab. */
export const createMusicPlayer = (
  api: MusicApiClient = createDefaultMusicApiClient(),
): MusicPlayer => new MusicPlayer(api);

/** A ProjectPlayer, with its MusicPlayer, for a host that is not Music Lab. */
export const createProjectPlayer = (
  api: MusicApiClient = createDefaultMusicApiClient(),
): ProjectPlayer => new ProjectPlayer(new MusicPlayer(api), api);

/** Loads a student's Music Lab project and plays its song. */
class ProjectPlayer {
  private readonly player: MusicPlayer;
  private readonly api: MusicApiClient;
  private currentMetadata: MusicMetadata | null = null;
  private eventMeasures: number[] | null = null;
  private stopIntervalId: number | null = null;

  constructor(player?: MusicPlayer, api?: MusicApiClient) {
    this.api = api ?? createDefaultMusicApiClient();
    this.player = player ?? new MusicPlayer(this.api);
  }

  async loadProject(channelId: string): Promise<void> {
    this.currentMetadata = null;
    this.eventMeasures = null;

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

    this.stopIntervalId = window.setInterval(
      () => {
        if (this.stopIntervalId) {
          const currentPlayheadPosition =
            this.player.getCurrentPlayheadPosition();

          if (currentPlayheadPosition >= lastMeasure + 1) {
            onEnded?.();
            this.stop();
          }
        }
      },
      (60 / this.player.getBPM()) * 1000,
    );
  }

  stop() {
    this.player.stopSong();
    if (this.stopIntervalId) {
      clearInterval(this.stopIntervalId);
    }
  }

  getEventMeasures(): number[] {
    if (this.eventMeasures === null) {
      throw new Error('No project loaded!');
    }
    return this.eventMeasures;
  }

  getBpm(): number {
    if (this.currentMetadata === null) {
      throw new Error('No project loaded!');
    }
    return this.player.getBPM();
  }

  getCurrentPlayheadPosition(): number {
    return this.player.getCurrentPlayheadPosition();
  }

  getLastMeasure(): number | undefined {
    return this.currentMetadata?.lastMeasure;
  }

  getMetadata(): MusicMetadata {
    if (this.currentMetadata === null) {
      throw new Error('No project loaded!');
    }
    return this.currentMetadata;
  }

  private async loadMetadata(channelId: string): Promise<MusicMetadata> {
    if (channelId === defaultMetadata.channelId) {
      return this.prepareLibraryFromMetadata(defaultMetadata);
    }

    try {
      const {sources} = await this.api.sources.get({channelId});
      const music = sources.labConfig?.music;
      const libraryName = music?.library;
      const packId = music?.packId;
      const blockMode =
        (music?.blockMode as BlockModeType | undefined) || BlockMode.SIMPLE2;

      // Sounds must be available while the song code executes.
      await this.prepareLibrary(libraryName, packId);

      const source = (
        typeof sources.source === 'string'
          ? JSON.parse(sources.source)
          : sources.source
      ) as BlocklySerialization;
      const {playbackEvents, orderedFunctions, lastMeasure} =
        compileSongHeadless(source, blockMode, e =>
          LabRegistry.metricsReporter.logError(
            'Error running user generated code',
            e,
          ),
        );

      return {
        channelId,
        playbackEvents,
        orderedFunctions,
        lastMeasure,
        packId,
        libraryName,
      };
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        // The channel has no Music Lab project saved yet.
        return this.prepareLibraryFromMetadata(defaultMetadata);
      }
      throw e;
    }
  }

  private async prepareLibrary(libraryName?: string, packId?: string) {
    const library = await MusicLibrary.loadLibrary(
      this.api,
      libraryName || DEFAULT_LIBRARY,
    );

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
