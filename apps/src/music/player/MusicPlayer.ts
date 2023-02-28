import MusicLibrary, {SoundData, SoundType} from './MusicLibrary';
import SamplePlayer, {SampleEvent} from './SamplePlayer';
// Using require() to import JS in TS files
const soundApi = require('./sound');

// Default to 4/4 time
const BEATS_PER_MEASURE = 4;
const DEFAULT_BPM = 120;

interface PlaybackEvent {
  /** Type of event */
  type: 'sound' | 'pattern';
  /** Measure when this event occurs */
  when: number;
  /** Whether this event was triggered or scheduled via standard playback */
  triggered: boolean;
  /** ID of the track this event belongs to (only used in Tracks mode) */
  trackId?: string;
  /** Function context this event belongs to (only used in Simple2 mode) */
  functionContext?: FunctionContext;
}

interface FunctionContext {
  /** Name of the function */
  name: string;
  /** Unique ID corresponding to each invocation */
  uniqueInvocationId: number;
}

interface SoundEvent extends PlaybackEvent {
  type: 'sound';
  id: string;
}

interface TrackMetadata {
  /** Display name of the track */
  name: string;
  /** Whether this track was triggered or scheduled via standard playback */
  insideWhenRun: boolean;
  /** The current last measure of the track, i.e. the measure at which new sounds or rests will be added */
  currentMeasure: number;
  /** The maximum number of concurrent sounds in this track */
  maxConcurrentSounds: number;
}

/**
 * Main music player component which maintains the list of playback events and
 * uses a {@link SamplePlayer} to play sounds.
 */
export default class MusicPlayer {
  private bpm: number;
  private playbackEvents: PlaybackEvent[];
  private lastMeasure: number;
  private tracksMetadata: {[trackId: string]: TrackMetadata};
  private uniqueInvocationIdUpto: number;
  private samplePlayer: SamplePlayer;
  private library: MusicLibrary;

