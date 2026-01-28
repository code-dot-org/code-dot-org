import {queryParams} from '@cdo/apps/code-studio/utils';

import jsonAssets from './json-video-files';

const showAiTutorVideos = queryParams('show-ai-tutor-videos') === 'true';

const videoDescriptions = Object.entries(jsonAssets)
  .map(([filename, jsonAsset]) => {
    try {
      const asset = JSON.parse(jsonAsset);
      if (asset.description) {
        return `${filename}::${asset.description}`;
      }
    } catch {}
  })
  .filter(filenamePlusDescription => filenamePlusDescription)
  .join('\n');

export const jsonVideoPrompt = showAiTutorVideos
  ? `The following videos are available for the user to watch if they are helpful(provided in format: [VIDEO-FILENAME]::[VIDEO-DESCRIPTION]) \n${videoDescriptions} \n. Please add a video using "[video](https://json-video.org/[VIDEO-FILENAME])" (where [VIDEO-FILENAME] is swapped out with the filename) to your response ONLY if the video's description matches what the student needs to understand currently.\n`
  : ``;
