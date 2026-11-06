import type {GoogleGenerativeAIProviderOptions} from '@ai-sdk/google';

import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

/** How hard a Gemini 3 model thinks before it answers. Gemini 2.5 rejects it. */
export type GeminiThinkingLevel = NonNullable<
  NonNullable<
    GoogleGenerativeAIProviderOptions['thinkingConfig']
  >['thinkingLevel']
>;

/**
 * Model parameters provided to the LLM chat endpoint.
 */
export interface ModelParameters {
  selectedModelId: ValueOf<typeof AiChatModelIds>;
  temperature: number;
  systemPrompt: string;
  retrievalContexts: string[];
  responseJsonSchema?: object;
  /** Sent only through the AI Gateway; the Rails path has its own fixed thinking budget. */
  thinkingLevel?: GeminiThinkingLevel;
}

/** The model a level or host picks for the AI Tutor, in place of its default. */
export type AiTutorModelParameters = Pick<
  ModelParameters,
  'selectedModelId' | 'thinkingLevel'
>;

/** Metadata about a given model, common across all aichat levels */
export type ModelDescription = (typeof modelsJson)[number] & {
  id: ValueOf<typeof AiChatModelIds>;
};
