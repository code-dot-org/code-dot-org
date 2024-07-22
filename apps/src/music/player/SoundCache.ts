import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {fetchSignedCookies} from '@cdo/apps/utils';

import {baseAssetUrlRestricted} from '../constants';
import {LoadFinishedCallback} from '../types';

class SoundCache {
  private readonly audioContext: AudioContext;
  private readonly metricsReporter: LabMetricsReporter;
  private audioBuffers: {[id: string]: AudioBuffer};
  private hasLoadedSignedCookies: boolean;

  constructor(
    audioContext: AudioContext = new AudioContext(),
    metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    this.audioContext = audioContext;
    this.metricsReporter = metricsReporter;
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
    } = {}
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
      this.metricsReporter.incrementCounter('SoundCache.LoadSoundsAttempt');
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
        paths.length - failedSounds.length
      );
    }

    if (failedSounds.length > 0) {
      this.metricsReporter.logError('Error loading sounds', undefined, {
        attempted: paths.length,
        count: failedSounds.length,
        failedSounds,
      });
      this.metricsReporter.incrementCounter('SoundCache.LoadSoundsError');
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

    const verified = await this.verifyUrl(url);
    if (!verified) {
      // Error is logged below
      return;
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.audioBuffers[url] = audioBuffer;
    // Report load time for a single sound
    this.metricsReporter.reportLoadTime(
      'SoundCache.SingleSoundLoadTime',
      Date.now() - startTime
    );
    return audioBuffer;
  }

  clear(): void {
    this.audioBuffers = {};
  }

  private async verifyUrl(path: string): Promise<boolean | null> {
    const restricted = path.startsWith(baseAssetUrlRestricted);

    let canLoadRestrictedContent = this.hasLoadedSignedCookies;
    if (restricted && !this.hasLoadedSignedCookies) {
      try {
        const response = await fetchSignedCookies();
        if (response.ok) {
          canLoadRestrictedContent = true;
          this.hasLoadedSignedCookies = true;
        }
      } catch (error) {
        this.metricsReporter.logError(
          'Error loading signed cookies',
          error as Error
        );
      }
    }

    if (restricted && !canLoadRestrictedContent) {
      return false;
    }

    return true;
  }
}

export default SoundCache;
