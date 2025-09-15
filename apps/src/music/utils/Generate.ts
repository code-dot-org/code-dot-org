import {trySetLocalStorage} from '@cdo/apps/utils';

import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import MusicLibrary from '../player/MusicLibrary';

// Using a constant cache key for now for experimentation.
// We may extend this to be channel/level + user specific.
export const cacheKey = () => `music-ai-generate`;

export interface MusicMetadata {
  playbackEvents: PlaybackEvent[];
  packId?: string;
  libraryName?: string;
}

// Save some information about the generated song, for consumption by dance party.
export const saveGeneratedSongMetadata = (
  channelId: string,
  packId: string,
  events: PlaybackEvent[]
) => {
  trySetLocalStorage(
    cacheKey(),
    JSON.stringify({
      playbackEvents: events,
      packId,
      libraryName: MusicLibrary.getInstance()?.name,
    })
  );
};

export const computeEventMeasures = (events: PlaybackEvent[]) => {
  // simpleEvents is an array of measures that have a significant number of sound events
  // starting at them.  For now, only measures that have more than 2 sounds starting at them
  // should be stored.  Note that measures might be fractional (e.g. 0.5).
  const eventMeasures: number[] = [];
  const measureCounts: {[measure: number]: number} = {};
  events.forEach(event => {
    const measureKey = event.when;
    if (measureKey in measureCounts) {
      measureCounts[measureKey]++;
    } else {
      measureCounts[measureKey] = 1;
    }
  });
  Object.keys(measureCounts).forEach(measure => {
    const measureNumber = parseFloat(measure);
    if (measureCounts[measureNumber] > 2) {
      eventMeasures.push(measureNumber);
    }
  });
  return eventMeasures;
};
