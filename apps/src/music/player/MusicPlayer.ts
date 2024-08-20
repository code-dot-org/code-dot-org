import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import AnalyticsReporter from '@cdo/apps/music/analytics/AnalyticsReporter';

import appConfig from '../appConfig';
import {
  DEFAULT_PATTERN_LENGTH,
  //DEFAULT_PATTERN_AI_LENGTH,
  DEFAULT_CHORD_LENGTH,
  DEFAULT_TUNE_LENGTH,
  MIN_BPM,
  MAX_BPM,
} from '../constants';
import {LoadFinishedCallback, UpdateLoadProgressCallback} from '../types';
import {generateNotesFromChord, ChordNote} from '../utils/Chords';
//import {generateNotesFromTune, TuneNote} from '../utils/Tunes';
import {getPitchName, getTranposedNote, Key} from '../utils/Notes';

import {ChordEvent, ChordEventValue} from './interfaces/ChordEvent';
import {Effects} from './interfaces/Effects';
import {PatternEvent, PatternEventValue} from './interfaces/PatternEvent';
import {PlaybackEvent} from './interfaces/PlaybackEvent';
import {SoundEvent} from './interfaces/SoundEvent';
import {TuneEvent, TuneEventValue} from './interfaces/TuneEvent';
import MusicLibrary, {
  SampleSequence,
  SoundData,
  SoundFolder,
} from './MusicLibrary';
import SamplePlayer from './SamplePlayer';
import SamplePlayerWrapper from './SamplePlayerWrapper';
import ToneJSPlayer from './ToneJSPlayer';
import {
  AudioPlayer,
  InstrumentData,
  PlayerEvent,
  SampleEvent,
  SamplerSequence,
} from './types';

const DEFAULT_BPM = 120;
const DEFAULT_KEY = Key.C;

/**
 * Main music player component which maintains the list of playback events and
 * uses a {@link SamplePlayer} to play sounds.
 */
export default class MusicPlayer {
  private readonly metricsReporter: LabMetricsReporter;
  private readonly analyticsReporter: AnalyticsReporter | undefined;
  private readonly audioPlayer: AudioPlayer;
  private updateLoadProgress: UpdateLoadProgressCallback | undefined;

  private bpm: number = DEFAULT_BPM;
  private key: Key = DEFAULT_KEY;

