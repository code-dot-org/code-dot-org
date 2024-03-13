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
  events: PatternTickEvent[];
}

export interface PatternTickEvent {
  tick: number;
  src: string;
}
