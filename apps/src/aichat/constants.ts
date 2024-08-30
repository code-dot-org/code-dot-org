import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';
import modelsJson from '@cdo/static/aichat/modelDescriptions.json';

import type {ValueOf} from '../types/utils';

import type {ModelDescription, SaveType} from './types';

export const modelDescriptions: ModelDescription[] =
  modelsJson.filter(isValidDescription);

function isValidDescription(
  description: (typeof modelsJson)[number]
): description is ModelDescription {
  return Object.values(AiChatModelIds).includes(
    description.id as ValueOf<typeof AiChatModelIds>
  );
}

export const saveTypeToAnalyticsEvent: {[key in SaveType]: string} = {
  updateChatbot: EVENTS.UPDATE_CHATBOT,
  publishModelCard: EVENTS.PUBLISH_MODEL_CARD_INFO,
  saveModelCard: EVENTS.SAVE_MODEL_CARD_INFO,
};

export const MAX_NAME_LENGTH = 15;
