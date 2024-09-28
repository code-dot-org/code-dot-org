import {PlaybackEvent} from './PlaybackEvent';

/**
 * A playback event representing a tune played on a specific instrument
 */
export interface TuneEvent extends PlaybackEvent {
  type: 'tune';
  value: TuneEventValue;
}

export interface TuneEventValue {
  instrument: string;
  events: TuneTickEvent[];
}

export interface TuneTickEvent {
  tick: number;
  note: number;
}

export interface InstrumentEvent extends PlaybackEvent {
  type: 'instrument';
  value: InstrumentEventValue;
}

export interface InstrumentEventValue {
  instrument: string;
  events: InstrumentTickEvent[];
}

export interface InstrumentTickEvent {
  tick: number;
  note: number;
}
