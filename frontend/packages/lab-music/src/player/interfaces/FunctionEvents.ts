import {PlaybackEvent} from './PlaybackEvent';

/**
 * This is very similar to {@link FunctionContext}, but also contains
 * all playback events that occur in the function.
 */
export interface FunctionEvents {
  name: string;
  procedureID?: string;
  uniqueInvocationId: number;
  playbackEvents: PlaybackEvent[];
  calledFunctionIds: number[];
  startMeasure: number;
  endMeasure: number;
}
