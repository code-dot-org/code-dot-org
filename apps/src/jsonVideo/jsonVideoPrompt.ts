import {queryParams} from '@cdo/apps/code-studio/utils';
import {jsonVideoFiles} from '@cdo/apps/jsonVideo/jsonVideoFiles';

const showAiTutorVideos = queryParams('show-ai-tutor-videos') === 'true';

const videoLines = jsonVideoFiles
  .map(
    f =>
      `{"url": "${f.url}", "description": "${f.description.replace(
        /"/g,
        '\\"'
      )}"}`
  )
  .join('\n');

export const jsonVideoPrompt = showAiTutorVideos
  ? `The following tutorial videos may be shared with the student. Use at most one per response, only if it directly addresses the concept they currently need. Do not include a video that has already appeared earlier in this conversation.

Available videos:
${videoLines}

When including a video, copy the url field exactly as shown — including the leading slash — and use this markdown syntax on its own line:
[Watch this video](URL)

Example: [Watch this video](${jsonVideoFiles[0].url})

Do not modify the URL, append text or descriptions to it, or include it inline within a sentence.
`
  : ``;
