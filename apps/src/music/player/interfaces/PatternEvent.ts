import {PlaybackEvent} from './PlaybackEvent';

/**
 * A playback event representing a pattern of sounds
 */
export interface PatternEvent extends PlaybackEvent {
  type: 'pattern';
  value: PatternEventValue;
}

export interface PatternEventValue {
  kit: string;
  length?: 1 | 2;
  events: PatternTickEvent[];
}

export interface PatternTickEvent {
  tick: number;
  src: string;
  note: number;
}
