import {
  HttpClient,
  isNetworkError,
  fetchSignedCookies,
} from '@code-dot-org/api';
import type {LabMetricsReporter} from '@code-dot-org/lab';
import {LabRegistry} from '@code-dot-org/lab';

import {baseAssetUrlRestricted} from '../constants';
import type {LoadFinishedCallback} from '../types';

class SoundCache {
  private static instance: SoundCache;

  public static getInstance() {
    if (!SoundCache.instance) {
      SoundCache.instance = new SoundCache();
    }
    return SoundCache.instance;
  }

  private audioBuffers: {[id: string]: AudioBuffer};
  private hasLoadedSignedCookies: boolean;

  private readonly audioContext;
  private readonly metricsReporter: LabMetricsReporter;
  private readonly httpClient: typeof HttpClient;

  constructor(
    audioContext: AudioContext = new AudioContext(),
    metricsReporter: LabMetricsReporter = LabRegistry.metricsReporter,
    httpClient: typeof HttpClient = HttpClient,
  ) {
    this.audioContext = audioContext;
    this.metricsReporter = metricsReporter;
    this.httpClient = httpClient;
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
      onLoadFinished?: LoadFinishedCallback;
      updateLoadProgress?: (progress: number) => void;
    } = {},
  ): Promise<void> {
    const failedSounds: {path: string; error: string}[] = [];
    const {onLoadFinished, updateLoadProgress} = callbacks;
    const startTime = Date.now();

    // Filter out sounds that are already loaded
    paths = paths.filter(path => !this.audioBuffers[path]);

    // Reset loading progress if we have sounds to load
    if (updateLoadProgress && paths.length > 0) {
      updateLoadProgress(0);
    }

    let loadCounter = 0;
    const loadPromises: Promise<void>[] = [];

    if (paths.length > 0) {
      this.metricsReporter.publishMetric(
        'SoundCache.LoadSoundsCount',
        paths.length,
        'Count',
      );
    }

    for (const path of paths) {
      const loadPromise = this.loadSound(path)
        .then(sound => {
          if (!sound) {
            failedSounds.push({path, error: 'Error verifying URL'});
          }
        })
        .catch(err => {
          failedSounds.push({path, error: err.message});
        })
        .finally(() => {
          if (updateLoadProgress) {
            updateLoadProgress(++loadCounter / paths.length);
          }
        });
      loadPromises.push(loadPromise);
    }

    await Promise.all(loadPromises);

    if (onLoadFinished) {
      onLoadFinished(
        Date.now() - startTime,
        paths.length - failedSounds.length,
      );
    }

    if (failedSounds.length > 0) {
      this.metricsReporter.logError('Error loading sounds', undefined, {
        attempted: paths.length,
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
  async loadSound(url: string): Promise<AudioBuffer | undefined> {
    if (this.audioBuffers[url]) {
      return this.audioBuffers[url];
    }
    const startTime = Date.now();

    // Fetch signed cookies if necessary
    if (
      url.startsWith(baseAssetUrlRestricted) &&
      !this.hasLoadedSignedCookies
    ) {
      await this.refreshSignedCookies();
    }

    const response = await this.fetchSoundFromUrl(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.audioBuffers[url] = audioBuffer;
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

  private async fetchSoundFromUrl(url: string) {
    try {
      const response = await this.httpClient.get(url);
      return response;
    } catch (error) {
      if (isNetworkError(error) && error.response.status === 403) {
        // Cloudfront cookies may have expired. Try refreshing and fetch again.
        // If this fails, the error will be caught and logged.
        await this.refreshSignedCookies();
        return this.httpClient.get(url);
      } else {
        throw error;
      }
    }
  }

  private async refreshSignedCookies(): Promise<void> {
    const response = await fetchSignedCookies(true);
    if (response.ok) {
      this.hasLoadedSignedCookies = true;
    } else {
      throw new Error(`Failed to refresh signed cookies: ${response.status}`);
    }
  }
}

export default SoundCache;
