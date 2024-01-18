import {ChordEvent, ChordEventValue} from './interfaces/ChordEvent';
import {PatternEvent, PatternEventValue} from './interfaces/PatternEvent';
import {PlaybackEvent} from './interfaces/PlaybackEvent';
import {SoundEvent} from './interfaces/SoundEvent';
import MusicLibrary from './MusicLibrary';
import {generateNotesFromChord, ChordNote} from '../utils/Chords';
import {getFullNoteName, Key} from '../utils/Notes';
import {Effects} from './interfaces/Effects';
import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LoadFinishedCallback} from '../types';
import ToneJSPlayer, {SamplerSequence, Sound} from './ToneJSPlayer';

// Using require() to import JS in TS files
const constants = require('../constants');

// Default to 4/4 time, 120 BPM, C Major
const DEFAULT_BPM = 120;
const DEFAULT_KEY = Key.C;

/**
 * Main music player component which maintains the list of playback events and
 * uses a {@link SamplePlayer} to play sounds.
 */
export default class MusicPlayer {
  private readonly metricsReporter: LabMetricsReporter;

  private bpm: number = DEFAULT_BPM;
  private key: Key = DEFAULT_KEY;
  private updateLoadProgress: ((value: number) => void) | undefined;

  constructor(
    bpm: number = DEFAULT_BPM,
    key: Key = DEFAULT_KEY,
    metricsReporter: LabMetricsReporter = Lab2Registry.getInstance().getMetricsReporter(),
    private readonly tonePlayer: ToneJSPlayer = new ToneJSPlayer()
  ) {
    this.metricsReporter = metricsReporter;
    this.updateConfiguration(bpm, key);
  }

  updateConfiguration(bpm?: number, key?: Key) {
    if (bpm) {
      this.bpm = this.validateBpm(bpm);
      this.tonePlayer.setBpm(this.bpm);
    }
    if (key) {
      this.key = this.validateKey(key);
    }
  }

  setUpdateLoadProgress(updateLoadProgress: (value: number) => void) {
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
    const sampleIds = Array.from(
      new Set(
        events
          .filter(event => event.type === 'sound')
          .map(event => (this.convertEventToSound(event) as Sound).sampleId)
      )
    );

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
  }

  /**
   * Cancels any ongoing previews.
   */
  cancelPreviews() {
    this.tonePlayer.cancelPreviews();
  }

  /**
   * Start playback. Schedules all queued playback events for playback
   * and tells the {@link SamplePlayer} to start playing.
   *
   * @param startPosition to start playback from. Defaults to 1
   * (beginning of song) if not specified.
   */
  playSong(events: PlaybackEvent[], startPosition = 1) {
    // TODO: cleanup - split into separate functions for sound and sequences
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
  }

  /**
   * Stop playback. Tells the {@link SamplePlayer} to stop all sample playback.
   */
  stopSong() {
    this.tonePlayer.stop();
  }

  /**
   * Stop any sounds that have not yet been played if playback is in progress.
   */
  stopAllSoundsStillToPlay() {
    this.tonePlayer.cancelAllEvents();
  }

  // Returns the current playhead position, in floating point for an exact position,
  // 1-based, and scaled to measures.
  // Returns 0 if music is not playing.
  getCurrentPlayheadPosition(): number {
    return this.transportTimeToPlaybackTime(
      this.tonePlayer.getCurrentPosition()
    );
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
