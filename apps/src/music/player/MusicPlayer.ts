import {ChordEvent, ChordEventValue} from './interfaces/ChordEvent';
import {PatternEvent, PatternEventValue} from './interfaces/PatternEvent';
import {PlaybackEvent} from './interfaces/PlaybackEvent';
import {SoundEvent} from './interfaces/SoundEvent';
import MusicLibrary, {SampleSequence, SoundFolder} from './MusicLibrary';
import SamplePlayer, {SampleEvent} from './SamplePlayer';
import {generateNotesFromChord, ChordNote} from '../utils/Chords';
import {getTranposedNote, Key} from '../utils/Notes';
import {Effects} from './interfaces/Effects';
import Lab2MetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';

// Using require() to import JS in TS files
const constants = require('../constants');

// Default to 4/4 time, 120 BPM, C Major
const BEATS_PER_MEASURE = 4;
const DEFAULT_BPM = 120;
const DEFAULT_KEY = Key.C;

/**
 * Main music player component which maintains the list of playback events and
 * uses a {@link SamplePlayer} to play sounds.
 */
export default class MusicPlayer {
  private bpm: number;
  private key: Key;
  private samplePlayer: SamplePlayer;

  constructor(bpm: number = DEFAULT_BPM, key: Key = DEFAULT_KEY) {
    this.samplePlayer = new SamplePlayer();
    this.updateConfiguration(bpm, key);
    this.bpm = this.validateBpm(bpm);
    this.key = this.validateKey(key);
    this.samplePlayer.setBpm(bpm);
  }

  updateConfiguration(bpm?: number, key?: Key) {
    if (bpm) {
      this.bpm = this.validateBpm(bpm);
      this.samplePlayer.setBpm(this.bpm);
    }
    if (key) {
      this.key = this.validateKey(key);
    }
  }

  setUpdateLoadProgress(updateLoadProgress: (value: number) => void) {
    this.samplePlayer.setUpdateLoadProgress(updateLoadProgress);
  }

  /**
   * Load a sound into the sound system using the given buffer. Currently only
   * used to upload custom sounds (hidden/demo-only feature).
   *
   * @param id
   * @param buffer
   */
  loadSoundFromBuffer(id: number, buffer: ArrayBuffer) {
    // TODO: re-enable
    // soundApi.LoadSoundFromBuffer(id, buffer);
  }

  getBPM(): number {
    return this.bpm;
  }

  /**
   * Pre-load sounds for playback
   */
  // TODO: Metrics?
  preloadSounds(events: PlaybackEvent[]) {
    const sampleIds = events
      .map(event => this.convertEventToSamples(event))
      .flat()
      .map(sampleEvent => sampleEvent.sampleId);

    this.samplePlayer.loadSounds(sampleIds);
  }

  /**
   * Preview the given sound. Plays immediately.
   *
   * @param id unique ID of the sound
   * @param onStop called when the sound finished playing
   */
  previewSound(id: string, onStop?: () => void) {
    this.samplePlayer.previewSample(id, onStop);
  }

  previewChord(chordValue: ChordEventValue, onStop?: () => void) {
    const chordEvent: ChordEvent = {
      type: 'chord',
      when: 1,
      value: chordValue,
      triggered: false,
      length: constants.DEFAULT_CHORD_LENGTH,
      id: 'preview',
      blockId: 'preview',
    };
    this.samplePlayer.previewSamples(
      this.convertEventToSamples(chordEvent),
      onStop
    );
  }

  previewNote(note: number, instrument: string, onStop?: () => void) {
    const sampleId = this.getSampleForNote(note, instrument);
    if (sampleId === null) {
      return;
    }

    this.previewSound(sampleId, onStop);
  }

