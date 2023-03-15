import {Effects} from './interfaces/Effects';
import MusicLibrary from './MusicLibrary';

// Using require() to import JS in TS files
const soundApi = require('./sound');

export interface SampleEvent {
  offsetSeconds: number;
  sampleId: string;
  triggered: boolean;
  effects?: Effects;
}

interface PlayingSample {
  eventStart: number;
  uniqueId: number;
  triggered: boolean;
}

const MAIN_AUDIO_GROUP = 'mainaudio';
const PREVIEW_GROUP = 'preview';
const GROUP_PREFIX = 'all';

/**
 * Handles playback of individual samples.
 */
export default class SamplePlayer {
  private playingSamples: PlayingSample[];
  private isPlaying: boolean;
  private startPlayingAudioTime: number;
  private isInitialized: boolean;

  constructor() {
    this.playingSamples = [];
    this.isPlaying = false;
    this.startPlayingAudioTime = -1;
    this.isInitialized = false;
  }

  initialize(library: MusicLibrary) {
    const soundList = library.groups
      .map(group => {
        return group.folders.map(folder => {
          return folder.sounds.map(sound => {
            return group.path + '/' + folder.path + '/' + sound.src;
          });
        });
      })
      .flat(2);
    soundApi.InitSound(soundList);

    this.isInitialized = true;
  }

  initialized(): boolean {
    return this.isInitialized;
  }

  startPlayback(sampleEventList: SampleEvent[]) {
    if (!this.isInitialized) {
      console.warn('Sample player not initialized.');
      return;
    }

    this.stopPlayback();

    this.startPlayingAudioTime = soundApi.GetCurrentAudioTime();
    this.isPlaying = true;

    this.playSamples(sampleEventList);
  }

  previewSample(sampleId: string, onStop: () => any) {
    if (!this.isInitialized) {
      console.warn('Sample player not initialized.');
      return;
    }

    this.cancelPreviews();

    soundApi.PlaySound(GROUP_PREFIX + '/' + sampleId, PREVIEW_GROUP, 0, onStop);
  }

  playing(): boolean {
    return this.isPlaying;
  }

  getElapsedPlaybackTimeSeconds(): number {
    const currentAudioTime = soundApi.GetCurrentAudioTime();
    if (!this.isPlaying || currentAudioTime === null) {
      return -1;
    }

    return currentAudioTime - this.startPlayingAudioTime;
  }

  playSamples(sampleEvents: SampleEvent[]) {
    if (!this.isInitialized) {
      console.warn('Sample player not initialized.');
      return;
    }

    if (!this.isPlaying) {
      return;
    }

    for (const sampleEvent of sampleEvents) {
      const currentAudioTime = soundApi.GetCurrentAudioTime();
      const eventStart = this.startPlayingAudioTime + sampleEvent.offsetSeconds;

      // Triggered sounds might have a target play time that is very slightly in
      // the past, specificially when they use the currentTime passed (slightly
      // earlier) into the event handler code as the target play time.
      // To compensate for this delay, if the target play time is within a tenth of
      // a second of the current play time, then play it.
      // Note that we still don't play sounds older than that, because they might
      // have been scheduled for some time ago, and Web Audio will play a
      // sound immediately if its target time is in the past.
      const delayCompensation = sampleEvent.triggered ? 0.1 : 0;

      if (eventStart >= currentAudioTime - delayCompensation) {
        const uniqueId = soundApi.PlaySound(
          GROUP_PREFIX + '/' + sampleEvent.sampleId,
          MAIN_AUDIO_GROUP,
          eventStart,
          null,
          false,
          sampleEvent.effects
        );

        this.playingSamples.push({
          eventStart,
          uniqueId,
          triggered: sampleEvent.triggered
        });
      }
    }
  }

  stopPlayback() {
    soundApi.StopSound(MAIN_AUDIO_GROUP);
    soundApi.StopSound(PREVIEW_GROUP);
    this.playingSamples = [];
    this.isPlaying = false;
    this.startPlayingAudioTime = -1;
  }

  cancelPreviews() {
    soundApi.StopSound(PREVIEW_GROUP);
  }

  /**
   * Stops all non-triggered samples that have not yet been played.
   */
  stopAllSamplesStillToPlay() {
    if (!this.isPlaying) {
      return;
    }

    for (const sample of this.playingSamples) {
      if (
        !sample.triggered &&
        sample.eventStart > soundApi.GetCurrentAudioTime()
      ) {
        soundApi.StopSoundByUniqueId(MAIN_AUDIO_GROUP, sample.uniqueId);
      }
    }
  }
}
