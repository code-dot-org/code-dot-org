import {createGoogleGenerativeAI} from '@ai-sdk/google';

import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

// The API key is injected server-side by the aiGateway proxy.
const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

/**
 * What an image model can do, and how to reach it. The two models we offer
 * are not interchangeable: Gemini 2.5 Flash Image is a language model that
 * emits image parts, so it rides generateText and takes a seed and a
 * temperature; gpt-image-1 is an image model reached through generateImage,
 * and takes neither. Every difference the dialog or the pipeline has to
 * respect is a field here, so a model swap forces them into view rather than
 * failing silently at the provider.
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
  [AiChatModelIds.GEMINI_2_5_FLASH_IMAGE]: {
    id: AiChatModelIds.GEMINI_2_5_FLASH_IMAGE,
    label: 'Gemini 2.5 Flash Image',
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
  AiChatModelIds.GEMINI_2_5_FLASH_IMAGE;

/** Every model the dialog may offer, in the order it offers them. */
export const IMAGE_MODEL_IDS: string[] = [
  AiChatModelIds.GEMINI_2_5_FLASH_IMAGE,
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
 */
export function getImageModel(id?: string) {
  const spec = getImageModelSpec(id);
  return spec.transport === 'generateText' ? googleProvider(spec.id) : spec.id;
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
