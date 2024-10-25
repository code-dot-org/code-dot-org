import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import AnalyticsReporter from '@cdo/apps/music/analytics/AnalyticsReporter';

import appConfig from '../appConfig';
import {DEFAULT_CHORD_LENGTH, MIN_BPM, MAX_BPM} from '../constants';
import {LoadFinishedCallback, UpdateLoadProgressCallback} from '../types';
import {generateNotesFromChord, ChordNote} from '../utils/Chords';
import {getPitchName, getTranposedNote, Key} from '../utils/Notes';

import {
  ChordEvent,
  ChordEventValue,
  isChordEvent,
} from './interfaces/ChordEvent';
import {Effects} from './interfaces/Effects';
import {
  InstrumentEvent,
  InstrumentEventValue,
  isInstrumentEvent,
} from './interfaces/InstrumentEvent';
import {PlaybackEvent} from './interfaces/PlaybackEvent';
import {isSoundEvent, SoundEvent} from './interfaces/SoundEvent';
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
          .filter(event => isChordEvent(event) || isInstrumentEvent(event))
          .map(event => event.value.instrument)
      );
      for (const instrumentName of instrumentNames) {
        const sampleMap = this.generateSampleMap(instrumentName);
        if (sampleMap) {
          instruments.push({instrumentName, sampleMap});
        }
      }
      // Filter out instrument/kit events
      events = events.filter(event => isSoundEvent(event));
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
      parentControlTypes: [],
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
      parentControlTypes: [],
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
    const singleNoteEvent: InstrumentEventValue = {
      instrument,
      events: [{note, tick: 1}],
      length: 1,
    };

    this.previewNotes(singleNoteEvent);
  }

  previewNotes(
    value: InstrumentEventValue,
    onTick?: (tick: number) => void,
    onStop?: () => void
  ) {
    const event: InstrumentEvent = {
      type: 'instrument',
      instrumentType: 'drums', // Doesn't matter for preview
      when: 1,
      value,
      triggered: false,
      length: value.length,
      id: 'preview',
      blockId: 'preview',
      parentControlTypes: [],
    };

    if (this.audioPlayer.supportsSamplers()) {
      const sequence = this.instrumentEventToSequence(event);
      if (sequence) {
        this.audioPlayer.playSequenceImmediately(
          sequence,
          event.length,
          onTick,
          onStop
        );
      }
    } else {
      this.audioPlayer.playSamplesImmediately(
        this.convertEventToSamples(event),
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
      if (isSoundEvent(event) || !this.audioPlayer.supportsSamplers()) {
        const reportCallback = (soundId: string) => {
          this.analyticsReporter?.onSoundPlayed(soundId);
        };
        for (const sample of this.convertEventToSamples(event)) {
          this.audioPlayer.scheduleSample(sample, reportCallback);
        }
      } else if (isChordEvent(event) || isInstrumentEvent(event)) {
        // Use samplers for chords and instrument events if supported
        const sequence = isChordEvent(event)
          ? this.convertChordEventToSequence(event)
          : this.instrumentEventToSequence(event);
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

    if (isSoundEvent(event)) {
      const soundData = library.getSoundForId(event.id);
      if (!soundData) {
        this.metricsReporter.logWarning('No sound for ID: ' + event.id);
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

      const folder = library.getFolderForSoundId(event.id);

      if (folder === null) {
        this.metricsReporter.logWarning(`No folder for ${event.id}`);
        return [];
      }

      return [
        {
          id: event.id,
          sampleUrl: library.generateSoundUrl(folder, soundData),
          playbackPosition: event.when,
          triggered: event.triggered,
          effects: event.effects,
          originalBpm: soundData.bpm || DEFAULT_BPM,
          pitchShift: this.calculatePitchShift(soundData),
          disableTempoAdjustment: soundData.type === 'preview',
        },
      ];
    } else if (isChordEvent(event)) {
      const results: SampleEvent[] =
        this.convertChordEventToSampleEvents(event);
      return results;
    } else if (isInstrumentEvent(event)) {
      return this.convertInstrumentEventToSampleEvents(event);
    }

    return [];
  }

  private convertChordEventToSampleEvents(event: ChordEvent): SampleEvent[] {
    const {instrument, notes} = event.value;
    if (notes.length === 0) {
      return [];
    }

    const results: SampleEvent[] = [];

    const generatedNotes: ChordNote[] = generateNotesFromChord(event.value);

    generatedNotes.forEach(note => {
      const sampleUrl = this.getSampleForNote(note.note, instrument);
      if (sampleUrl !== null) {
        const noteWhen = event.when + (note.tick - 1) / 16;

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

  private convertInstrumentEventToSampleEvents(
    event: InstrumentEvent
  ): SampleEvent[] {
    const {instrument, events} = event.value;
    if (events.length === 0) {
      return [];
    }

    const results: SampleEvent[] = [];

    events.forEach(({note, tick}) => {
      const sampleUrl = this.getSampleForNote(note, instrument);
      if (sampleUrl !== null) {
        const noteWhen = event.when + (tick - 1) / 16;

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

  private instrumentEventToSequence(
    instrumentEvent: InstrumentEvent
  ): SamplerSequence | null {
    const {value, effects, when} = instrumentEvent;
    const {instrument, events} = value;
    return {
      instrument,
      effects,
      events: events.map(event => {
        return {
          notes: [getPitchName(event.note)],
          playbackPosition: when + (event.tick - 1) / 16,
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
