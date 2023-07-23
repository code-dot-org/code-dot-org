import {PlaybackEvent} from './PlaybackEvent';

/**
 * This is very similar to {@link FunctionContext}, but also contains
 * all playback events that occur in the function. This model will be
 * useful for timeline rendering, but as of now is only used within this
 * class.
 */
export interface FunctionEvents {
  name: string;
  uniqueInvocationId: number;
  playbackEvents: PlaybackEvent[];
  calledFunctionIds: number[];
  startMeasure: number;
  endMeasure: number;
}
