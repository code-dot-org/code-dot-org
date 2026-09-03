import {createGoogleGenerativeAI} from '@ai-sdk/google';

import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// The API key is injected server-side by the aiGateway proxy.
const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

/**
 * What an image model can do, and how to reach it. The models we offer are
 * not interchangeable: Gemini 3.1 Flash Image is a language model that emits
 * image parts, so it rides generateText and takes a seed and a temperature;
 * gpt-image-1 is an image model reached through generateImage, and takes
 * neither. Every difference the dialog or the pipeline has to respect is a
 * field here, so a model swap forces them into view rather than failing
 * silently at the provider.
 */
export interface ImageModelSpec {
  id: string;
  /** Shown in the dialog's Model choice. */
  label: string;
  transport: 'generateText' | 'generateImage';
  /** Roughly the square edge the model emits, in physical pixels. */
  outputPx: number;
  /** Sending the same seed twice asks for the same image. */
  supportsSeed: boolean;
  supportsTemperature: boolean;
  /** Can redraw a supplied image rather than starting from scratch. */
  supportsEdit: boolean;
  /**
   * Emits a real alpha channel on request. Models without it get the flat
   * key color prompt and the local flood fill instead (see removeBackground).
   */
  nativeTransparency: boolean;
}

export const IMAGE_MODEL_SPECS: Record<string, ImageModelSpec> = {
  // Gemini 3.1 Flash Image ("Nano Banana 2"). Its predecessor,
  // gemini-2.5-flash-image, is deprecated by Google and is not offered.
  [AiChatModelIds.GEMINI_3_1_FLASH_IMAGE]: {
    id: AiChatModelIds.GEMINI_3_1_FLASH_IMAGE,
    label: 'Gemini 3.1 Flash Image',
    transport: 'generateText',
    outputPx: 1024,
    supportsSeed: true,
    supportsTemperature: true,
    supportsEdit: true,
    nativeTransparency: false,
  },
  [AiChatModelIds.GPT_IMAGE_1]: {
    id: AiChatModelIds.GPT_IMAGE_1,
    label: 'OpenAI GPT Image 1',
    transport: 'generateImage',
    outputPx: 1024,
    // The provider warns and ignores; see ImageModelV3's unsupported warning.
    supportsSeed: false,
    supportsTemperature: false,
    supportsEdit: true,
    nativeTransparency: true,
  },
};

export const DEFAULT_IMAGE_MODEL_ID: string =
  AiChatModelIds.GEMINI_3_1_FLASH_IMAGE;

/** Every model the dialog may offer, in the order it offers them. */
export const IMAGE_MODEL_IDS: string[] = [
  AiChatModelIds.GEMINI_3_1_FLASH_IMAGE,
  AiChatModelIds.GPT_IMAGE_1,
];

/** Falls back to the default for an id no longer offered (an old project). */
export function getImageModelSpec(id?: string): ImageModelSpec {
  return (
    IMAGE_MODEL_SPECS[id ?? ''] || IMAGE_MODEL_SPECS[DEFAULT_IMAGE_MODEL_ID]
  );
}

/**
 * What to hand the gateway as its `model`. The generateText path wants an AI
 * SDK model object because that is what its callers pass everywhere else;
 * the generateImage path takes the bare id, so the OpenAI provider package
 * never has to enter this bundle.
 *
 * Called with no argument this is the default single-image model, which is
 * what the character-set and single-image paths both assumed before there
 * was a choice.
 */
export function getImageModel(id?: string) {
  const spec = getImageModelSpec(id);
  return spec.transport === 'generateText' ? googleProvider(spec.id) : spec.id;
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

// Image-model output policy. The image models emit roughly
// MODEL_OUTPUT_PX-square images; the pixel-art prompt asks for
// ASSUMED_BLOCK-px blocks, and grid detection falls back to the same value —
// what we ask for and what we assume can't drift apart. ASSUMED_BLOCK is a
// prompt-and-detection contract, shared by every model.
export const MODEL_OUTPUT_PX = 1024;
export const ASSUMED_BLOCK = 16;

export function getTextModel() {
  return googleProvider(AiChatModelIds.GEMINI_2_5_FLASH);
}
