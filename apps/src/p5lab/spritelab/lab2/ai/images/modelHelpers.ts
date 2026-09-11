import {createGoogleGenerativeAI} from '@ai-sdk/google';

import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {ImageType} from './types';

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

// Character-set frames: Flash, like single images; one constant to flip.
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

// Character-set frames store at a 512px cell (characterSet.ts), but asking
// the model for '512' would skip the downscale that anti-aliases the stored
// frame — and the gateway's SDK copy rejects '512' anyway (above).
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
// Per image type: sprites and blocks read best chunky (64x64 logical), but a
// background carries a whole scene, so it gets a finer grid (128x128).
// Halving again (256x256 = 4px blocks) would sit AT detection's 4px floor,
// and the model tends to paint finer than asked — 128 is as fine as the
// pipeline can hold.
export const ASSUMED_BLOCK: Record<ImageType, number> = {
  sprite: 16,
  block: 16,
  background: 8,
};

// Stored ceilings for smooth-style images: generation downscales the model's
// 1K output once at save, and the blank paint canvas opens at the same size
// so painted images land at the ceilings by construction. 512/256 cover
// typical on-screen sizes 1:1; a large story-scene sprite on a high-density
// screen can exceed 512 and render softer — the accepted tradeoff. Pixel
// style keeps its grid-normalized sizing; backgrounds keep full resolution
// (zoom magnifies them).
export const STORED_MAX_PX: {[type in ImageType]?: number} = {
  sprite: 512,
  block: 256,
};

export function getTextModel() {
  return googleProvider(AiChatModelIds.GEMINI_2_5_FLASH);
}
