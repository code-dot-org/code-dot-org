import {ChordEvent, ChordEventValue} from './interfaces/ChordEvent';
import {Effects} from './interfaces/Effects';
import {FunctionContext} from './interfaces/FunctionContext';
import {PatternEvent, PatternEventValue} from './interfaces/PatternEvent';
import {PlaybackEvent} from './interfaces/PlaybackEvent';
import {SkipContext} from './interfaces/SkipContext';
import {SoundEvent} from './interfaces/SoundEvent';
import {TrackMetadata} from './interfaces/TrackMetadata';
import MusicLibrary, {SoundData, SoundFolder, SoundType} from './MusicLibrary';
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
  private library: MusicLibrary;

  constructor(bpm: number = DEFAULT_BPM) {
    this.bpm = bpm;
    this.playbackEvents = [];
    this.tracksMetadata = {};
    this.uniqueInvocationIdUpto = 0;
    this.samplePlayer = new SamplePlayer();
    this.library = {groups: []};
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
    functionContext?: FunctionContext,
    skipContext?: SkipContext,
    effects?: Effects
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

    const endingMeasure = measure + soundData.length - 1;
    if (insideWhenRun) {
      this.lastWhenRunMeasure = Math.max(
        endingMeasure,
        this.lastWhenRunMeasure
      );
    } else {
      this.lastTriggeredMeasure = Math.max(
        endingMeasure,
        this.lastTriggeredMeasure
      );
    }

    const soundEvent: SoundEvent = {
      type: 'sound',
      id,
      triggered: !insideWhenRun,
      when: measure,
      trackId,
      functionContext,
      skipContext,
      effects
    };

    this.playbackEvents.push(soundEvent);

    if (this.samplePlayer.playing()) {
      this.samplePlayer.playSamples(this.convertEventToSamples(soundEvent));
    }
  }

  playPatternAtMeasureById(
    value: PatternEventValue,
    measure: number,
    insideWhenRun: boolean,
    trackId?: string,
    functionContext?: FunctionContext,
    skipContext?: SkipContext,
    effects?: Effects
  ) {
    if (!this.samplePlayer.initialized()) {
      console.log('MusicPlayer not initialized');
      return;
    }
    if (!value || !measure) {
      console.log(`Invalid input. pattern value: ${value} measure: ${measure}`);
      return;
    }

    const patternEvent: PatternEvent = {
      type: 'pattern',
      value,
      triggered: !insideWhenRun,
      when: measure,
      trackId,
      functionContext,
      skipContext,
      effects
    };

    this.playbackEvents.push(patternEvent);

    if (this.samplePlayer.playing()) {
      this.samplePlayer.playSamples(this.convertEventToSamples(patternEvent));
    }
  }

  playChordAtMeasure(
    value: ChordEventValue,
    measure: number,
    insideWhenRun: boolean,
    trackId?: string,
    functionContext?: FunctionContext,
    skipContext?: SkipContext,
    effects?: Effects
  ) {
    if (!this.samplePlayer.initialized()) {
      console.log('MusicPlayer not initialized');
      return;
    }
    if (!value || !measure) {
      console.log(`Invalid input. pattern value: ${value} measure: ${measure}`);
      return;
    }

    const chordEvent: ChordEvent = {
      type: 'chord',
      value,
      triggered: !insideWhenRun,
      when: measure,
      trackId,
      functionContext,
      skipContext,
      effects
    };

    this.playbackEvents.push(chordEvent);

    if (this.samplePlayer.playing()) {
      this.samplePlayer.playSamples(this.convertEventToSamples(chordEvent));
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

  previewChord(chordValue: ChordEventValue, onStop: () => any) {
    const chordEvent: ChordEvent = {
      type: 'chord',
      when: 1,
      value: chordValue,
      triggered: false
    };
    this.samplePlayer.previewSamples(
      this.convertEventToSamples(chordEvent),
      onStop
    );
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
    this.lastWhenRunMeasure = 0;
  }

  getPlaybackEvents(): PlaybackEvent[] {
    return this.playbackEvents;
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

    this.lastTriggeredMeasure = 0;
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
    // if (event.skipContext?.skipSound) {
    //   return [];
    // }

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
    } else if (event.type === 'chord') {
      const chordEvent = event as ChordEvent;
      const {instrument, notes, playStyle} = chordEvent.value;
      const results: SampleEvent[] = [];

      const folder: SoundFolder | null =
        this.library.groups[0].folders.find(
          folder => folder.path === instrument
        ) || null;

      if (folder === null) {
        console.warn(`No instrument ${instrument}`);
        return [];
      }

      if (playStyle === 'arpeggio-up') {
        notes.sort();
      } else if (playStyle === 'arpeggio-down') {
        notes.sort().reverse();
      } else if (playStyle === 'arpeggio-random') {
        // Randomize using Fisher-Yates Algorithm
        for (let i = notes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = notes[i];
          notes[i] = notes[j];
          notes[j] = temp;
        }
      }

      for (let i = 0; i < (playStyle === 'together' ? notes.length : 16); i++) {
        const note = notes[i % notes.length];
        const sound = folder.sounds.find(sound => sound.note === note) || null;
        if (sound === null) {
          console.warn(
            `No sound for note value ${note} on instrument ${instrument}`
          );
          continue;
        }

        const noteWhen =
          playStyle === 'together' ? chordEvent.when : chordEvent.when + i / 16;

        results.push({
          sampleId: `${instrument}/${sound.src}`,
          offsetSeconds: this.convertPlayheadPositionToSeconds(noteWhen),
          ...event
        });
      }

      return results;
    }

    return [];
  }
}
