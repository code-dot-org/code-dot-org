import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

/**
 * Model parameters provided to the LLM chat endpoint.
 */
export interface ModelParameters {
  selectedModelId: ValueOf<typeof AiChatModelIds>;
  temperature: number;
  systemPrompt: string;
  retrievalContexts: string[];
  responseJsonSchema?: object;
}

/** Metadata about a given model, common across all aichat levels */
export type ModelDescription = (typeof modelsJson)[number] & {
  id: ValueOf<typeof AiChatModelIds>;
};
