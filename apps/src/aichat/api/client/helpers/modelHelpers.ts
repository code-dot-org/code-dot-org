import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {createOpenAI} from '@ai-sdk/openai';
import {type LanguageModel} from 'ai';

import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

type ModelId = ValueOf<typeof AiChatModelIds>;

const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

const openAiProvider = createOpenAI({
  apiKey: '',
});

// All models served via the Google provider. isGeminiModel is derived from this
// list, so adding a model here is the only change needed to extend gateway support.
const googleModelIds: ModelId[] = [
  AiChatModelIds.GEMINI_2_5_FLASH_IMAGE,
  AiChatModelIds.GEMINI_2_5_FLASH,
  AiChatModelIds.GEMINI_2_0_FLASH,
  AiChatModelIds.GEMINI_2_5_PRO,
  AiChatModelIds.GEMINI_2_5_FLASH_LITE,
];

const modelMap: {
  [key in ModelId]?: LanguageModel;
} = {
  ...Object.fromEntries(googleModelIds.map(id => [id, googleProvider(id)])),
  [AiChatModelIds.CHATGPT]: openAiProvider(AiChatModelIds.CHATGPT),
};

export function isGeminiModel(modelId: ModelId): boolean {
  return googleModelIds.includes(modelId);
}

export function getModel(modelId: ModelId) {
  if (!modelMap[modelId]) {
    throw new Error('Unsupported model ID: ' + modelId);
  }
  return modelMap[modelId]!;
}

export function getTranscriptionModel() {
  return openAiProvider.transcription('whisper-1');
}
