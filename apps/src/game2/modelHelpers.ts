import {createGoogleGenerativeAI} from '@ai-sdk/google';

import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

export function getImageModel() {
  return googleProvider(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE);
}
