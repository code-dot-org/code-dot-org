import {ChordEvent, ChordEventValue} from './interfaces/ChordEvent';
import {PatternEvent, PatternEventValue} from './interfaces/PatternEvent';
import {PlaybackEvent} from './interfaces/PlaybackEvent';
import {SoundEvent} from './interfaces/SoundEvent';
import MusicLibrary, {
  SampleSequence,
  SoundData,
  SoundFolder,
} from './MusicLibrary';
import SamplePlayer from './SamplePlayer';
import {generateNotesFromChord, ChordNote} from '../utils/Chords';
import {getPitchName, getTranposedNote, Key} from '../utils/Notes';
import {Effects} from './interfaces/Effects';
import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LoadFinishedCallback, UpdateLoadProgressCallback} from '../types';
import {AudioPlayer, SampleEvent, SamplerSequence} from './types';
import SamplePlayerWrapper from './SamplePlayerWrapper';

// Using require() to import JS in TS files
const constants = require('../constants');

const DEFAULT_BPM = 120;
const DEFAULT_KEY = Key.C;

/**
 * Main music player component which maintains the list of playback events and
 * uses a {@link SamplePlayer} to play sounds.
 */
export default class MusicPlayer {
  private readonly metricsReporter: LabMetricsReporter;
  private readonly audioPlayer: AudioPlayer;
  private updateLoadProgress: UpdateLoadProgressCallback | undefined;

  private bpm: number = DEFAULT_BPM;
  private key: Key = DEFAULT_KEY;

  constructor(
    bpm: number = DEFAULT_BPM,
    key: Key = DEFAULT_KEY,
    audioPlayer: AudioPlayer = new SamplePlayerWrapper(new SamplePlayer()),
    metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    this.audioPlayer = audioPlayer;
    this.metricsReporter = metricsReporter;
    this.updateConfiguration(bpm, key);
  }

  updateConfiguration(bpm?: number, key?: Key) {
    if (bpm) {
      this.bpm = this.validateBpm(bpm);
      this.audioPlayer.setBpm(this.bpm);
    }
    if (key) {
      this.key = this.validateKey(key);
    }
  }

  setUpdateLoadProgress(updateLoadProgress: UpdateLoadProgressCallback) {
    this.updateLoadProgress = updateLoadProgress;
  }

  /**
   * Load a sound into the sound system using the given buffer. Currently only
   * used to upload custom sounds (hidden/demo-only feature).
   *
   * TODO: re-enable
   *
   * @param id
   * @param buffer
   */
  loadSoundFromBuffer(id: number, buffer: ArrayBuffer) {
    // soundApi.LoadSoundFromBuffer(id, buffer);
  }

  getBPM(): number {
    return this.bpm;
  }

  /**
   * Pre-load sounds for playback
   */
  async preloadSounds(
    events: PlaybackEvent[],
    onLoadFinished?: LoadFinishedCallback
  ) {
    // If using samplers, chord and pattern sounds have already been loaded.
    if (this.audioPlayer.supportsSamplers()) {
      events = events.filter(event => event.type === 'sound');
    }
    const sampleIds = Array.from(
      new Set(
        events
          .map(event => this.convertEventToSamples(event))
          .flat()
          .map(sampleEvent => sampleEvent.sampleId)
      )
    );

    return this.audioPlayer.loadSounds(sampleIds, {
      onLoadFinished,
      updateLoadProgress: this.updateLoadProgress,
    });
  }

  /**
   * Preview the given sound. Plays immediately.
   *
   * @param id unique ID of the sound
   * @param onStop called when the sound finished playing
   */
  previewSound(id: string, onStop?: () => void) {
    // Wrap this in a SoundEvent so it's converted with the correct bpm and pitch shift.
    const preview: SoundEvent = {
      type: 'sound',
      when: 1,
      id,
      triggered: false,
      length: 1,
      blockId: 'preview',
      soundType: 'beat',
    };

    this.audioPlayer.playSampleImmediately(
      this.convertEventToSamples(preview)[0],
      onStop
    );
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

    if (this.audioPlayer.supportsSamplers()) {
      const sequence = this.convertChordEventToSequence(chordEvent);
      if (sequence) {
        this.audioPlayer.playSequenceImmediately(sequence);
      }
    } else {
      this.audioPlayer.playSamplesImmediately(
        this.convertEventToSamples(chordEvent),
        onStop
      );
    }
  }

  previewNote(note: number, instrument: string) {
    const singleNoteEvent: ChordEventValue = {
      instrument,
      notes: [note],
      playStyle: 'together',
    };

    this.previewChord(singleNoteEvent);
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

    if (this.audioPlayer.supportsSamplers()) {
      const sequence = this.patternEventToSequence(patternEvent);
      if (sequence) {
        this.audioPlayer.playSequenceImmediately(sequence);
      }
    } else {
      this.audioPlayer.playSamplesImmediately(
        this.convertEventToSamples(patternEvent),
        onStop
      );
    }
  }

  /**
   * Cancels any ongoing previews.
   */
  cancelPreviews() {
    this.audioPlayer.cancelPreviews();
  }

  /**
   * Start playback. Schedules all queued playback events for playback
   * and tells the {@link AudioPlayer} to start playing.
   *
   * @param startPosition to start playback from. Defaults to 1
   * (beginning of song) if not specified.
   */
  playSong(events: PlaybackEvent[], startPosition = 1) {
    this.scheduleEvents(events);
    this.audioPlayer.start(startPosition);
  }

