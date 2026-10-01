import type {FunctionEvents} from './interfaces/FunctionEvents';
import type {PlaybackEvent} from './interfaces/PlaybackEvent';

/** A compiled Music Lab song, as another lab plays it. */
export interface MusicMetadata {
  channelId: string;
  playbackEvents: PlaybackEvent[];
  orderedFunctions: FunctionEvents[];
  lastMeasure: number;
  packId?: string;
  libraryName?: string;
}

/**
 * The measures at which more than two sounds start; a dancing or animating
 * host can key off them. Measures may be fractional.
 */
export const computeEventMeasures = (events: PlaybackEvent[]): number[] => {
  const measureCounts: {[measure: number]: number} = {};
  events.forEach(event => {
    measureCounts[event.when] = (measureCounts[event.when] || 0) + 1;
  });
  return Object.keys(measureCounts)
    .map(measure => parseFloat(measure))
    .filter(measure => measureCounts[measure] > 2);
};
