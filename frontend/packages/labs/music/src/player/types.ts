import type {Effects} from './interfaces/Effects';

import type {ImageAttribution, SoundType, SoundFolder} from '../api';
import type {Key} from '../utils/Notes';

/** A sequence of notes played on a sampler instrument */
export interface SamplerSequence {
  // Instrument name
  instrument: string;
  // Notes to play
  events: {notes: string[]; playbackPosition: number}[];
  effects?: Effects;
}

export type PlayerEvent = 'InstrumentLoaded'; // Add more as needed

/**
 * A single event in a {@link SampleSequence}
 */
export interface SequenceEvent {
  /** 1-indexed start position of this event, in 16th notes */
  position: number;
  /**
   * The note value of this event, expressed as a numerical semitone
   * offset from the project root note.
   */
  noteOffset: number;
  /** Length of this event, in 16th notes */
  length: number;
}

/**
 * A sequence of individual samples, used to programmaticaly
 * generate sounds at the current key and BPM.
 */
export interface SampleSequence {
  instrument: string;
  events: SequenceEvent[];
}

export interface SoundData {
  name: string;
  path?: string;
  src: string;
  length: number;
  pickupLength?: number;
  type: SoundType;
  note?: number;
  restricted?: boolean;
  sequence?: SampleSequence;
  bpm?: number;
  key?: Key;
  skipLocalization?: boolean;
}

export type SoundFolderType = 'sound' | 'kit' | 'instrument';

export interface Sounds {
  [category: string]: string[];
}

export interface Translations {
  [key: string]: string;
}

/** A single sound */
export interface Sample {
  // A unique identifier for this sample
  key: string;
  // The library path for the sound
  library: string;
  // The pack for the sound
  folder: SoundFolder;
  // The location of the sample in the pack
  soundData: SoundData;
}

/** A single sound played on the timeline */
export interface SampleEvent extends Sample {
  // 1-based playback position in measures
  playbackPosition: number;
  // The length of an optional "pickup" part of the sample, which is effectively how early to start
  // playing it.  Specified as a fraction of one measure.
  pickupLength?: number;
  // ID of the sound
  id: string;
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

export type SampleMap = {[note: number]: Sample};

export interface InstrumentData {
  instrumentName: string;
  sampleMap: SampleMap;
}

export interface ImageAttributionCopyright extends ImageAttribution {
  artist: string;
}
