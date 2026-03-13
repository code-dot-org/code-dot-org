import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {createOpenAI} from '@ai-sdk/openai';
import {type LanguageModel} from 'ai';

import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

const openAiProvider = createOpenAI({
  apiKey: '',
});

const modelMap: {
  [key in ValueOf<typeof AiChatModelIds>]?: LanguageModel;
} = {
  [AiChatModelIds.GEMINI_2_5_FLASH_IMAGE]: googleProvider(
    AiChatModelIds.GEMINI_2_5_FLASH_IMAGE
  ),
  [AiChatModelIds.GEMINI_2_5_FLASH]: googleProvider(
    AiChatModelIds.GEMINI_2_5_FLASH
  ),
  [AiChatModelIds.CHATGPT]: openAiProvider(AiChatModelIds.CHATGPT),
};

export function getModel(modelId: ValueOf<typeof AiChatModelIds>) {
  if (!modelMap[modelId]) {
    throw new Error('Unsupported model ID: ' + modelId);
  }
  return modelMap[modelId]!;
}

export function getTranscriptionModel() {
  return openAiProvider.transcription('whisper-1');
}
