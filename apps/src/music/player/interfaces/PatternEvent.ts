import {PlaybackEvent} from './PlaybackEvent';

/**
 * A playback event representing a pattern of sounds
 */
export interface PatternEvent extends PlaybackEvent {
  type: 'pattern';
  value: PatternEventValue;
}

export interface PatternEventValue {
  instrument: string;
  length?: 1 | 2;
  events: PatternTickEvent[];
  ai?: boolean;
}

export interface PatternTickEvent {
  tick: number;
  note: number;
}
