import {PlaybackEvent} from './PlaybackEvent';

/**
 * A playback event representing a chord played on a specific instrument
 */
export interface ChordEvent extends PlaybackEvent {
  type: 'chord';
  value: ChordEventValue;
}

export interface ChordEventValue {
  instrument: string;
  notes: number[];
  playStyle: PlayStyle;
}

export type PlayStyle =
  | 'arpeggio-up'
  | 'arpeggio-down'
  | 'arpeggio-random'
  | 'together';
