import {Effects} from './interfaces/Effects';

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
