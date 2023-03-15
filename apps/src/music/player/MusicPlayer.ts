import {Effects} from './interfaces/Effects';
import {FunctionContext} from './interfaces/FunctionContext';
import {PatternEvent, PatternEventValue} from './interfaces/PatternEvent';
import {PlaybackEvent} from './interfaces/PlaybackEvent';
import {SkipContext} from './interfaces/SkipContext';
import {SoundEvent} from './interfaces/SoundEvent';
import {TrackMetadata} from './interfaces/TrackMetadata';
import MusicLibrary, {SoundData, SoundType} from './MusicLibrary';
import SamplePlayer, {SampleEvent} from './SamplePlayer';

// Using require() to import JS in TS files
const soundApi = require('./sound');

// Default to 4/4 time
const BEATS_PER_MEASURE = 4;
const DEFAULT_BPM = 120;

/**
 * Main music player component which maintains the list of playback events and
 * uses a {@link SamplePlayer} to play sounds.
 */
export default class MusicPlayer {
  private bpm: number;
  private playbackEvents: PlaybackEvent[];
  private lastTriggeredMeasure: number;
  private lastWhenRunMeasure: number;
  private tracksMetadata: {[trackId: string]: TrackMetadata};
  private uniqueInvocationIdUpto: number;
  private samplePlayer: SamplePlayer;
  private library: MusicLibrary | null;

  constructor(bpm: number = DEFAULT_BPM) {
    this.bpm = bpm;
    this.playbackEvents = [];
    this.tracksMetadata = {};
    this.uniqueInvocationIdUpto = 0;
    this.samplePlayer = new SamplePlayer();
    this.library = null;
    this.lastTriggeredMeasure = 0;
    this.lastWhenRunMeasure = 0;
  }

  /**
   * Initializes the MusicPlayer and {@link SamplePlayer} with the music library.
   * Playback cannot start until the player is initialized.
   */
  initialize(library: MusicLibrary) {
    this.library = library;
    this.samplePlayer.initialize(library);
  }

  /**
   * Load a sound into the sound system using the given buffer. Currently only
   * used to upload custom sounds (hidden/demo-only feature).
   *
   * @param id
   * @param buffer
   */
  loadSoundFromBuffer(id: number, buffer: ArrayBuffer) {
    soundApi.LoadSoundFromBuffer(id, buffer);
  }

  /**
   * Preview the given sound. Plays immediately.
   *
   * @param id unique ID of the sound
   * @param onStop called when the sound finished playing
   */
  previewSound(id: string, onStop: () => any) {
    this.samplePlayer.previewSample(id, onStop);
  }

  /**
   * Cancels any ongoing previews.
   */
  cancelPreviews() {
    this.samplePlayer.cancelPreviews();
  }

  startPlaybackWithEvents(events: PlaybackEvent[]) {
    this.samplePlayer.startPlayback(
      events.map(event => this.convertEventToSamples(event)).flat()
    );
  }

  playEvents(events: PlaybackEvent[]) {
    this.samplePlayer.playSamples(
      events.map(event => this.convertEventToSamples(event)).flat()
    );
  }

  /**
   * Stop playback. Tells the {@link SamplePlayer} to stop all sample playback.
   */
  stopSong() {
    this.samplePlayer.stopPlayback();
  }

  /**
   * Clear all non-triggered events from the list of playback events, and stop
   * any sounds that have not yet been played, if playback is in progress.
   */
  stopAllSoundsStillToPlay() {
    // If playing, stop all non-triggered samples that have not yet been played.
    this.samplePlayer.stopAllSamplesStillToPlay();
    this.lastWhenRunMeasure = 0;
  }

  getLastMeasure(): number {
    return Math.max(this.lastWhenRunMeasure, this.lastTriggeredMeasure);
  }

  // Returns the current playhead position, in floating point for an exact position,
  // 1-based, and scaled to measures.
  // Returns 0 if music is not playing.
  getCurrentPlayheadPosition(): number {
    const elapsedTime = this.samplePlayer.getElapsedPlaybackTimeSeconds();
    if (elapsedTime === -1) {
      return 0;
    }
    return this.convertSecondsToPlayheadPosition(elapsedTime);
  }

  // Converts actual seconds used by the audio system into a playhead
  // position, which is 1-based and scaled to measures.
  convertSecondsToPlayheadPosition(seconds: number): number {
    return 1 + seconds / this.secondsPerMeasure();
  }

  // Converts a playhead position, which is 1-based and scaled to measures,
  // into actual seconds used by the audio system.
  convertPlayheadPositionToSeconds(playheadPosition: number): number {
    return this.secondsPerMeasure() * (playheadPosition - 1);
  }

  secondsPerMeasure() {
    return (60 / this.bpm) * BEATS_PER_MEASURE;
  }

  getTracksMetadata(): {[trackId: string]: TrackMetadata} {
    return this.tracksMetadata;
  }

  // Called by interpreted code in the simple2 model, this returns
  // a unique value that is used to differentiate each invocation of
  // a function, so that the timeline renderer can group relevant events.
  getUniqueInvocationId() {
    return this.uniqueInvocationIdUpto++;
  }

  private convertEventToSamples(event: PlaybackEvent): SampleEvent[] {
    if (event.skipContext?.skipSound) {
      return [];
    }

    if (event.type === 'sound') {
      const soundEvent = event as SoundEvent;
      return [
        {
          sampleId: soundEvent.id,
          offsetSeconds: this.convertPlayheadPositionToSeconds(soundEvent.when),
          triggered: soundEvent.triggered,
          effects: soundEvent.effects
        }
      ];
    } else if (event.type === 'pattern') {
      const patternEvent = event as PatternEvent;

      const results = [];

      const kit = patternEvent.value.kit;

      for (let event of patternEvent.value.events) {
        const resultEvent = {
          sampleId: `${kit}/${event.src}`,
          offsetSeconds: this.convertPlayheadPositionToSeconds(
            patternEvent.when + (event.tick - 1) / 16
          ),
          triggered: patternEvent.triggered,
          effects: patternEvent.effects
        };

        results.push(resultEvent);
      }

      return results;
    }

    return [];
  }
}
