import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {createOpenAI} from '@ai-sdk/openai';
import {LanguageModel} from 'ai';

import {ValueOf} from '@cdo/apps/types/utils';
import HttpClient from '@cdo/apps/util/HttpClient';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

const interceptor =
  (provider: string): typeof fetch =>
  (input, init) =>
    HttpClient.post(
      `/ai_api_proxy/${provider}`,
      JSON.stringify({...init, url: input}),
      true,
      {
        'Content-Type': 'application/json; charset=UTF-8',
      }
    );

const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
  fetch: interceptor('google'),
});

const openAiProvider = createOpenAI({
  apiKey: '',
  fetch: interceptor('openai'),
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
