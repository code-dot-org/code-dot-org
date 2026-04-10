import addToAiTutorUrl from '@cdo/static/json/jsonVideo/weblab2/add-to-ai-tutor.json';

import type {JsonVideoFileMetadata} from '@cdo/apps/jsonVideo/jsonVideoPrompt';

/**
 *  Importing from @cdo/static/json doesn't actually import the file but rather a path to
 *  the file. We need to assert the result is a string.
 **/

export const weblab2VideoFiles: JsonVideoFileMetadata[] = [
  {
    description:
      "This video covers how to use the 'Add to AI Tutor' function within Web Lab. It demonstrates how to highlight text to add to AI tutor, and how to add an entire file to AI tutor via the menu in the file pane. The video is a clear walkthrough of how to use the Add to AI Tutor feature in Web Lab",
    url: addToAiTutorUrl as unknown as string,
  },
];
