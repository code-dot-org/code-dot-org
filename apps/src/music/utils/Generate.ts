import {trySetLocalStorage} from '@cdo/apps/utils';

import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';

// Save some information about the generated song, for consumption by dance party.
export const saveGeneratedSongMetadata = (
  channelId: string,
  packId: string,
  bpm: number,
  events: PlaybackEvent[]
) => {
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

  trySetLocalStorage(
    'music-ai-generate',
    JSON.stringify({channelId, packId, bpm, eventMeasures})
  );
};
