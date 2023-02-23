// interface SampleEvent {
//     offsetSeconds: number;
//     sampleId: string;
//     triggered: boolean;
// }

import {
  GetCurrentAudioTime,
  InitSound,
  PlaySound,
  StopSound,
  StopSoundByUniqueId
} from './sound';

const GROUP_TAG = 'mainaudio';

/**
 * Handles playback of individual samples.
 */
export default class SamplePlayer {
  constructor() {
    this.groupPrefix = 'all';
    this.playingSamples = [];
    this.isPlaying = false;
    this.startPlayingAudioTime = -1;
    this.isInitialized = false;
  }

  initialize(library) {
    const soundList = library.groups
      .map(group => {
        return group.folders?.map(folder => {
          return folder.sounds.map(sound => {
            return group.path + '/' + folder.path + '/' + sound.src;
          });
        });
      })
      .flat(2);
    InitSound(soundList);

    this.isInitialized = true;
  }

  initialized() {
    return this.isInitialized;
  }

  startPlayback(sampleEventList) {
    if (!this.isInitialized) {
      console.warn('Sample player not initialized.');
      return;
    }

    this.stopPlayback();

    this.startPlayingAudioTime = GetCurrentAudioTime();
    this.isPlaying = true;

    this.playSamples(sampleEventList);
  }

  previewSample(sampleId, onStop) {
    if (!this.isInitialized) {
      console.warn('Sample player not initialized.');
      return;
    }

    this.stopPlayback();

    PlaySound(this.groupPrefix + '/' + sampleId, GROUP_TAG, 0, onStop);
  }

  playing() {
    return this.isPlaying;
  }

  getElapsedPlaybackTimeSeconds() {
    const currentAudioTime = GetCurrentAudioTime();
    if (!this.isPlaying || currentAudioTime === null) {
      return -1;
    }

    return currentAudioTime - this.startPlayingAudioTime;
  }

  playSamples(sampleEvents) {
    if (!this.isInitialized) {
      console.warn('Sample player not initialized.');
      return;
    }

    if (!this.isPlaying) {
      return;
    }

    for (const sampleEvent of sampleEvents) {
      const currentAudioTime = GetCurrentAudioTime();
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
        const uniqueId = PlaySound(
          this.groupPrefix + '/' + sampleEvent.sampleId,
          GROUP_TAG,
          eventStart
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
    StopSound(GROUP_TAG);
    this.playingSamples = [];
    this.isPlaying = false;
    this.startPlayingAudioTime = -1;
  }

  stopAllSamplesStillToPlay() {
    if (!this.isPlaying) {
      return;
    }

    for (const sample of this.playingSamples) {
      if (!sample.triggered && sample.eventStart > GetCurrentAudioTime()) {
        StopSoundByUniqueId(GROUP_TAG, sample.uniqueId);
      }
    }
  }
}
