import {AdlibsType} from '@cdo/apps/lab2/views/components/guide/Adlib';
import getRandomInt from '@cdo/apps/util/getRandomInt';
import HttpClient from '@cdo/apps/util/HttpClient';
import {trySetLocalStorage} from '@cdo/apps/utils';
import {AiInteractionStatus} from '@cdo/generated-scripts/sharedConstants';

import {baseAssetUrl} from '../../constants';
import {PlaybackEvent} from '../../player/interfaces/PlaybackEvent';
import MusicLibrary from '../../player/MusicLibrary';

import askAi from './askAi';
import {GenerateContext} from './GenerateCodeContent';

// Using a constant cache key for now for experimentation.
// We may extend this to be channel/level + user specific.
export const cacheKey = () => `music-ai-generate`;

export interface MusicMetadata {
  playbackEvents: PlaybackEvent[];
  lastMeasure: number;
  packId?: string;
  libraryName?: string;
}

// Save some information about the generated song, for consumption by Dance Party.
export const saveGeneratedSongMetadata = (
  channelId: string,
  packId: string,
  events: PlaybackEvent[],
  lastMeasure: number
) => {
  trySetLocalStorage(
    cacheKey(),
    JSON.stringify({
      playbackEvents: events,
      lastMeasure,
      packId,
      libraryName: MusicLibrary.getInstance()?.name,
    })
  );
};

// Compute interesting measures in the song, which will be used by Dance Party.
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

// Generate song code using AI.
export const generateSongAi = async (
  contextText: string,
  packId: string,
  promptText: string
) => {
  const library = MusicLibrary.getInstance();
  const sounds =
    library
      ?.getFolderForFolderId(packId || 'indie')
      ?.sounds?.map(sound => {
        if (sound.type !== 'preview') {
          return `"${packId}/${sound.src}" (${sound.length} measures)`;
        }
      })
      .filter(sound => sound !== undefined)
      .join(', ') || '';

  const drumSounds =
    library
      ?.getAvailableSounds()
      .filter(folder => folder.id !== packId)
      .map(folder =>
        folder.sounds
          .filter(sound => sound.type === 'beat')
          .map(sound => {
            return `"${folder.id}/${sound.src}" (${sound.length} measures)`;
          })
      )
      .flat()
      .join(', ') || '';

  console.log('Starting AI ask...');

  const result = await askAi(
    'Here is the context: \n\n' +
      GenerateContext(contextText, sounds, drumSounds) +
      '\n\n And here is the request: \n\n' +
      promptText
  );

  if (result.length > 1 && result[1].status === AiInteractionStatus.OK) {
    const pseudocode = result[1].chatMessageText.replaceAll('```', '');
    console.log('AI code generated.');
    return pseudocode;
  } else {
    console.error('Error getting AI response.');
  }
};

// Generate song code by retrieving from an online cache.
export const generateSongCache = async (
  adlibs: AdlibsType,
  adlibOption: string,
  packId: string,
  choices: string[] | undefined
) => {
  const variant = getRandomInt(0, adlibs[adlibOption].variantCount - 1);
  const joinedChoices = choices?.join('-');
  const cacheFilePath = `${baseAssetUrl}generate/music/${packId}-${adlibOption}-${joinedChoices}-${variant
    .toString()
    .padStart(2, '0')}.txt`;
  console.log(cacheFilePath);

  const startTime = Date.now();
  try {
    const response = await HttpClient.get(cacheFilePath);
    const pseudocode = await response.text();

    const elapsedTime = Date.now() - startTime;
    const delayDuration = 2000; // 2 seconds.
    const remainingDelayDuration = Math.max(delayDuration - elapsedTime, 0);
    await new Promise(res => setTimeout(res, remainingDelayDuration));

    return pseudocode;
  } catch (error) {
    console.error('Error retrieving cached code.');
  }
};
