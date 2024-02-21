import {Effects} from './interfaces/Effects';

/** Common interface for the internal audio player */
export interface AudioPlayer {
  // TODO: Fill in as we align ToneJSPlayer and SamplePlayer
  getCurrentPosition(): number;
}

/** A single sound played on the timeline */
export interface SampleEvent {
  // 1-based playback position in measures
  playbackPosition: number;
  // 0-based playback time in seconds
  offsetSeconds: number;
  // ID of the sample
  sampleId: string;
  // Whether the sound was triggered
  triggered: boolean;
  // Original BPM of the sample
  originalBpm: number;
  // Pitch shift in semitones
  pitchShift: number;
  // Effects to apply
  effects?: Effects;
  // Length to play the sample for
  lengthSeconds?: number;
}

/** A sequence of notes played on a sampler instrument */
export interface SamplerSequence {
  // Instrument name
  instrument: string;
  // Notes to play
  events: {notes: string[]; playbackPosition: number}[];
}
