export type JsonVideoFileMetadata = {
  description: string;
  url: string;
};

export const getJsonVideoPrompt = (
  videos: JsonVideoFileMetadata[] | undefined,
  useJsonSchema?: boolean
) => {
  if (!videos || videos.length === 0) {
    return ``;
  }

  const videoLines = videos
    .map(
      video =>
        `{"url": "${video.url}", "description": "${video.description.replace(
          /"/g,
          '\\"'
        )}"}`
    )
    .join('\n');

  if (useJsonSchema) {
    return `

The following tutorial videos may be shared with the student. Use at most one per response, only if it directly addresses the concept they currently need. Do not include a video that has already appeared earlier in this conversation.

Available videos:
${videoLines}

When including a video, set the \`videoUrl\` field in your JSON response to the url value exactly as shown — including the leading slash. Otherwise omit the \`videoUrl\` field entirely.

Do not modify the URL.
`;
  }

  return `

The following tutorial videos may be shared with the student. Use at most one per response, only if it directly addresses the concept they currently need. Do not include a video that has already appeared earlier in this conversation.

Available videos:
${videoLines}

When including a video, copy the url field exactly as shown — including the leading slash — and use this markdown syntax on its own line:
[Watch this video](URL)

Example: [Watch this video](${videos[0].url})

Do not modify the URL, append text or descriptions to it, or include it inline within a sentence.
`;
};
