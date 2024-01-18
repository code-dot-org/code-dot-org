import {ChordEvent, ChordEventValue} from './interfaces/ChordEvent';
import {PatternEvent, PatternEventValue} from './interfaces/PatternEvent';
import {PlaybackEvent} from './interfaces/PlaybackEvent';
import {SoundEvent} from './interfaces/SoundEvent';
import MusicLibrary, {SampleSequence, SoundFolder} from './MusicLibrary';
import SamplePlayer, {SampleEvent} from './SamplePlayer';
import {generateNotesFromChord, ChordNote} from '../utils/Chords';
import {getFullNoteName, getTranposedNote, Key} from '../utils/Notes';
import {Effects} from './interfaces/Effects';
import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LoadFinishedCallback} from '../types';
import ToneJSPlayer, {SamplerSequence, Sound} from './ToneJSPlayer';

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
  private readonly metricsReporter: LabMetricsReporter;
  private readonly samplePlayer: SamplePlayer;

  private bpm: number = DEFAULT_BPM;
  private key: Key = DEFAULT_KEY;
  private updateLoadProgress: ((value: number) => void) | undefined;

  constructor(
    bpm: number = DEFAULT_BPM,
    key: Key = DEFAULT_KEY,
    samplePlayer: SamplePlayer = new SamplePlayer(),
    metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter(),
    private readonly tonePlayer: ToneJSPlayer = new ToneJSPlayer()
  ) {
    this.samplePlayer = samplePlayer;
    this.metricsReporter = metricsReporter;
    this.updateConfiguration(bpm, key);
  }

  updateConfiguration(bpm?: number, key?: Key) {
    if (bpm) {
      this.bpm = this.validateBpm(bpm);
      this.samplePlayer.setBpm(this.bpm);
      this.tonePlayer.setBpm(this.bpm);
    }
    if (key) {
      this.key = this.validateKey(key);
    }
  }

  setUpdateLoadProgress(updateLoadProgress: (value: number) => void) {
    this.updateLoadProgress = updateLoadProgress;
    // this.samplePlayer.setUpdateLoadProgress(updateLoadProgress);
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
    const sampleIds = Array.from(
      new Set(
        events
          .filter(event => event.type === 'sound')
          .map(event => (this.convertEventToSound(event) as Sound).sampleId)
      )
    );

    // this.samplePlayer.loadSounds(sampleIds, onLoadFinished);
    return this.tonePlayer.loadSounds(sampleIds, {
      updateLoadProgress: this.updateLoadProgress,
      onLoadFinished,
    });
  }

  /**
   * Preview the given sound. Plays immediately.
   *
   * @param id unique ID of the sound
   * @param onStop called when the sound finished playing
   */
  previewSound(id: string, onStop?: () => void) {
    const sound = this.convertEventToSound({
      type: 'sound',
      when: 1,
      id,
      triggered: false,
      length: 1,
      blockId: 'preview',
    });
    this.tonePlayer.playSoundImmediately(sound as Sound, onStop);
    // this.samplePlayer.previewSample(id, onStop);
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
    const sequence = this.convertEventToSound(chordEvent);
    this.tonePlayer.playSequenceImmediately(sequence as SamplerSequence);
    // this.samplePlayer.previewSamples(
    //   this.convertEventToSamples(chordEvent),
    //   onStop
    // );
  }

  previewNote(note: number, instrument: string, onStop?: () => void) {
    const singleNoteEvent: ChordEventValue = {
      instrument,
      notes: [note],
      playStyle: 'together',
    };

    this.previewChord(singleNoteEvent, onStop);
  }

  // TODO: Remove onStop in favor of sourcing time from player
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
    const sequence = this.convertEventToSound(patternEvent);
    this.tonePlayer.playSequenceImmediately(sequence as SamplerSequence);

    // this.samplePlayer.previewSamples(
    //   this.convertEventToSamples(patternEvent),
    //   onStop
    // );
  }

  /**
   * Cancels any ongoing previews.
   */
  cancelPreviews() {
    this.tonePlayer.cancelPreviews();
    // this.samplePlayer.cancelPreviews();
  }

  /**
   * Start playback. Schedules all queued playback events for playback
   * and tells the {@link SamplePlayer} to start playing.
   *
   * @param startPosition to start playback from. Defaults to 1
   * (beginning of song) if not specified.
   */
  playSong(events: PlaybackEvent[], startPosition = 1) {
    // this.samplePlayer.startPlayback(
    //   events.map(event => this.convertEventToSamples(event)).flat(),
    //   this.convertPlayheadPositionToSeconds(startPosition)
    // );
    events.forEach(event => {
      const sound = this.convertEventToSound(event);
      if (sound && (sound as Sound).sampleId) {
        this.tonePlayer.scheduleSound(sound as Sound);
      } else if (sound && (sound as SamplerSequence).events) {
        this.tonePlayer.scheduleSamplerSequence(sound as SamplerSequence);
      }
    });

    this.tonePlayer.start(this.playbackTimeToTransportTime(startPosition));
  }

  /**
   * Play the given events. Assumes that playback is in progress.
   */
  playEvents(events: PlaybackEvent[], replace?: boolean) {
    if (replace) {
      this.tonePlayer.cancelAllEvents();
    }

    events.forEach(event => {
      const sound = this.convertEventToSound(event);
      if (sound && (sound as Sound).sampleId) {
        this.tonePlayer.scheduleSound(sound as Sound);
      } else if (sound && (sound as SamplerSequence).events) {
        this.tonePlayer.scheduleSamplerSequence(sound as SamplerSequence);
      }
    });
    // this.samplePlayer.playSamples(
    //   events.map(event => this.convertEventToSamples(event)).flat()
    // );
  }

  /**
   * Stop playback. Tells the {@link SamplePlayer} to stop all sample playback.
   */
  stopSong() {
    // this.samplePlayer.stopPlayback();
    this.tonePlayer.stop();
  }

  /**
   * Stop any sounds that have not yet been played if playback is in progress.
   */
  stopAllSoundsStillToPlay() {
    this.tonePlayer.cancelAllEvents();
    //this.samplePlayer.stopAllSamplesStillToPlay();
  }

  // Returns the current playhead position, in floating point for an exact position,
  // 1-based, and scaled to measures.
  // Returns 0 if music is not playing.
  getCurrentPlayheadPosition(): number {
    // console.log(
    //   `ToneJS: ${this.tonePlayer.getCurrentPosition()} | ${this.transportTimeToPlaybackTime(
    //     this.tonePlayer.getCurrentPosition()
    //   )}`
    // );
    return this.transportTimeToPlaybackTime(
      this.tonePlayer.getCurrentPosition()
    );
    // const elapsedTime = this.samplePlayer.getElapsedPlaybackTimeSeconds();
    // if (elapsedTime === -1) {
    //   return 0;
    // }
    //return this.convertSecondsToPlayheadPosition(elapsedTime);
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

  private convertEventToSound(
    event: PlaybackEvent
  ): Sound | SamplerSequence | null {
    const library = MusicLibrary.getInstance();
    if (!library) {
      this.metricsReporter.logWarning('Library not set. Cannot play sounds.');
      return null;
    }

    if (event.type === 'sound') {
      const soundEvent = event as SoundEvent;
      const soundData = library.getSoundForId(soundEvent.id);
      if (!soundData) {
        this.metricsReporter.logWarning('No sound for ID: ' + soundEvent.id);
        return null;
      }

      return {
        sampleId: soundEvent.id,
        transportTime: this.playbackTimeToTransportTime(soundEvent.when),
        originalBpm: soundData.bpm || 120,
        pitchShift:
          soundData.type === 'beat' ? 0 : this.key - (soundData.key || Key.C),
      };
    }

    if (event.type === 'chord') {
      const chordEvent = event as ChordEvent;

      const {instrument, notes} = chordEvent.value;
      if (notes.length === 0) {
        return null;
      }

      const generatedNotes: ChordNote[] = generateNotesFromChord(
        chordEvent.value
      );

      return {
        instrument,
        events: generatedNotes.map(({note, tick}) => ({
          notes: [getFullNoteName(note)],
          transportTime: this.playbackTimeToTransportTime(
            chordEvent.when + (tick - 1) / 16
          ),
        })),
      };
    }

    if (event.type === 'pattern') {
      const patternEvent = event as PatternEvent;

      const kit = patternEvent.value.kit;
      const folder = library.getFolderForPath(kit);
      if (folder === null) {
        this.metricsReporter.logWarning(`No instrument ${kit}`);
        return null;
      }

      // TODO: Store note index instead of src for easier lookup
      return {
        instrument: kit,
        events: patternEvent.value.events.map(event => {
          return {
            notes: [
              getFullNoteName(
                folder.sounds.findIndex(sound => sound.src === event.src)
              ),
            ],
            transportTime: this.playbackTimeToTransportTime(
              patternEvent.when + (event.tick - 1) / 16
            ),
          };
        }),
      };
    }

    return null;
  }

  private playbackTimeToTransportTime(playbackTime: number): string {
    const bar = Math.floor(playbackTime);
    const beat = Math.floor((playbackTime - bar) * 4);
    const sixteenths = Math.floor((playbackTime - bar - beat / 4) * 16);
    return `${bar - 1}:${beat}:${sixteenths}`;
  }

  private transportTimeToPlaybackTime(transportTime: string): number {
    const [bar, beat, sixteenths] = transportTime.split(':').map(Number);
    return bar + 1 + beat / 4 + sixteenths / 16;
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
          offsetSeconds: this.convertPlayheadPositionToSeconds(soundEvent.when),
          triggered: soundEvent.triggered,
          effects: soundEvent.effects,
          playbackRate: this.bpm / (soundData.bpm || 120),
          // Don't transpose beat samples
          pitchShift:
            soundData.type === 'beat' ? 0 : this.key - (soundData.key || Key.C),
        },
      ];
    } else if (event.type === 'pattern') {
      const patternEvent = event as PatternEvent;

      const results: SampleEvent[] = [];

      const kit = patternEvent.value.kit;

      for (const event of patternEvent.value.events) {
        const resultEvent: SampleEvent = {
          sampleId: `${kit}/${event.src}`,
          offsetSeconds: this.convertPlayheadPositionToSeconds(
            patternEvent.when + (event.tick - 1) / 16
          ),
          triggered: patternEvent.triggered,
          effects: patternEvent.effects,
          playbackRate: 1,
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

    // const samplerSequence: SamplerSequence = {
    //   instrument,
    //   events: generatedNotes.map(({note, tick}) => ({
    //     notes: [note],
    //     when: this.convertPlayheadPositionToSeconds(
    //       chordEvent.when + (tick - 1) / 16
    //     ),
    //   })),
    // };

    return [
      {
        //samplerSequence,
        sampleId: 'sampler',
        offsetSeconds: this.convertPlayheadPositionToSeconds(chordEvent.when),
        triggered: chordEvent.triggered,
        effects: chordEvent.effects,
        playbackRate: 1,
        pitchShift: 0,
      },
    ];

    // generatedNotes.forEach(note => {
    //   const sampleId = this.getSampleForNote(note.note, instrument);
    //   if (sampleId !== null) {
    //     const noteWhen = chordEvent.when + (note.tick - 1) / 16;

    //     results.push({
    //       sampleId,
    //       offsetSeconds: this.convertPlayheadPositionToSeconds(noteWhen),
    //       playbackRate: 1,
    //       pitchShift: 0,
    //       ...event,
    //     });
    //   }
    // });

    // return results;
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
        const lengthSeconds = (event.length / 16) * this.secondsPerMeasure();
        samples.push({
          sampleId,
          offsetSeconds: this.convertPlayheadPositionToSeconds(eventWhen),
          lengthSeconds,
          triggered,
          effects,
          playbackRate: 1,
          pitchShift: 0,
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

  private validateKey(key: Key): Key {
    if (Key[key] === undefined) {
      console.warn('Invalid key. Defaulting to C');
      return Key.C;
    }

    return key;
  }

  setupInstruments(onLoadFinished?: LoadFinishedCallback) {
    const library = MusicLibrary.getInstance();
    if (library === undefined) {
      console.warn('no library');
      return;
    }

    const samplerFolders = library.groups[0].folders.filter(
      folder => folder.type === 'instrument' || folder.type === 'kit'
    );

    samplerFolders.forEach(folder => {
      const sampleMap = folder.sounds.reduce((map, sound, index) => {
        map[sound.note || index] = `${folder.path}/${sound.src}`;
        return map;
      }, {} as {[note: number]: string});

      this.tonePlayer.loadInstrument(folder.path, sampleMap, {
        updateLoadProgress: this.updateLoadProgress,
        onLoadFinished,
      });
    });
  }
}
