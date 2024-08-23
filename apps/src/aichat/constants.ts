import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

import type {ModelDescription, SaveType} from './types';

// Build the model descriptions list from the JSON file. Only include valid model IDs.
const modelDescriptions: ModelDescription[] = [];
Object.values(AiChatModelIds).forEach(modelId => {
  const description = modelsJson[modelId];
  if (description) {
    modelDescriptions.push({
      id: modelId,
      ...description,
    });
  }
});
export {modelDescriptions};

export const saveTypeToAnalyticsEvent: {[key in SaveType]: string} = {
  updateChatbot: EVENTS.UPDATE_CHATBOT,
  publishModelCard: EVENTS.PUBLISH_MODEL_CARD_INFO,
  saveModelCard: EVENTS.SAVE_MODEL_CARD_INFO,
};

export const MAX_NAME_LENGTH = 15;
