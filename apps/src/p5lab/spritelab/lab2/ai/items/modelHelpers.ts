import {createGoogleGenerativeAI} from '@ai-sdk/google';

import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// The API key is injected server-side by the aiGateway proxy.
const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

export function getImageModel() {
  return googleProvider(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE);
}

export function getTextModel() {
  return googleProvider(AiChatModelIds.GEMINI_2_5_FLASH);
}