  previewPattern(patternValue: PatternEventValue, onStop?: () => void) {
    const patternEvent: PatternEvent = {
      type: 'pattern',
      when: 1,
      value: patternValue,
      triggered: false,
      length: constants.DEFAULT_PATTERN_LENGTH,
      id: 'preview',
      blockId: 'preview',
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
   *
   * @param startPosition to start playback from. Defaults to 1
   * (beginning of song) if not specified.
   */
  playSong(events: PlaybackEvent[], startPosition = 1) {
    this.samplePlayer.startPlayback(
      events.map(event => this.convertEventToSamples(event)).flat(),
      this.convertPlayheadPositionToSeconds(startPosition)
    );
  }

  /**
   * Play the given events. Assumes that playback is in progress.
   */
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
   * Stop any sounds that have not yet been played if playback is in progress.
   */
  stopAllSoundsStillToPlay() {
    this.samplePlayer.stopAllSamplesStillToPlay();
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

  private convertEventToSamples(event: PlaybackEvent): SampleEvent[] {
    const library = MusicLibrary.getInstance();
    if (!library) {
      Lab2MetricsReporter.logWarning('Library not set. Cannot play sounds.');
      return [];
    }

    if (event.skipContext?.skipSound) {
      return [];
    }

    if (event.type === 'sound') {
      const soundEvent = event as SoundEvent;
      const soundData = library.getSoundForId(soundEvent.id);
      if (!soundData) {
        Lab2MetricsReporter.logWarning('No sound for ID: ' + soundEvent.id);
        return [];
      }

      if (soundData.sequence) {
        return this.getSamplesForSequence(
          soundData.sequence,
          event.when,
          event.triggered,
          event.effects
        );
      }

      return [
        {
          sampleId: soundEvent.id,
          offsetSeconds: this.convertPlayheadPositionToSeconds(soundEvent.when),
          triggered: soundEvent.triggered,
          effects: soundEvent.effects,
        },
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
          effects: patternEvent.effects,
        };

        results.push(resultEvent);
      }

      return results;
    } else if (event.type === 'chord') {
      const results: SampleEvent[] =
        this.convertChordEventToSampleEvents(event);
      return results;
    }

    return [];
  }

  private convertChordEventToSampleEvents(event: PlaybackEvent): SampleEvent[] {
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
      if (sampleId !== null) {
        const noteWhen = chordEvent.when + (note.tick - 1) / 16;

        results.push({
          sampleId,
          offsetSeconds: this.convertPlayheadPositionToSeconds(noteWhen),
          ...event,
        });
      }
    });

    return results;
  }

  private getSampleForNote(note: number, instrument: string): string | null {
    const library = MusicLibrary.getInstance();
    if (!library) {
      return null;
    }

    const folder: SoundFolder | null = library.getFolderForPath(instrument);

    if (folder === null) {
      Lab2MetricsReporter.logWarning(`No instrument ${instrument}`);
      return null;
    }

    const sound = folder.sounds.find(sound => sound.note === note) || null;
    if (sound === null) {
      Lab2MetricsReporter.logWarning(
        `No sound for note value ${note} on instrument ${instrument}`
      );
      return null;
    }

    return `${instrument}/${sound.src}`;
  }

  private getSamplesForSequence(
    sequence: SampleSequence,
    eventStart: number,
    triggered: boolean,
    effects?: Effects
  ): SampleEvent[] {
    const {instrument, events} = sequence;
    const samples: SampleEvent[] = [];

    events.forEach(event => {
      const tranposedNote = getTranposedNote(this.key, event.noteOffset);
      const sampleId = this.getSampleForNote(tranposedNote, instrument);
      if (sampleId !== null) {
        const eventWhen = eventStart + (event.position - 1) / 16;
        const lengthSeconds = (event.length / 16) * this.secondsPerMeasure();
        samples.push({
          sampleId,
          offsetSeconds: this.convertPlayheadPositionToSeconds(eventWhen),
          lengthSeconds,
          triggered,
          effects,
        });
      }
    });

    return samples;
  }

  private validateBpm(bpm: number): number {
    if (bpm < 1 || bpm > 500) {
      console.warn('Invalid BPM. Defaulting to 120');
      return DEFAULT_BPM;
    }

    return bpm;
  }

  private validateKey(key: number): Key {
    if (Key[key] === undefined) {
      console.warn('Invalid key. Defaulting to C');
      return Key.C;
    }

    return key;
  }
}
