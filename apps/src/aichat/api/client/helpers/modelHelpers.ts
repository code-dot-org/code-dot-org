import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

const supportedModelIds = new Set<string>(Object.values(AiChatModelIds));

export function getModel(modelId: ValueOf<typeof AiChatModelIds>): string {
  if (!supportedModelIds.has(modelId)) {
    throw new Error('Unsupported model ID: ' + modelId);
  }
  return modelId;
}