  constructor(
    bpm: number = DEFAULT_BPM,
    key: Key = DEFAULT_KEY,
    analyticsReporter?: AnalyticsReporter | undefined,
    audioPlayer?: AudioPlayer,
    metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter()
  ) {
    if (appConfig.getValue('player') === 'sample') {
      console.log('[MusicPlayer] Using SamplePlayer');
      this.audioPlayer =
        new SamplePlayerWrapper(new SamplePlayer()) || audioPlayer;
    } else {
      console.log('[MusicPlayer] Using ToneJSPlayer');
      this.audioPlayer = new ToneJSPlayer() || audioPlayer;
    }
    this.metricsReporter = metricsReporter;
    this.analyticsReporter = analyticsReporter;
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

  setBpm(bpm: number) {
    this.audioPlayer.setBpm(bpm);
  }

  setKey(key: Key) {
    this.key = this.validateKey(key);
  }

  setLoopEnabled(enabled: boolean) {
    this.audioPlayer.setLoopEnabled(enabled);
  }

  setLoopStart(loopStart: number) {
    this.audioPlayer.setLoopStart(loopStart);
  }

  setLoopEnd(loopEnd: number) {
    this.audioPlayer.setLoopEnd(loopEnd);
  }

  jumpToPosition(position: number) {
    this.audioPlayer.jumpToPosition(position);
  }

  /**
   * Pre-load sounds for playback
   */
  async preloadSounds(
    events: PlaybackEvent[],
    onLoadFinished?: LoadFinishedCallback
  ) {
    // If using samplers, collect all instrument samples.
    const instruments: InstrumentData[] = [];
    if (this.audioPlayer.supportsSamplers()) {
      const instrumentNames = new Set(
        events
          .filter(event => event.type !== 'sound')
          .map(event =>
            event.type === 'chord'
              ? (event as ChordEvent).value.instrument
              : (event as PatternEvent).value.kit
          )
      );
      for (const instrumentName of instrumentNames) {
        const sampleMap = this.generateSampleMap(instrumentName);
        if (sampleMap) {
          instruments.push({instrumentName, sampleMap});
        }
      }
      // Filter out instrument/kit events
      events = events.filter(event => event.type === 'sound');
    }

    const sampleUrls = Array.from(
      new Set(
        events
          .map(event => this.convertEventToSamples(event))
          .flat()
          .map(sampleEvent => sampleEvent.sampleUrl)
      )
    );

    return this.audioPlayer.loadSounds(sampleUrls, instruments, {
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
    this.analyticsReporter?.onSoundPlayed(id);
    this.audioPlayer.playSampleImmediately(
      this.convertEventToSamples(preview)[0],
      onStop
    );
  }

  previewChord(
    chordValue: ChordEventValue,
    onTick?: (tick: number) => void,
    onStop?: () => void
  ) {
    const chordEvent: ChordEvent = {
      type: 'chord',
      when: 1,
      value: chordValue,
      triggered: false,
      length: DEFAULT_CHORD_LENGTH,
      id: 'preview',
      blockId: 'preview',
    };

    if (this.audioPlayer.supportsSamplers()) {
      const sequence = this.convertChordEventToSequence(chordEvent);
      if (sequence) {
        this.audioPlayer.playSequenceImmediately(
          sequence,
          chordEvent.length,
          onTick,
          onStop
        );
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

  previewTune(
    tuneValue: TuneEventValue,
    onTick?: (tick: number) => void,
    onStop?: () => void
  ) {
    const tuneEvent: TuneEvent = {
      type: 'tune',
      when: 1,
      value: tuneValue,
      triggered: false,
      length: DEFAULT_TUNE_LENGTH,
      id: 'preview',
      blockId: 'preview',
    };

    if (this.audioPlayer.supportsSamplers()) {
      const sequence = this.tuneEventToSequence(tuneEvent);
      if (sequence) {
        this.audioPlayer.playSequenceImmediately(
          sequence,
          tuneEvent.length,
          onTick,
          onStop
        );
      }
    } else {
      this.audioPlayer.playSamplesImmediately(
        this.convertEventToSamples(tuneEvent),
        onStop
      );
    }
  }

  previewPattern(
    patternValue: PatternEventValue,
    onTick?: (tick: number) => void,
    onStop?: () => void
  ) {
    const patternEvent: PatternEvent = {
      type: 'pattern',
      when: 1,
      value: patternValue,
      triggered: false,
      length: patternValue.length || DEFAULT_PATTERN_LENGTH,
      id: 'preview',
      blockId: 'preview',
    };

    if (this.audioPlayer.supportsSamplers()) {
      const sequence = this.patternEventToSequence(patternEvent);
      if (sequence) {
        this.audioPlayer.playSequenceImmediately(
          sequence,
          patternEvent.length,
          onTick,
          onStop
        );
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
        const reportCallback = (soundId: string) => {
          this.analyticsReporter?.onSoundPlayed(soundId);
        };
        for (const sample of this.convertEventToSamples(event)) {
          this.audioPlayer.scheduleSample(sample, reportCallback);
        }
      } else {
        // Use samplers for chords and patterns if supported
        const sequence =
          event.type === 'chord'
            ? this.convertChordEventToSequence(event as ChordEvent)
            : event.type === 'tune'
            ? this.tuneEventToSequence(event as TuneEvent)
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

      const folder = library.getFolderForSoundId(soundEvent.id);

      if (folder === null) {
        this.metricsReporter.logWarning(`No folder for ${soundEvent.id}`);
        return [];
      }

      return [
        {
          id: soundEvent.id,
          sampleUrl: library.generateSoundUrl(folder, soundData),
          playbackPosition: event.when,
          triggered: soundEvent.triggered,
          effects: soundEvent.effects,
          originalBpm: soundData.bpm || DEFAULT_BPM,
          pitchShift: this.calculatePitchShift(soundData),
          disableTempoAdjustment: soundData.type === 'preview',
        },
      ];
    } else if (event.type === 'pattern') {
      const patternEvent = event as PatternEvent;

      const results: SampleEvent[] = [];

      const kit = patternEvent.value.kit;

      const folder: SoundFolder | null = library.getFolderForFolderId(kit);

      const length = patternEvent.value.length || DEFAULT_PATTERN_LENGTH;
      const eventsLength = length * 16;

      if (folder === null) {
        this.metricsReporter.logWarning(`No kit ${kit}`);
        return [];
      }

      for (const event of patternEvent.value.events) {
        const soundData = library.getSoundForId(`${folder.id}/${event.src}`);
        if (soundData === null) {
          return [];
        }

        const resultEvent = {
          id: `${folder.id}/${event.src}`,
          sampleUrl: library.generateSoundUrl(folder, soundData),
          playbackPosition: patternEvent.when + (event.tick - 1) / eventsLength,
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
    } else if (event.type === 'tune') {
      const results: SampleEvent[] = this.convertTuneEventToSampleEvents(event);
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
      const sampleUrl = this.getSampleForNote(note.note, instrument);
      if (sampleUrl !== null) {
        const noteWhen = chordEvent.when + (note.tick - 1) / 16;

        results.push({
          sampleUrl,
          playbackPosition: noteWhen,
          originalBpm: this.bpm,
          pitchShift: 0,
          ...event,
        });
      }
    });

    return results;
  }

  private convertTuneEventToSampleEvents(event: PlaybackEvent): SampleEvent[] {
    const tuneEvent = event as TuneEvent;

    const {instrument, events} = tuneEvent.value;
    if (events.length === 0) {
      return [];
    }

    const results: SampleEvent[] = [];

    events.forEach(tuneEvent => {
      const sampleUrl = this.getSampleForNote(tuneEvent.note, instrument);
      if (sampleUrl !== null) {
        const noteWhen = event.when + (tuneEvent.tick - 1) / 16;

        results.push({
          sampleUrl,
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

    const folder: SoundFolder | null = library.getFolderForFolderId(instrument);

    if (folder === null) {
      this.metricsReporter.logWarning(`No instrument ${instrument}`);
      return null;
    }

    const soundData = folder.sounds.find(sound => sound.note === note) || null;
    if (soundData === null) {
      this.metricsReporter.logWarning(
        `No sound for note value ${note} on instrument ${instrument}`
      );
      return null;
    }

    const url = library.generateSoundUrl(folder, soundData);
    return url;
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
      const sampleUrl = this.getSampleForNote(tranposedNote, instrument);
      if (sampleUrl !== null) {
        const eventWhen = eventStart + (event.position - 1) / 16;
        samples.push({
          id: sampleUrl,
          sampleUrl,
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
      effects: event.effects,
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
    const folder = library.getFolderForFolderId(kit);
    if (folder === null) {
      this.metricsReporter.logWarning(`No instrument ${kit}`);
      return null;
    }

    return {
      instrument: kit,
      effects: patternEvent.effects,
      events: patternEvent.value.events.map(event => {
        return {
          notes: [getPitchName(event.note)],
          playbackPosition: patternEvent.when + (event.tick - 1) / 16,
        };
      }),
    };
  }

  private tuneEventToSequence(tuneEvent: TuneEvent): SamplerSequence | null {
    const library = MusicLibrary.getInstance();
    if (!library) {
      this.metricsReporter.logWarning('Library not set. Cannot play sounds.');
      return null;
    }

    const kit = tuneEvent.value.instrument;
    const folder = library.getFolderForFolderId(kit);
    if (folder === null) {
      this.metricsReporter.logWarning(`No instrument ${kit}`);
      return null;
    }

    return {
      instrument: kit,
      effects: tuneEvent.effects,
      events: tuneEvent.value.events.map(event => {
        return {
          notes: [getPitchName(event.note)],
          playbackPosition: tuneEvent.when + (event.tick - 1) / 16,
        };
      }),
    };
  }

  private validateBpm(bpm: number): number {
    if (bpm < MIN_BPM || bpm > MAX_BPM) {
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
    if (['beat', 'preview'].includes(soundData.type)) {
      return 0;
    }
    const diff = this.key - (soundData.key || Key.C);
    if (diff > 6) {
      return diff - 12;
    }
    if (diff < -6) {
      return diff + 12;
    }
    return diff;
  }

  isInstrumentLoading(instrument: string): boolean {
    return this.audioPlayer.isInstrumentLoading(instrument);
  }

  isInstrumentLoaded(instrument: string): boolean {
    return this.audioPlayer.isInstrumentLoaded(instrument);
  }

  registerCallback(event: PlayerEvent, callback: (payload?: string) => void) {
    this.audioPlayer.registerCallback(event, callback);
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

    const sampleMap = this.generateSampleMap(instrument);
    if (!sampleMap) {
      return;
    }

    return this.audioPlayer.loadInstrument(instrument, sampleMap, {
      updateLoadProgress: this.updateLoadProgress,
      onLoadFinished,
    });
  }

  private generateSampleMap(instrument: string) {
    const library = MusicLibrary.getInstance();
    if (library === undefined) {
      this.metricsReporter.logWarning('Library not set. Cannot load sampler.');
      return;
    }

    const folder = library.getFolderForFolderId(instrument);
    if (folder === null) {
      return;
    }

    return folder.sounds.reduce((map, sound, index) => {
      const soundData = library.getSoundForId(`${folder.id}/${sound.src}`);
      if (soundData) {
        map[sound.note || index] = library.generateSoundUrl(folder, soundData);
      }
      return map;
    }, {} as {[note: number]: string});
  }
}
