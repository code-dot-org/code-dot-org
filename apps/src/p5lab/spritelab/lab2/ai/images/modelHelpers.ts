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

// Character-set frames: Gemini 3 Pro Image ("Nano Banana Pro"), about twice
// the price of Flash per picture, five character references, and the
// stronger reasoning about a compound instruction — this character, in
// that pose — that Flash kept failing at (it honoured either the plate or
// the figure, not both). One constant to flip back.
export const CHARACTER_SET_IMAGE_MODEL = AiChatModelIds.GEMINI_3_PRO_IMAGE;

export function getCharacterSetImageModel() {
  return googleProvider(CHARACTER_SET_IMAGE_MODEL);
}

// How hard an image model thinks before drawing. Vertex refuses the
// parameter for the image models ("thinking_level is not supported by this
// model", live, 2026-08-25), so it stays unset; the plumbing remains for a
// model that does take it.
export type ThinkingLevel = 'minimal' | 'low' | 'medium' | 'high';
export const CHARACTER_SET_THINKING_LEVEL: ThinkingLevel | undefined =
  undefined;

// Output sizes the model offers. The gateway forwards provider options to
// the model untouched, but its own copy of the Google SDK validates them
// first, and the copy it runs today (@ai-sdk/google 3.x) knows only 1K, 2K
// and 4K; '512' arrived in 4.x. Bumping the gateway's @ai-sdk/google-vertex
// to 5.x is what unlocks the smaller size.
export type ImageSize = '512' | '1K' | '2K' | '4K';

// Single sprites and backgrounds: the size the rest of this pipeline assumes
// (MODEL_OUTPUT_PX below); larger costs more and would only be scaled down.
export const SINGLE_IMAGE_SIZE: ImageSize = '1K';

// Character-set frames end up scaled to a ~360px cell, so most of a 1K
// frame is thrown away; '512' is the size to try once the gateway accepts
// it. One constant to flip.
export const CHARACTER_SET_IMAGE_SIZE: ImageSize = '1K';

/**
 * Provider options for one image request: a square at the given size, and
 * optionally a thinking level (omitted = the model's default).
 */
export function imageProviderOptions(
  imageSize: ImageSize,
  thinkingLevel?: ThinkingLevel
) {
  return {
    google: {
      imageConfig: {aspectRatio: '1:1', imageSize},
      ...(thinkingLevel && {thinkingConfig: {thinkingLevel}}),
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