  constructor(bpm: number = DEFAULT_BPM) {
    this.bpm = bpm;
    this.playbackEvents = [];
    this.tracksMetadata = {};
    this.uniqueInvocationIdUpto = 0;
    this.samplePlayer = new SamplePlayer();
    this.library = {groups: []};
    this.lastMeasure = 0;
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
   * Schedule a given sound (identified by its ID) for playback, at a given measure.
   * If playback is in progress, the sound will be played by the {@link SamplePlayer}
   *
   * @param id unique ID of the sound
   * @param measure when the sound should be played
   * @param insideWhenRun whether the sound was scheduled via normal playback, or triggered
   * @param trackId (optional) track ID this sound belongs to
   * @param functionContext (optional) function context this sound belongs to
   */
  playSoundAtMeasureById(
    id: string,
    measure: number,
    insideWhenRun: boolean,
    trackId?: string,
    functionContext?: FunctionContext
  ) {
    if (!this.samplePlayer.initialized()) {
      console.log('MusicPlayer not initialized');
      return;
    }
    const soundData = this.getSoundForId(id);
    if (!id || soundData === null || !measure) {
      console.log(`Invalid input. id: ${id} measure: ${measure}`);
      return;
    }

    this.lastMeasure = Math.max(
      measure + soundData.length - 1,
      this.lastMeasure
    );

    const soundEvent: SoundEvent = {
      type: 'sound',
      id,
      triggered: !insideWhenRun,
      when: measure,
      trackId,
      functionContext
    };

    this.playbackEvents.push(soundEvent);

    if (this.samplePlayer.playing()) {
      this.samplePlayer.playSamples(this.convertEventToSamples(soundEvent));
    }
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

  /**
   * Start playback. Schedules all queued playback events for playback
   * and tells the {@link SamplePlayer} to start playing.
   */
  playSong() {
    const sampleEvents = [];
    for (const event of this.playbackEvents) {
      sampleEvents.push(...this.convertEventToSamples(event));
    }

    this.samplePlayer.startPlayback(sampleEvents);
  }

  /**
   * Stop playback. Tells the {@link SamplePlayer} to stop all sample playback.
   */
  stopSong() {
    this.samplePlayer.stopPlayback();
    this.clearTriggeredEvents();
    this.lastMeasure = 0;
  }

  /**
   * Clear all non-triggered events from the list of playback events, and stop
   * any sounds that have not yet been played, if playback is in progress.
   */
  clearWhenRunEvents() {
    this.playbackEvents = this.playbackEvents.filter(
      playbackEvent => playbackEvent.triggered
    );
    Object.keys(this.tracksMetadata).forEach(trackId => {
      if (this.tracksMetadata[trackId].insideWhenRun) {
        delete this.tracksMetadata[trackId];
      }
    });

    // If playing, stop all non-triggered samples that have not yet been played.
    this.samplePlayer.stopAllSamplesStillToPlay();
    this.lastMeasure = 0;
  }

  getPlaybackEvents(): PlaybackEvent[] {
    return this.playbackEvents;
  }

  getLastMeasure(): number {
    return this.lastMeasure;
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

  /**
   * Create a new track.
   *
   * @param id unique ID of this track
   * @param name display name of the track (does not have to be unique)
   * @param measureStart starting measure of the track
   * @param insideWhenRun whether the track was scheduled via standard playback, or triggered
   */
  createTrack(
    id: string,
    name: string,
    measureStart: number,
    insideWhenRun: boolean
  ) {
    if (id === null) {
      console.warn(`Invalid track ID`);
      return;
    }

    if (this.tracksMetadata[id]) {
      console.warn(`Track ${id}: ${name} already exists!`);
      return;
    }

    this.tracksMetadata[id] = {
      name,
      insideWhenRun,
      currentMeasure: measureStart,
      maxConcurrentSounds: 0
    };
  }

  /**
   * Add the given sounds to the track identified by the track Id
   *
   * @param trackId
   * @param soundIds
   */
  addSoundsToTrack(trackId: string, ...soundIds: string[]) {
    if (!this.tracksMetadata[trackId]) {
      console.warn('No track with ID: ' + trackId);
      return;
    }

    const {currentMeasure, insideWhenRun} = this.tracksMetadata[trackId];
    let maxSoundLength = 0;

    for (let soundId of soundIds) {
      this.playSoundAtMeasureById(
        soundId,
        currentMeasure,
        insideWhenRun,
        trackId
      );
      maxSoundLength = Math.max(
        maxSoundLength,
        this.getLengthForId(soundId) || 0
      );
    }

    this.tracksMetadata[trackId].currentMeasure += maxSoundLength;
    this.tracksMetadata[trackId].maxConcurrentSounds = Math.max(
      soundIds.length,
      this.tracksMetadata[trackId].maxConcurrentSounds
    );
  }

  /**
   * Add a rest of the given length to the track identified by the track ID.
   *
   * @param trackId
   * @param lengthMeasures
   */
  addRestToTrack(trackId: string, lengthMeasures: number) {
    if (!this.tracksMetadata[trackId]) {
      console.warn('No track with ID: ' + trackId);
      return;
    }

    this.tracksMetadata[trackId].currentMeasure += lengthMeasures;
  }

  clearTracksData() {
    this.tracksMetadata = {};
  }

  getTracksMetadata(): {[trackId: string]: TrackMetadata} {
    return this.tracksMetadata;
  }

  getLengthForId(id: string): number | null {
    const sound = this.getSoundForId(id);
    if (sound === null) {
      console.warn(`Could not find sound with ID: ${id}`);
      return null;
    }
    return sound.length;
  }

  getTypeForId(id: string): SoundType | null {
    const sound = this.getSoundForId(id);
    if (sound === null) {
      console.warn(`Could not find sound with ID: ${id}`);
      return null;
    }

    return sound.type;
  }

  // Called by interpreted code in the simple2 model, this returns
  // a unique value that is used to differentiate each invocation of
  // a function, so that the timeline renderer can group relevant events.
  getUniqueInvocationId() {
    return this.uniqueInvocationIdUpto++;
  }

  /**
   * Clear all triggered events from the list of playback events.
   */
  private clearTriggeredEvents() {
    this.playbackEvents = this.playbackEvents.filter(
      playbackEvent => !playbackEvent.triggered
    );

    Object.keys(this.tracksMetadata).forEach(trackId => {
      if (!this.tracksMetadata[trackId].insideWhenRun) {
        delete this.tracksMetadata[trackId];
      }
    });
  }

  private getSoundForId(id: string): SoundData | null {
    const splitId = id.split('/');
    const path = splitId[0];
    const src = splitId[1];

    const folder = this.library.groups[0].folders.find(
      folder => folder.path === path
    );

    if (folder) {
      return folder.sounds.find(sound => sound.src === src) || null;
    }

    return null;
  }

  private convertEventToSamples(event: PlaybackEvent): SampleEvent[] {
    if (event.type === 'sound') {
      const soundEvent = event as SoundEvent;
      return [
        {
          sampleId: soundEvent.id,
          offsetSeconds: this.convertPlayheadPositionToSeconds(soundEvent.when),
          triggered: soundEvent.triggered
        }
      ];
    }

    return [];
  }
}
