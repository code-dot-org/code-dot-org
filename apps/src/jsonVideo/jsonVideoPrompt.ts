import {queryParams} from '@cdo/apps/code-studio/utils';
import {jsonVideoFiles} from '@cdo/apps/jsonVideo/jsonVideoFiles';

const showAiTutorVideos = queryParams('show-ai-tutor-videos') === 'true';

const videoDescriptions = jsonVideoFiles
  .map(jsonVideoFile => `${jsonVideoFile.url}::${jsonVideoFile.description}`)
  .join('\n');

export const jsonVideoPrompt = showAiTutorVideos
  ? `The following videos are available for the user to watch if they are helpful (provided in format: VIDEO-URL::VIDEO-DESCRIPTION) \n${videoDescriptions} \n. Please add a video using "[video](VIDEO-URL)" (where VIDEO-URL is swapped out with the url) to your response ONLY if the video's description matches what the student needs to understand currently.\n`
  : ``;
