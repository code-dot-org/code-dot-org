import {createGoogleGenerativeAI} from '@ai-sdk/google';
import {createOpenAI} from '@ai-sdk/openai';
import {type LanguageModel} from 'ai';

import {ValueOf} from '@cdo/apps/types/utils';
import {
  AiChatGeminiModelIds,
  AiChatModelIds,
} from '@cdo/generated-scripts/sharedConstants';

type ModelId = ValueOf<typeof AiChatModelIds>;

const googleProvider = createGoogleGenerativeAI({
  apiKey: '',
});

const openAiProvider = createOpenAI({
  apiKey: '',
});

const modelMap: {
  [key in ModelId]?: LanguageModel;
} = {
  ...Object.fromEntries(
    AiChatGeminiModelIds.map(id => [id, googleProvider(id)])
  ),
  [AiChatModelIds.CHATGPT]: openAiProvider(AiChatModelIds.CHATGPT),
};

export function getModel(modelId: ModelId) {
  if (!modelMap[modelId]) {
    throw new Error('Unsupported model ID: ' + modelId);
  }
  return modelMap[modelId]!;
}

export function getTranscriptionModel() {
  return openAiProvider.transcription('whisper-1');
}
