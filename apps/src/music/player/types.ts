import {SoundLoadCallbacks} from '../types';

import {Effects} from './interfaces/Effects';

/**
 * Common interface for the internal audio player
 */
export interface AudioPlayer {
  /** If this player supports samplers */
  supportsSamplers(): boolean;

  /** Set the current BPM */
  setBpm(bpm: number): void;

  /** Get the current playback position in 1-based measures */
  getCurrentPlaybackPosition(): number;

  /** Load sounds into the cache */
  loadSounds(
    sampleUrls: string[],
    instruments: InstrumentData[],
    callbacks?: SoundLoadCallbacks
  ): Promise<void>;

  /** Load instrument into the cache */
  loadInstrument(
    instrumentName: string,
    sampleMap: SampleMap,
    callbacks?: SoundLoadCallbacks
  ): Promise<void>;

  /** If the given instrument is currently loading */
  isInstrumentLoading(instrumentName: string): boolean;

  /** If the given instrument has been loaded */
  isInstrumentLoaded(instrumentName: string): boolean;

  /** Play a sample immediately (used for previews) */
  playSampleImmediately(
    sample: SampleEvent,
    onStop?: () => void
  ): Promise<void>;

  playSamplesImmediately(
    samples: SampleEvent[],
    onStop?: () => void
  ): Promise<void>;

  /**
   * Play a sequence of notes immediately (used for previews)
   * @param onTick Callback to call each interval of the sequence (assumed to be a 16th note)
   * @param onStop Callback to call when the sequence is done playing
   */
  playSequenceImmediately(
    sequence: SamplerSequence,
    length: number,
    onTick?: (tick: number) => void,
    onStop?: () => void
  ): Promise<void>;

  /** Cancel active previews */
  cancelPreviews(): void;

  /** Schedule a sample to played */
  scheduleSample(
    sample: SampleEvent,
    onSampleStart: (id: string) => void
  ): void;

  /** Schedule a sampler sequence to be played */
  scheduleSamplerSequence(sequence: SamplerSequence): void;

  /** Start playback from the beginning, or the given position if specified */
  start(startPosition?: number): Promise<void>;

  /** Stop playback */
  stop(): void;

  /** Cancel pending audio events */
  cancelPendingEvents(): void;

  /** Enable/disable looping */
  setLoopEnabled(enabled: boolean): void;

  /** Set the loop start point */
  setLoopStart(loopStart: number): void;

  /** Set the loop end point */
  setLoopEnd(loopEnd: number): void;

  /** Jump to the given playback position */
  jumpToPosition(position: number): void;

  registerCallback(
    event: PlayerEvent,
    callback: (payload?: string) => void
  ): void;
}

/** A single sound played on the timeline */
export interface SampleEvent {
  // 1-based playback position in measures
  playbackPosition: number;
  // ID of the sound
  id: string;
  // URL of the sample
  sampleUrl: string;
  // Whether the sound was triggered
  triggered: boolean;
  // Original BPM of the sample
  originalBpm: number;
  // Pitch shift in semitones
  pitchShift: number;
  // Effects to apply
  effects?: Effects;
  // Length in measures to play the sample for
  length?: number;
  // Whether tempo should not be adjusted.
  disableTempoAdjustment?: boolean;
}

/** A sequence of notes played on a sampler instrument */
export interface SamplerSequence {
  // Instrument name
  instrument: string;
  // Notes to play
  events: {notes: string[]; playbackPosition: number}[];
  effects?: Effects;
}

export type SampleMap = {[note: number]: string};

export interface InstrumentData {
  instrumentName: string;
  sampleMap: SampleMap;
}

export type PlayerEvent = 'InstrumentLoaded'; // Add more as needed
