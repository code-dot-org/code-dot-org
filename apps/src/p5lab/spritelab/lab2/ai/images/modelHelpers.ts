import {createGoogleGenerativeAI} from '@ai-sdk/google';

import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// The API key is injected server-side by the aiGateway proxy.
const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

// Gemini 3.1 Flash Image ("Nano Banana 2"). Its predecessor,
// gemini-2.5-flash-image, is deprecated by Google. This one takes up to four
// character reference images per request, which is what keeps a character
// set (ai/images/characterSet.ts) looking like one character. It also
// thinks before drawing and returns its interim drafts as images ahead of
// the final one — see requestImage for how the final is picked.
export function getImageModel() {
  return googleProvider(AiChatModelIds.GEMINI_3_1_FLASH_IMAGE);
}

// Provider options for every image request; the gateway forwards them to
// the model untouched. A 1K square is the size the rest of this pipeline
// assumes (MODEL_OUTPUT_PX below); a larger output costs more and would only
// be scaled down.
export const IMAGE_PROVIDER_OPTIONS = {
  google: {imageConfig: {aspectRatio: '1:1', imageSize: '1K'}},
};

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
