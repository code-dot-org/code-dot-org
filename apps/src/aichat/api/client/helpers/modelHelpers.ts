import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {createOpenAI} from '@ai-sdk/openai';
import {LanguageModel} from 'ai';

import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import {
  GOOGLE_GEMINI_AI_CHAT_LAB_API_KEY,
  OPENAI_STUDENT_LEARNING_API_KEY,
} from './localApiKeys';

const googleProvider = createGoogleGenerativeAI({
  apiKey: GOOGLE_GEMINI_AI_CHAT_LAB_API_KEY,
});

const openAiProvider = createOpenAI({
  apiKey: OPENAI_STUDENT_LEARNING_API_KEY,
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
