import {createGoogleGenerativeAI} from '@ai-sdk/google';

import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// The API key is injected server-side by the aiGateway proxy.
const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

export function getImageModel() {
  return googleProvider(AiChatModelIds.GEMINI_2_5_FLASH_IMAGE);
}

// Image-model output policy, kept beside the model id so a model swap forces
// these into view. The image model emits roughly MODEL_OUTPUT_PX-square
// images; the pixel-art prompt asks for ASSUMED_BLOCK-px blocks, and grid
// detection falls back to the same value — what we ask for and what we
// assume can't drift apart.
export const MODEL_OUTPUT_PX = 1024;
export const ASSUMED_BLOCK = 16;

export function getTextModel() {
  return googleProvider(AiChatModelIds.GEMINI_2_5_FLASH);
}
