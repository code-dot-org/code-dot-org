import {ChordEvent, ChordEventValue} from './interfaces/ChordEvent';
import {Effects} from './interfaces/Effects';
import {FunctionContext} from './interfaces/FunctionContext';
import {PatternEvent, PatternEventValue} from './interfaces/PatternEvent';
import {PlaybackEvent} from './interfaces/PlaybackEvent';
import {SkipContext} from './interfaces/SkipContext';
import {SoundEvent} from './interfaces/SoundEvent';
import {TrackMetadata} from './interfaces/TrackMetadata';
import MusicLibrary, {SoundFolder} from './MusicLibrary';
import SamplePlayer, {SampleEvent} from './SamplePlayer';
import {generateNotesFromChord, ChordNote} from '../utils/Chords';

// Using require() to import JS in TS files
const soundApi = require('./sound');
const constants = require('../constants');

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
  private lastMeasure: number;
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

  getBPM(): number {
    return this.bpm;
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
    effects?: Effects,
    blockId?: string
  ) {
    if (!this.samplePlayer.initialized() || this.library === null) {
      console.log('MusicPlayer not initialized');
      return;
    }
    const soundData = this.library.getSoundForId(id);
    if (!id || soundData === null || !measure) {
      console.log(`Invalid input. id: ${id} measure: ${measure}`);
      return;
    }

    const soundEvent: SoundEvent = {
      type: 'sound',
      id,
      triggered: !insideWhenRun,
      when: measure,
      trackId,
      functionContext,
      skipContext,
      effects,
      length: soundData.length,
      soundType: soundData.type,
      blockId
    };

    this.addNewEvent(soundEvent);

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
    effects?: Effects,
    blockId?: string
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
      effects,
      length: constants.DEFAULT_PATTERN_LENGTH,
      blockId
    };

    this.addNewEvent(patternEvent);

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
    effects?: Effects,
    blockId?: string
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
      effects,
      length: constants.DEFAULT_CHORD_LENGTH,
      blockId
    };

    this.addNewEvent(chordEvent);

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
  previewSound(id: string, onStop?: () => any) {
    this.samplePlayer.previewSample(id, onStop);
  }

  previewChord(chordValue: ChordEventValue, onStop?: () => any) {
    const chordEvent: ChordEvent = {
      type: 'chord',
      when: 1,
      value: chordValue,
      triggered: false,
      length: constants.DEFAULT_CHORD_LENGTH
    };
    this.samplePlayer.previewSamples(
      this.convertEventToSamples(chordEvent),
      onStop
    );
  }

  previewNote(note: number, instrument: string, onStop?: () => any) {
    const sampleId = this.getSampleForNote(note, instrument);
    if (sampleId === null) {
      return;
    }

    this.previewSound(sampleId, onStop);
  }

  previewPattern(patternValue: PatternEventValue, onStop?: () => any) {
    const patternEvent: PatternEvent = {
      type: 'pattern',
      when: 1,
      value: patternValue,
      triggered: false,
      length: constants.DEFAULT_PATTERN_LENGTH
    };

    this.samplePlayer.previewSamples(
      this.convertEventToSamples(patternEvent),
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
  }

  /**
   * Clear all from the list of playback events, and stop any sounds that have 
   * not yet been played, if playback is in progress.
   */
  clearAllEvents() {
    this.playbackEvents = [];
    this.lastMeasure = 0;
    this.tracksMetadata = {};

    Object.keys(this.tracksMetadata).forEach(trackId => {
      if (this.tracksMetadata[trackId].insideWhenRun) {
        delete this.tracksMetadata[trackId];
      }
    });

    // If playing, stop all samples that have not yet been played.
    this.samplePlayer.stopAllSamplesStillToPlay();
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
    if (this.library === null) {
      console.warn('MusicPlayer not initialized');
      return;
    }

    if (!this.tracksMetadata[trackId]) {
      console.warn('No track with ID: ' + trackId);
      return;
    }

    const {currentMeasure, insideWhenRun} = this.tracksMetadata[trackId];
    let maxSoundLength = 0;

    for (const soundId of soundIds) {
      this.playSoundAtMeasureById(
        soundId,
        currentMeasure,
        insideWhenRun,
        trackId
      );

      maxSoundLength = Math.max(
        maxSoundLength,
        this.library.getSoundForId(soundId)?.length || 0
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

  getTracksMetadata(): {[trackId: string]: TrackMetadata} {
    return this.tracksMetadata;
  }

  // Called by interpreted code in the simple2 model, this returns
  // a unique value that is used to differentiate each invocation of
  // a function, so that the timeline renderer can group relevant events.
  getUniqueInvocationId() {
    return this.uniqueInvocationIdUpto++;
  }

  // Returns an object containing two arrays.  One has the block IDs of all
  // blocks currently playing, while the other is for those not currently
  // playing.
  getCurrentlyPlayingBlockIds(): string[] {
    const currentPlayheadPosition = this.getCurrentPlayheadPosition();
    const playbackEvents = this.getPlaybackEvents();

    const playingBlockIds: string[] = [];

    playbackEvents.forEach((playbackEvent: PlaybackEvent) => {
      const currentlyPlaying =
        currentPlayheadPosition !== 0 &&
        currentPlayheadPosition >= playbackEvent.when &&
        currentPlayheadPosition < playbackEvent.when + playbackEvent.length;

      if (currentlyPlaying) {
        playingBlockIds.push(playbackEvent.blockId || '');
      }
    });

    return playingBlockIds;
  }

  private addNewEvent(event: PlaybackEvent) {
    this.playbackEvents.push(event);
    this.lastMeasure = Math.max(this.lastMeasure, event.when + event.length - 1);
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

      for (const event of patternEvent.value.events) {
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
      const results: SampleEvent[] = this.convertChordEventToSampleEvents(
        event
      );
      return results;
    }

    return [];
  }

  convertChordEventToSampleEvents(event: PlaybackEvent): SampleEvent[] {
    const chordEvent = event as ChordEvent;

    const {instrument, notes} = chordEvent.value;
    if (notes.length === 0) {
      return [];
    }

    const results: SampleEvent[] = [];

    const generatedNotes: ChordNote[] = generateNotesFromChord(
      chordEvent.value
    );

    generatedNotes.forEach(note => {
      const sampleId = this.getSampleForNote(note.note, instrument);
      if (sampleId === null) {
        console.warn(
          `No sound for note value ${note} on instrument ${instrument}`
        );
      } else {
        const noteWhen = chordEvent.when + (note.tick - 1) / 16;

        results.push({
          sampleId,
          offsetSeconds: this.convertPlayheadPositionToSeconds(noteWhen),
          ...event
        });
      }
    });

    return results;
  }

  private getSampleForNote(note: number, instrument: string): string | null {
    if (this.library === null) {
      console.warn('Music Player not initialized');
      return null;
    }

    const folder: SoundFolder | null = this.library.getFolderForPath(
      instrument
    );

    if (folder === null) {
      console.warn(`No instrument ${instrument}`);
      return null;
    }

    const sound = folder.sounds.find(sound => sound.note === note) || null;
    if (sound === null) {
      console.warn(
        `No sound for note value ${note} on instrument ${instrument}`
      );
      return null;
    }

    return `${instrument}/${sound.src}`;
  }
}
