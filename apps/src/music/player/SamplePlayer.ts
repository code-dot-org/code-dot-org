import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import {Effects} from './interfaces/Effects';
import MusicLibrary from './MusicLibrary';

// Using require() to import JS in TS files
const soundApi = require('./sound');

// Multiplied by the duration of a single beat to determine the length of
// time to fade out a sound, if trimming to a specific duration. This results
// in a duration slightly smaller than a 16th note (0.25 of a beat), and 16th
// notes are the shortest possible notes, so the release duration should never
// be longer than a sound.
const RELEASE_DURATION_FACTOR = 0.2;

export interface SampleEvent {
  offsetSeconds: number;
  sampleId: string;
  triggered: boolean;
  effects?: Effects;
  lengthSeconds?: number;
}

interface PlayingSample {
  eventStart: number;
  uniqueId: number;
}

const MAIN_AUDIO_GROUP = 'mainaudio';
const PREVIEW_GROUP = 'preview';

/**
 * Handles playback of individual samples.
 */
export default class SamplePlayer {
  private playingSamples: PlayingSample[];
  private isPlaying: boolean;
  private startPlayingAudioTime: number;
  private isInitialized: boolean;
  private groupPath: string;

  constructor() {
    this.playingSamples = [];
    this.isPlaying = false;
    this.startPlayingAudioTime = -1;
    this.isInitialized = false;
    this.groupPath = '';
  }

  initialize(
    library: MusicLibrary,
    bpm: number,
    updateLoadProgress: (value: number) => void
  ) {
    const soundList = library.groups
      .map(group => {
        return group.folders.map(folder => {
          return folder.sounds
            .map(sound => {
              // Skip loading sequenced sounds; these are generated at runtime
              // and made up of individual instrument samples.
              if (!sound.sequence) {
                return {
                  path: group.path + '/' + folder.path + '/' + sound.src,
                  restricted: sound.restricted,
                };
              }
            })
            .filter(sound => sound !== undefined);
        });
      })
      .flat(2);

    const secondsPerBeat = 60 / bpm;
    soundApi.InitSound(soundList, {
      // Calculate release time using release duration factor
      releaseTimeSeconds: secondsPerBeat * RELEASE_DURATION_FACTOR,
      // Use a delay value of a half of a beat
      delayTimeSeconds: secondsPerBeat / 2,
      reportSoundLibraryLoadTime: (loadTimeMs: number) => {
        Lab2MetricsReporter.reportLoadTime('SoundLibraryLoadTime', loadTimeMs, [
          {name: 'Library', value: library.name},
        ]);
      },
      updateLoadProgress: updateLoadProgress,
    });

    this.groupPath = library.groups[0].path;

    this.isInitialized = true;
  }

  initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Start playback with the given sample events.
   * @param sampleEventList samples to play
   * @param playTimeOffsetSeconds the number of seconds to offset playback by.
   */
  startPlayback(
    sampleEventList: SampleEvent[],
    playTimeOffsetSeconds?: number
  ) {
    if (!this.isInitialized) {
      this.logUninitialized();
      return;
    }

    this.stopPlayback();
    this.startPlayingAudioTime =
      soundApi.GetCurrentAudioTime() - (playTimeOffsetSeconds || 0);
    this.isPlaying = true;

    this.playSamples(sampleEventList);

    soundApi.StartPlayback();
  }

  previewSample(sampleId: string, onStop?: () => void) {
    if (!this.isInitialized) {
      this.logUninitialized();
      return;
    }

    this.cancelPreviews();

    soundApi.PlaySound(
      this.groupPath + '/' + sampleId,
      PREVIEW_GROUP,
      0,
      onStop
    );
  }

  previewSamples(events: SampleEvent[], onStop?: () => void) {
    if (!this.isInitialized) {
      this.logUninitialized();
      return;
    }

    this.cancelPreviews();

    let counter = 0;
    const onStopWrapper = onStop
      ? () => {
          counter++;
          if (counter === events.length) {
            onStop();
          }
        }
      : undefined;

    events.forEach(event => {
      soundApi.PlaySound(
        this.groupPath + '/' + event.sampleId,
        PREVIEW_GROUP,
        soundApi.GetCurrentAudioTime() + event.offsetSeconds,
        onStopWrapper
      );
    });
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
      this.logUninitialized();
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
      // We have a similar, but smaller, grace period for non-triggered sounds,
      // since it might take a little time to start playing all the sounds in a
      // complex song.
      const delayCompensation = sampleEvent.triggered ? 0.1 : 0.05;

      if (eventStart >= currentAudioTime - delayCompensation) {
        const uniqueId = soundApi.PlaySound(
          this.groupPath + '/' + sampleEvent.sampleId,
          MAIN_AUDIO_GROUP,
          eventStart,
          null,
          false,
          sampleEvent.effects,
          sampleEvent.lengthSeconds
        );

        this.playingSamples.push({
          eventStart,
          uniqueId,
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
   * Stops all samples that have not yet been played.
   */
  stopAllSamplesStillToPlay() {
    if (!this.isPlaying) {
      return;
    }

    for (const sample of this.playingSamples) {
      if (sample.eventStart > soundApi.GetCurrentAudioTime()) {
        soundApi.StopSoundByUniqueId(MAIN_AUDIO_GROUP, sample.uniqueId);
      }
    }
  }

  private logUninitialized() {
    Lab2MetricsReporter.logWarning('Sample player not initialized.');
  }
}
