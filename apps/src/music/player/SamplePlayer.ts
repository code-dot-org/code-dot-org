import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import {Effects} from './interfaces/Effects';
import SoundCache from './SoundCache';
import SoundPlayer from './SoundPlayer';

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
  private readonly soundCache: SoundCache;
  private readonly soundPlayer: SoundPlayer;
  private playingSamples: PlayingSample[];
  private isPlaying: boolean;
  private startPlayingAudioTime: number;
  private updateLoadProgress: ((value: number) => void) | undefined;

  constructor() {
    this.playingSamples = [];
    this.isPlaying = false;
    this.startPlayingAudioTime = -1;
    this.soundCache = new SoundCache();
    this.soundPlayer = new SoundPlayer();
  }

  setUpdateLoadProgress(updateLoadProgress: (value: number) => void) {
    this.updateLoadProgress = updateLoadProgress;
  }

  setBpm(bpm: number) {
    const secondsPerBeat = 60 / bpm;
    this.soundPlayer.updateConfiguration({
      // Calculate release time using release duration factor
      releaseTimeSeconds: secondsPerBeat * RELEASE_DURATION_FACTOR,
      // Use a delay value of a half of a beat
      delayTimeSeconds: secondsPerBeat / 2,
    });
  }

  /**
   * Start playback with the given sample events. Loads sounds into the cache if necessary.
   * @param sampleEventList samples to play
   * @param playTimeOffsetSeconds the number of seconds to offset playback by.
   */
  startPlayback(
    sampleEventList: SampleEvent[],
    playTimeOffsetSeconds?: number
  ) {
    this.loadSounds(sampleEventList.map(event => event.sampleId)).then(() =>
      this.startInternal(sampleEventList, playTimeOffsetSeconds)
    );
  }

  previewSample(sampleId: string, onStop?: () => void) {
    this.cancelPreviews();

    this.soundCache
      .loadSound(sampleId)
      .then(audioBuffer => {
        if (!audioBuffer) {
          Lab2MetricsReporter.logError('Error loading sound', undefined, {
            sound: sampleId,
          });
          return;
        }
        this.soundPlayer.playSound(audioBuffer, PREVIEW_GROUP, 0, onStop);
      })
      .catch(error => {
        Lab2MetricsReporter.logError('Error loading sound', error as Error, {
          sound: sampleId,
        });
      });
  }

  previewSamples(events: SampleEvent[], onStop?: () => void) {
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

    this.loadSounds(events.map(event => event.sampleId));

    events.forEach(event => {
      const audioBuffer = this.soundCache.getSound(event.sampleId);
      if (!audioBuffer) {
        Lab2MetricsReporter.logWarning(
          'Could not load sound which should have been in cache: ' +
            event.sampleId
        );
      } else {
        this.soundPlayer.playSound(
          audioBuffer,
          PREVIEW_GROUP,
          this.soundPlayer.getCurrentAudioTime() + event.offsetSeconds,
          onStopWrapper
        );
      }
    });
  }

  playing(): boolean {
    return this.isPlaying;
  }

  getElapsedPlaybackTimeSeconds(): number {
    const currentAudioTime = this.soundPlayer.getCurrentAudioTime();
    if (!this.isPlaying || currentAudioTime === null) {
      return -1;
    }

    return currentAudioTime - this.startPlayingAudioTime;
  }

  playSamples(sampleEvents: SampleEvent[]) {
    if (!this.isPlaying) {
      return;
    }

    for (const sampleEvent of sampleEvents) {
      const currentAudioTime = this.soundPlayer.getCurrentAudioTime();
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
        const buffer = this.soundCache.getSound(sampleEvent.sampleId);
        if (!buffer) {
          Lab2MetricsReporter.logWarning(
            'Could not load sound which should have been in cache: ' +
              sampleEvent.sampleId
          );
          continue;
        }
        const uniqueId = this.soundPlayer.playSound(
          buffer,
          MAIN_AUDIO_GROUP,
          eventStart,
          undefined,
          false,
          sampleEvent.effects,
          sampleEvent.lengthSeconds
        );

        if (uniqueId !== undefined) {
          this.playingSamples.push({
            eventStart,
            uniqueId,
          });
        }
      }
    }
  }

  stopPlayback() {
    this.soundPlayer.stopSound(MAIN_AUDIO_GROUP);
    this.soundPlayer.stopSound(PREVIEW_GROUP);
    this.playingSamples = [];
    this.isPlaying = false;
    this.startPlayingAudioTime = -1;
  }

  cancelPreviews() {
    this.soundPlayer.stopSound(PREVIEW_GROUP);
  }

  /**
   * Stops all samples that have not yet been played.
   */
  stopAllSamplesStillToPlay() {
    if (!this.isPlaying) {
      return;
    }

    for (const sample of this.playingSamples) {
      if (sample.eventStart > this.soundPlayer.getCurrentAudioTime()) {
        this.soundPlayer.stopSoundByUniqueId(MAIN_AUDIO_GROUP, sample.uniqueId);
      }
    }
  }

  async loadSounds(sampleIds: string[], onLoadFinished?: () => void) {
    await this.soundCache.loadSounds(sampleIds, {
      updateLoadProgress: this.updateLoadProgress,
      onLoadFinished,
    });
  }

  private startInternal(
    sampleEventList: SampleEvent[],
    playTimeOffsetSeconds?: number
  ) {
    this.startPlayingAudioTime =
      this.soundPlayer.getCurrentAudioTime() - (playTimeOffsetSeconds || 0);
    this.isPlaying = true;

    this.playSamples(sampleEventList);

    this.soundPlayer.startPlayback();
  }
}
