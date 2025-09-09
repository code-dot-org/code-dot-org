import {PlaybackEvent} from './PlaybackEvent';

export interface InstrumentEvent extends PlaybackEvent {
  type: 'instrument';
  value: InstrumentEventValue;
  /** Type of the instrument. Used only for visual and validation purposes */
  instrumentType: 'drums' | 'melodic';
}

export type ScaleMode = 'simple' | 'chromatic';

export interface InstrumentEventValue {
  /** Name of the instrument to play notes on. */
  instrument: string;
  /** Note events. */
  events: InstrumentTickEvent[];
  /** Total length in measures (even if there are fewer notes). */
  length: 1 | 2;
  /** If the notes were partially generated using AI. */
  ai?: boolean;
  /** If the notes are relative, e.g. note 0 is the tonic in the default octave for the current key. */
  relative?: boolean;
  /** For a tune, the set of notes available to be played. */
  scaleMode?: ScaleMode;
}

/** A single note event. Ticks are 1-based and refer to 16th note subdivisions */
export interface InstrumentTickEvent {
  note: number;
  tick: number;
}

export function isInstrumentEvent(
  event: PlaybackEvent
): event is InstrumentEvent {
  return event.type === 'instrument';
}