  /**
   * Play the given events. Assumes that playback is in progress.
   *
   * @param events events to play
   * @param [replace=false] if true, cancels any pending events before playing the new ones
   */
  playEvents(events: PlaybackEvent[], replace = false) {
    if (replace) {
      this.audioPlayer.cancelPendingEvents();
    }
    this.scheduleEvents(events);
  }

  private scheduleEvents(events: PlaybackEvent[]) {
    for (const event of events) {
      if (event.type === 'sound' || !this.audioPlayer.supportsSamplers()) {
        for (const sample of this.convertEventToSamples(event)) {
          this.audioPlayer.scheduleSample(sample);
        }
      } else {
        // Use samplers for chords and patterns if supported
        const sequence =
          event.type === 'chord'
            ? this.convertChordEventToSequence(event as ChordEvent)
            : this.patternEventToSequence(event as PatternEvent);
        if (sequence) {
          this.audioPlayer.scheduleSamplerSequence(sequence);
        }
      }
    }
  }

  /**
   * Stop playback. Tells the {@link SamplePlayer} to stop all sample playback.
   */
  stopSong() {
    this.audioPlayer.stop();
  }

  // Returns the current playhead position, in floating point for an exact position,
  // 1-based, and scaled to measures.
  // Returns 0 if music is not playing.
  getCurrentPlayheadPosition(): number {
    return this.audioPlayer.getCurrentPlaybackPosition();
  }

  private convertEventToSamples(event: PlaybackEvent): SampleEvent[] {
    const library = MusicLibrary.getInstance();
    if (!library) {
      this.metricsReporter.logWarning('Library not set. Cannot play sounds.');
      return [];
    }

    if (event.skipContext?.skipSound) {
      return [];
    }

    if (event.type === 'sound') {
      const soundEvent = event as SoundEvent;
      const soundData = library.getSoundForId(soundEvent.id);
      if (!soundData) {
        this.metricsReporter.logWarning('No sound for ID: ' + soundEvent.id);
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
          playbackPosition: event.when,
          triggered: soundEvent.triggered,
          effects: soundEvent.effects,
          originalBpm: soundData.bpm || DEFAULT_BPM,
          pitchShift: this.calculatePitchShift(soundData),
        },
      ];
    } else if (event.type === 'pattern') {
      const patternEvent = event as PatternEvent;

      const results: SampleEvent[] = [];

      const kit = patternEvent.value.kit;

      for (const event of patternEvent.value.events) {
        const resultEvent = {
          sampleId: `${kit}/${event.src}`,
          playbackPosition: patternEvent.when + (event.tick - 1) / 16,
          triggered: patternEvent.triggered,
          effects: patternEvent.effects,
          originalBpm: this.bpm,
          pitchShift: 0,
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
          playbackPosition: noteWhen,
          originalBpm: this.bpm,
          pitchShift: 0,
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
      this.metricsReporter.logWarning(`No instrument ${instrument}`);
      return null;
    }

    const sound = folder.sounds.find(sound => sound.note === note) || null;
    if (sound === null) {
      this.metricsReporter.logWarning(
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
        samples.push({
          sampleId,
          playbackPosition: eventWhen,
          length: event.length,
          triggered,
          effects,
          originalBpm: this.bpm,
          pitchShift: 0,
        });
      }
    });

    return samples;
  }

  private convertChordEventToSequence(
    event: ChordEvent
  ): SamplerSequence | null {
    const {instrument, notes} = event.value;
    if (notes.length === 0) {
      return null;
    }

    const generatedNotes: ChordNote[] = generateNotesFromChord(event.value);

    return {
      instrument,
      events: generatedNotes.map(({note, tick}) => ({
        notes: [getPitchName(note)],
        playbackPosition: event.when + (tick - 1) / 16,
      })),
    };
  }

  private patternEventToSequence(
    patternEvent: PatternEvent
  ): SamplerSequence | null {
    const library = MusicLibrary.getInstance();
    if (!library) {
      this.metricsReporter.logWarning('Library not set. Cannot play sounds.');
      return null;
    }

    const kit = patternEvent.value.kit;
    const folder = library.getFolderForPath(kit);
    if (folder === null) {
      this.metricsReporter.logWarning(`No instrument ${kit}`);
      return null;
    }

    return {
      instrument: kit,
      events: patternEvent.value.events.map(event => {
        return {
          notes: [getPitchName(event.note)],
          playbackPosition: patternEvent.when + (event.tick - 1) / 16,
        };
      }),
    };
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

  private calculatePitchShift(soundData: SoundData) {
    return soundData.type === 'beat' ? 0 : this.key - (soundData.key || Key.C);
  }

  async setupSampler(
    instrument: string,
    onLoadFinished?: LoadFinishedCallback
  ) {
    if (
      !this.audioPlayer.supportsSamplers() ||
      this.audioPlayer.isInstrumentLoaded(instrument)
    ) {
      return;
    }

    const library = MusicLibrary.getInstance();
    if (library === undefined) {
      this.metricsReporter.logWarning('Library not set. Cannot load sampler.');
      return;
    }

    const folder = library.getFolderForPath(instrument);
    if (folder === null) {
      return;
    }

    const sampleMap = folder.sounds.reduce((map, sound, index) => {
      map[sound.note || index] = `${folder.path}/${sound.src}`;
      return map;
    }, {} as {[note: number]: string});

    return this.audioPlayer.loadInstrument(folder.path, sampleMap, {
      updateLoadProgress: this.updateLoadProgress,
      onLoadFinished,
    });
  }
}
