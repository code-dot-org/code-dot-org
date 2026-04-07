import {jsonVideoFiles} from '@cdo/apps/jsonVideo/jsonVideoFiles';

const videoLines = jsonVideoFiles
  .map(
    jsonVideoFile =>
      `{"url": "${
        jsonVideoFile.url
      }", "description": "${jsonVideoFile.description.replace(/"/g, '\\"')}"}`
  )
  .join('\n');

export const getJsonVideoPrompt = (enabled: boolean) =>
  enabled
    ? `The following tutorial videos may be shared with the student. Use at most one per response, only if it directly addresses the concept they currently need. Do not include a video that has already appeared earlier in this conversation.

Available videos:
${videoLines}

When including a video, copy the url field exactly as shown — including the leading slash — and use this markdown syntax on its own line:
[Watch this video](URL)

Example: [Watch this video](${jsonVideoFiles[0].url})

Do not modify the URL, append text or descriptions to it, or include it inline within a sentence.
`
    : ``;
