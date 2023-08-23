import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import {fetchSignedCookies} from '@cdo/apps/utils';
import {baseAssetUrl} from '../constants';
import MusicLibrary from './MusicLibrary';

const restrictedSoundUrlPath = '/restricted/musiclab/';

class SoundCache {
  private readonly audioContext: AudioContext;
  private audioBuffers: {[id: string]: AudioBuffer};
  private hasLoadedSignedCookies: boolean;

  constructor(audioContext: AudioContext = new AudioContext()) {
    this.audioContext = audioContext;
    this.audioBuffers = {};
    this.hasLoadedSignedCookies = false;
  }

  /**
   * Synchronously get a single audio buffer from the cache if present.
   * Returns undefined if not present.
   */
  getSound(path: string): AudioBuffer | undefined {
    return this.audioBuffers[path];
  }

  /**
   * Load the given sounds into the cache if not already loaded.
   */
  async loadSounds(
    paths: string[],
    callbacks: {
      onLoadFinished?: (loadTimeMs: number) => void;
      updateLoadProgress?: (progress: number) => void;
    } = {}
  ): Promise<void> {
    const failedSounds = [];
    const {onLoadFinished, updateLoadProgress} = callbacks;
    const startTime = Date.now();

    for (let i = 0; i < paths.length; i++) {
      try {
        const sound = await this.loadSound(paths[i]);
        if (!sound) {
          failedSounds.push(paths[i]);
        }
      } catch (error) {
        failedSounds.push(paths[i]);
      }

      if (updateLoadProgress) {
        updateLoadProgress((i + 1) / paths.length);
      }
    }

    if (onLoadFinished) {
      onLoadFinished(Date.now() - startTime);
    }

    if (failedSounds.length > 0) {
      Lab2MetricsReporter.logError('Error loading sounds', undefined, {
        count: failedSounds.length,
        failedSounds: failedSounds.join(','),
      });
    }
  }

  /**
   * Load a single sound into the cache if not already loaded. Returns the loaded buffer.
   * Throws if there is an error loading a sound.
   */
  async loadSound(path: string): Promise<AudioBuffer | undefined> {
    if (this.audioBuffers[path]) {
      return this.audioBuffers[path];
    }

    const url = await this.getUrl(path);
    if (!url) {
      // Error is logged below
      return;
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.audioBuffers[path] = audioBuffer;
    return audioBuffer;
  }

  clear(): void {
    this.audioBuffers = {};
  }

  private async getUrl(path: string): Promise<string | null> {
    const library = MusicLibrary.getInstance();
    if (!library) {
      Lab2MetricsReporter.logWarning('Library not loaded. Cannot get URL.');
      return null;
    }

    const soundData = library.getSoundForId(path);
    if (!soundData) {
      return null;
    }

    let canLoadRestrictedContent = this.hasLoadedSignedCookies;
    if (soundData.restricted && !this.hasLoadedSignedCookies) {
      try {
        const response = await fetchSignedCookies();
        if (response.ok) {
          canLoadRestrictedContent = true;
          this.hasLoadedSignedCookies = true;
        }
      } catch (error) {
        Lab2MetricsReporter.logError(
          'Error loading signed cookies',
          error as Error
        );
      }
    }

    if (soundData.restricted && !canLoadRestrictedContent) {
      return null;
    }

    const baseUrl = soundData.restricted
      ? restrictedSoundUrlPath
      : baseAssetUrl;

    return baseUrl + library.groups[0].path + '/' + path + '.mp3';
  }
}

export default SoundCache;
