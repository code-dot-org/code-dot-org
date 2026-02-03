import {ApiError} from '@code-dot-org/core/api';
import type {LabMetricsReporter} from '@code-dot-org/lab';
import {LabRegistry} from '@code-dot-org/lab';

import type {Sample} from './types';

import type {MusicApiClient} from '../api';
import type {LoadFinishedCallback} from '../types';

export const getSoundKey = (sound: Omit<Sample, 'key'>) =>
  `${sound.library || '%default%'}-${sound.folder.path}-${sound.soundData.path || '%root%'}-${sound.soundData.src}`;

export class SoundCache {
  private audioBuffers: {[id: string]: AudioBuffer};

  private readonly audioContext;
  private readonly metricsReporter: LabMetricsReporter;

  constructor(
    audioContext: AudioContext = new AudioContext(),
    metricsReporter: LabMetricsReporter = LabRegistry.metricsReporter,
  ) {
    this.audioContext = audioContext;
    this.metricsReporter = metricsReporter;
    this.audioBuffers = {};
  }

  /**
   * Synchronously get a single audio buffer from the cache if present.
   * Returns undefined if not present.
   */
  getSound(sound: Sample): AudioBuffer | undefined {
    return this.audioBuffers[getSoundKey(sound)];
  }

  /**
   * Load the given sounds into the cache if not already loaded.
   */
  async loadSounds(
    api: MusicApiClient,
    sounds: Sample[],
    callbacks: {
      onLoadFinished?: LoadFinishedCallback;
      updateLoadProgress?: (progress: number) => void;
    } = {},
  ): Promise<void> {
    const failedSounds: {path: string; error: string}[] = [];
    const {onLoadFinished, updateLoadProgress} = callbacks;
    const startTime = Date.now();

    const toLoad = sounds.filter(sound => !this.audioBuffers[sound.key]);

    // Reset loading progress if we have sounds to load
    if (updateLoadProgress && toLoad.length > 0) {
      updateLoadProgress(0);
    }

    let loadCounter = 0;
    const loadPromises: Promise<void>[] = [];

    if (toLoad.length > 0) {
      this.metricsReporter.publishMetric(
        'SoundCache.LoadSoundsCount',
        toLoad.length,
        'Count',
      );
    }

    for (const sound of toLoad) {
      const loadPromise = this.loadSound(api, sound)
        .then(buffer => {
          if (!buffer) {
            failedSounds.push({path: sound.key, error: 'Error verifying URL'});
          }
        })
        .catch(err => {
          failedSounds.push({path: sound.key, error: err.message});
        })
        .finally(() => {
          if (updateLoadProgress) {
            updateLoadProgress(++loadCounter / toLoad.length);
          }
        });
      loadPromises.push(loadPromise);
    }

    await Promise.all(loadPromises);

    if (onLoadFinished) {
      onLoadFinished(
        Date.now() - startTime,
        toLoad.length - failedSounds.length,
      );
    }

    if (failedSounds.length > 0) {
      this.metricsReporter.logError('Error loading sounds', undefined, {
        attempted: toLoad.length,
        count: failedSounds.length,
        failedSounds,
      });
      this.metricsReporter.publishMetric(
        'SoundCache.FailedSoundsCount',
        failedSounds.length,
        'Count',
      );
    }
  }

  /**
   * Load a single sound into the cache if not already loaded. Returns the loaded buffer.
   * Throws if there is an error loading a sound.
   */
  async loadSound(
    api: MusicApiClient,
    sound: Sample,
  ): Promise<AudioBuffer | undefined> {
    if (this.audioBuffers[sound.key]) {
      return this.audioBuffers[sound.key];
    }
    const startTime = Date.now();

    const response = await this.fetchSound(api, sound);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.audioBuffers[sound.key] = audioBuffer;
    // Report load time for a single sound
    this.metricsReporter.reportLoadTime(
      'SoundCache.SingleSoundLoadTime',
      Date.now() - startTime,
    );
    return audioBuffer;
  }

  clear(): void {
    this.audioBuffers = {};
  }

  private async fetchSound(api: MusicApiClient, sound: Sample) {
    const fetchParams = {
      folder: sound.folder,
      library: sound.library,
      soundData: sound.soundData,
    };
    try {
      return api.music.getSound(fetchParams);
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        // Cloudfront cookies may have expired. Try refreshing and fetch again.
        // If this fails, the error will be caught and logged.
        await this.refreshSignedCookies(api);
        return api.music.getSound(fetchParams);
      } else {
        throw error;
      }
    }
  }

  private async refreshSignedCookies(api: MusicApiClient): Promise<void> {
    try {
      await api.auth.signCookies({
        buster: true,
      });
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0;
      throw new Error(`Failed to refresh signed cookies: ${status}`);
    }
  }
}

export default new SoundCache();
