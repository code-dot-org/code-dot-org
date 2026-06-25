import {createGoogleGenerativeAI} from '@ai-sdk/google';

import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// The API key is injected server-side by the aiGateway proxy; the client passes
// an empty key here. Adapted from Game2 (origin/game2-initial).
const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

export function getImageModel() {
  return googleProvider(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE);
}
