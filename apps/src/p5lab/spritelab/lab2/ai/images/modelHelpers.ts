import {createGoogleGenerativeAI} from '@ai-sdk/google';

import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// The API key is injected server-side by the aiGateway proxy.
const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

// Gemini 3.1 Flash Image ("Nano Banana 2") for single images. Its
// predecessor, gemini-2.5-flash-image, is deprecated by Google. It takes up
// to four character reference images per request and thinks before drawing,
// returning its interim drafts as images ahead of the final one — see
// requestImage for how the final is picked.
export function getImageModel() {
  return googleProvider(AiChatModelIds.GEMINI_3_1_FLASH_IMAGE);
}

// Character-set frames: Flash, like single images. Gemini 3 Pro Image was
// tried and drew worse frames at twice the price. One constant to flip.
export const CHARACTER_SET_IMAGE_MODEL = AiChatModelIds.GEMINI_3_1_FLASH_IMAGE;

export function getCharacterSetImageModel() {
  return googleProvider(CHARACTER_SET_IMAGE_MODEL);
}

// Output sizes the model offers. The gateway forwards provider options to
// the model untouched, but its own copy of the Google SDK validates them
// first, and the copy it runs today (@ai-sdk/google 3.x) knows only 1K, 2K
// and 4K; '512' arrived in 4.x. Bumping the gateway's @ai-sdk/google-vertex
// to 5.x is what unlocks the smaller size.
export type ImageSize = '512' | '1K' | '2K' | '4K';

// Single sprites and backgrounds: the size the rest of this pipeline assumes
// (MODEL_OUTPUT_PX below); larger costs more and would only be scaled down.
export const SINGLE_IMAGE_SIZE: ImageSize = '1K';

// Character-set frames are stored at a 768px cell; '512' would trade that
// detail away and is not obviously enough. Revisit once the gateway
// accepts it.
export const CHARACTER_SET_IMAGE_SIZE: ImageSize = '1K';

/** Provider options for one image request: the given size, square. */
export function imageProviderOptions(imageSize: ImageSize) {
  return {
    google: {
      imageConfig: {aspectRatio: '1:1', imageSize},
    },
  };
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
